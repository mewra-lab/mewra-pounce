import * as vscode from "vscode";

import { TraceOrchestrator } from "../core/graph/trace-orchestrator";
import { EntryPointCache } from "../core/matchers/entry-point-cache";
import { PouncePanel } from "./pounce-panel";
import { preflightBlastRadiusCheck } from "../core/preflight/blast-radius-check";
import type { PreFlightApi } from "../shared/preflight-api";

const preflightExtensionId = "mewra.mewra-preflight";

function isPreFlightApi(value: unknown): value is PreFlightApi {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.apiVersion === 1 && typeof candidate.registerCheck === "function"
  );
}

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  const cache = new EntryPointCache(context);
  const orchestrator = new TraceOrchestrator(cache);

  const traceCommand = vscode.commands.registerCommand(
    "mewra-pounce.trace",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const position = editor.selection.active;
      const document = editor.document;

      await PouncePanel.createOrShow(
        context.extensionUri,
        orchestrator,
        document,
        position,
      );
    },
  );

  const toggleTestFilesCommand = vscode.commands.registerCommand(
    "mewra-pounce.toggleTestFiles",
    () => {
      PouncePanel.current?.toggleTestFiles();
    },
  );

  const exportMermaidCommand = vscode.commands.registerCommand(
    "mewra-pounce.exportMermaid",
    () => {
      PouncePanel.current?.exportMermaid();
    },
  );

  const clearCacheCommand = vscode.commands.registerCommand(
    "mewra-pounce.clearCache",
    async () => {
      await cache.clear();
      vscode.window.showInformationMessage("Mewra Pounce: Cache cleared.");
    },
  );

  context.subscriptions.push(
    traceCommand,
    toggleTestFilesCommand,
    exportMermaidCommand,
    clearCacheCommand,
  );

  const preflight = vscode.extensions.getExtension(preflightExtensionId);
  if (!preflight) {
    return;
  }
  const api = await preflight.activate();
  if (!isPreFlightApi(api)) {
    void vscode.window.showWarningMessage(
      "Mewra Pounce needs a compatible Mewra PreFlight version.",
    );
    return;
  }
  context.subscriptions.push(api.registerCheck(preflightBlastRadiusCheck));
}

export function deactivate(): void {}
