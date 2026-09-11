import * as vscode from "vscode";

import { TraceOrchestrator } from "../core/graph/trace-orchestrator";
import { EntryPointCache } from "../core/matchers/entry-point-cache";
import { PouncePanel } from "./pounce-panel";

export function activate(context: vscode.ExtensionContext): void {
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
}

export function deactivate(): void {}
