// MARK: Imports
import * as path from "node:path";
import * as vscode from "vscode";

import type { CallEdge, CallNode } from "../../shared/types";
import type { EntryPointCache } from "../matchers/entry-point-cache";
import { matchEntryPoint } from "../matchers/match-entry-point";

// MARK: Utilities
const TEST_FILE_PATTERNS = [
  /\.(test|spec)\.(ts|tsx|js|jsx|mjs)$/,
  /__tests__\//,
  /\.test\//,
  /\/tests?\//,
  /(?:^|\/)test_[^/]+\.py$/,
  /[^/]+_test\.py$/,
  /[^/]+_test\.go$/,
];

function isTestFile(filePath: string): boolean {
  return TEST_FILE_PATTERNS.some((p) => p.test(filePath));
}

function toNodeId(item: vscode.CallHierarchyItem): string {
  const uri = item.uri.fsPath;
  const line = item.selectionRange.start.line;
  return `${uri}:${item.name}:${line}`;
}

function toCallNode(
  item: vscode.CallHierarchyItem,
  entryPointResult: ReturnType<typeof matchEntryPoint>,
): CallNode {
  const node: CallNode = {
    id: toNodeId(item),
    symbolName: item.name,
    filePath: item.uri.fsPath,
    line: item.selectionRange.start.line,
    isEntryPoint: entryPointResult !== null,
  };

  if (entryPointResult !== null) {
    node.entryPointType = entryPointResult.type;
    node.framework = entryPointResult.framework;
  }

  if (isTestFile(item.uri.fsPath)) {
    node.isTestFile = true;
  }

  return node;
}

// MARK: Types
export interface TraceResult {
  nodes: CallNode[];
  edges: CallEdge[];
  rootId: string;
}

// MARK: Trace Orchestrator
export class TraceOrchestrator {
  private readonly _cache: EntryPointCache;

  constructor(cache: EntryPointCache) {
    this._cache = cache;
  }

  async trace(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<TraceResult> {
    const items = await vscode.commands.executeCommand<
      vscode.CallHierarchyItem[]
    >("vscode.prepareCallHierarchy", document.uri, position);

    if (!items || items.length === 0) {
      const isPy =
        document.languageId === "python" || document.fileName.endsWith(".py");
      const isGo =
        document.languageId === "go" || document.fileName.endsWith(".go");
      const extraHint = isPy
        ? " (Ensure cursor is on a def/class and Python language server is active)"
        : isGo
          ? " (Ensure cursor is on a func and Go language server is active)"
          : "";
      throw new Error(
        `No call hierarchy item found at cursor. Place your cursor on a function or method name.${extraHint}`,
      );
    }

    const startItem = items[0]!;
    const rootId = toNodeId(startItem);

    const config = vscode.workspace.getConfiguration("mewraPounce");
    const maxDepth: number = config.get("maxDepth") ?? 12;
    const shouldCache: boolean = config.get("cacheEntryPoints") ?? true;
    const enabledFrameworks: string[] = config.get("frameworks") ?? [
      "express",
      "fastify",
      "nestjs",
      "nextjs",
      "worker",
      "fastapi",
      "flask",
      "django",
      "gin",
      "echo",
      "chi",
      "nethttp",
      "python",
      "go",
    ];

    const visited = new Set<string>();
    const nodes: CallNode[] = [];
    const edges: CallEdge[] = [];
    const edgeSet = new Set<string>();
    let nodeCount = 0;

    const addEdge = (from: string, to: string) => {
      const key = `${from}->${to}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ from, to });
      }
    };

    const matchWithCache = (
      item: vscode.CallHierarchyItem,
    ): ReturnType<typeof matchEntryPoint> => {
      const nodeId = toNodeId(item);
      if (shouldCache && this._cache.has(nodeId)) {
        return (
          this._cache.get<ReturnType<typeof matchEntryPoint>>(nodeId) ?? null
        );
      }

      const result = matchEntryPoint(item, enabledFrameworks);
      if (shouldCache) {
        this._cache.set(nodeId, result);
      }
      return result;
    };

    const dfs = async (
      item: vscode.CallHierarchyItem,
      depth: number,
    ): Promise<void> => {
      const nodeId = toNodeId(item);
      if (visited.has(nodeId) || depth > maxDepth) return;
      visited.add(nodeId);

      const entryResult = matchWithCache(item);
      nodes.push(toCallNode(item, entryResult));

      if (entryResult !== null) return;

      const incoming = await vscode.commands.executeCommand<
        vscode.CallHierarchyIncomingCall[]
      >("vscode.provideIncomingCalls", item);

      if (incoming && incoming.length > 0) {
        nodeCount += incoming.length;

        if (nodeCount > 500) {
          const answer = await vscode.window.showWarningMessage(
            `Mewra Pounce: Over 500 incoming nodes found. Continue tracing?`,
            "Continue",
            "Stop here",
          );
          if (answer !== "Continue") return;
          nodeCount = 0;
        }

        for (const call of incoming) {
          const callerId = toNodeId(call.from);
          addEdge(callerId, nodeId);
          await dfs(call.from, depth + 1);
        }
      }

      // MARK: Supplementary References
      if (!incoming || incoming.length === 0 || depth === 0) {
        try {
          const references = await vscode.commands.executeCommand<
            vscode.Location[]
          >(
            "vscode.executeReferenceProvider",
            item.uri,
            item.selectionRange.start,
          );

          if (references && references.length > 0) {
            const externalRefs = references.filter(
              (r) =>
                !(
                  r.uri.fsPath === item.uri.fsPath &&
                  r.range.start.line === item.selectionRange.start.line
                ),
            );

            const seenFiles = new Set<string>();

            for (const ref of externalRefs) {
              const fileKey = `${ref.uri.fsPath}:${ref.range.start.line}`;
              if (seenFiles.has(fileKey)) continue;
              seenFiles.add(fileKey);

              const hierarchyItems = await vscode.commands.executeCommand<
                vscode.CallHierarchyItem[]
              >("vscode.prepareCallHierarchy", ref.uri, ref.range.start);

              if (hierarchyItems && hierarchyItems.length > 0) {
                const parentItem = hierarchyItems[0]!;
                const parentId = toNodeId(parentItem);
                if (parentId !== nodeId) {
                  addEdge(parentId, nodeId);
                  if (!visited.has(parentId)) {
                    await dfs(parentItem, depth + 1);
                  }
                  continue;
                }
              }

              const fileName = path.basename(ref.uri.fsPath);
              const isTest = isTestFile(ref.uri.fsPath);
              const callerId = `${ref.uri.fsPath}:${fileName}:${ref.range.start.line}`;

              if (!visited.has(callerId)) {
                visited.add(callerId);

                const refEntryResult = matchEntryPoint(
                  { filePath: ref.uri.fsPath, symbolName: fileName },
                  enabledFrameworks,
                );

                const callerNode: CallNode = {
                  id: callerId,
                  symbolName: isTest
                    ? `${fileName}:${ref.range.start.line + 1}`
                    : fileName,
                  filePath: ref.uri.fsPath,
                  line: ref.range.start.line,
                  isEntryPoint: refEntryResult !== null,
                };

                if (refEntryResult !== null) {
                  callerNode.entryPointType = refEntryResult.type;
                  callerNode.framework = refEntryResult.framework;
                }

                if (isTest) {
                  callerNode.isTestFile = true;
                }

                nodes.push(callerNode);
              }

              addEdge(callerId, nodeId);
            }
          }
        } catch {}
      }
    };

    await dfs(startItem, 0);

    return { nodes, edges, rootId };
  }
}
