import * as vscode from "vscode";

import type { CallEdge, CallNode } from "../../shared/types";
import type { EntryPointCache } from "../matchers/entry-point-cache";
import { matchEntryPoint } from "../matchers/match-entry-point";

const TEST_FILE_PATTERNS = [
  /\.(test|spec)\.(ts|tsx|js|jsx)$/,
  /__tests__\//,
  /\.test\//,
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

export interface TraceResult {
  nodes: CallNode[];
  edges: CallEdge[];
  rootId: string;
}

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
      throw new Error(
        "No call hierarchy item found at cursor. Place your cursor on a function name.",
      );
    }

    const startItem = items[0]!;
    const rootId = toNodeId(startItem);

    const config = vscode.workspace.getConfiguration("mewraPounce");
    const maxDepth: number = config.get("maxDepth") ?? 12;

    const visited = new Set<string>();
    const nodes: CallNode[] = [];
    const edges: CallEdge[] = [];
    let nodeCount = 0;

    const dfs = async (
      item: vscode.CallHierarchyItem,
      depth: number,
    ): Promise<void> => {
      const nodeId = toNodeId(item);
      if (visited.has(nodeId) || depth > maxDepth) return;
      visited.add(nodeId);

      const entryResult = matchEntryPoint(item);
      nodes.push(toCallNode(item, entryResult));

      if (entryResult !== null) return;

      const incoming = await vscode.commands.executeCommand<
        vscode.CallHierarchyIncomingCall[]
      >("vscode.provideIncomingCalls", item);

      if (!incoming || incoming.length === 0) return;

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
        edges.push({ from: callerId, to: nodeId });
        await dfs(call.from, depth + 1);
      }
    };

    await dfs(startItem, 0);

    return { nodes, edges, rootId };
  }
}
