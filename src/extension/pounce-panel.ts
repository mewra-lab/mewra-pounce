import * as vscode from "vscode";

import { toMermaid } from "../core/export/mermaid-exporter";
import type { TraceOrchestrator } from "../core/graph/trace-orchestrator";
import {
  ExtensionMessageSchema,
  WebviewMessageSchema,
} from "../shared/messages";
import type { ExtensionMessage } from "../shared/messages";

function getNonce(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 32 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export class PouncePanel {
  static current: PouncePanel | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private readonly _orchestrator: TraceOrchestrator;
  private readonly _extensionUri: vscode.Uri;
  private _hideTestFiles: boolean;
  private _currentGraph: Awaited<
    ReturnType<TraceOrchestrator["trace"]>
  > | null = null;

  static async createOrShow(
    extensionUri: vscode.Uri,
    orchestrator: TraceOrchestrator,
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<void> {
    if (PouncePanel.current) {
      PouncePanel.current._panel.reveal(vscode.ViewColumn.Beside);
      await PouncePanel.current._runTrace(document, position);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "mewraPounce",
      "Mewra Pounce",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "dist")],
        retainContextWhenHidden: true,
      },
    );

    PouncePanel.current = new PouncePanel(
      panel,
      orchestrator,
      extensionUri,
      document,
      position,
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    orchestrator: TraceOrchestrator,
    extensionUri: vscode.Uri,
    document: vscode.TextDocument,
    position: vscode.Position,
  ) {
    this._panel = panel;
    this._orchestrator = orchestrator;
    this._extensionUri = extensionUri;
    this._hideTestFiles =
      vscode.workspace
        .getConfiguration("mewraPounce")
        .get("hideTestFilesByDefault") ?? true;

    this._panel.webview.html = this._buildHtml();
    this._panel.onDidDispose(() => {
      PouncePanel.current = undefined;
    });

    this._panel.webview.onDidReceiveMessage(async (raw: unknown) => {
      const result = WebviewMessageSchema.safeParse(raw);
      if (!result.success) return;

      const msg = result.data;

      if (msg.kind === "ready") {
        await this._runTrace(document, position);
      }

      if (msg.kind === "toggleTestFiles") {
        this.toggleTestFiles();
      }

      if (msg.kind === "exportMermaid") {
        this.exportMermaid();
      }

      if (msg.kind === "openFile") {
        const uri = vscode.Uri.file(msg.filePath);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, {
          selection: new vscode.Range(msg.line, 0, msg.line, 0),
        });
      }
    });
  }

  toggleTestFiles(): void {
    this._hideTestFiles = !this._hideTestFiles;
    if (this._currentGraph) {
      this._sendGraph(this._currentGraph);
    }
  }

  exportMermaid(): void {
    if (!this._currentGraph) return;
    const { nodes, edges, rootId } = this._currentGraph;
    const filtered = this._hideTestFiles
      ? nodes.filter((n) => !n.isTestFile)
      : nodes;
    const mermaid = toMermaid(filtered, edges, rootId);
    void vscode.env.clipboard.writeText(mermaid).then(() => {
      vscode.window.showInformationMessage(
        "Mewra Pounce: Mermaid copied to clipboard.",
      );
      this._post({ kind: "mermaidText", text: mermaid });
    });
  }

  private async _runTrace(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<void> {
    this._post({ kind: "loading" });

    try {
      const graph = await this._orchestrator.trace(document, position);
      this._currentGraph = graph;
      this._sendGraph(graph);
    } catch (err) {
      this._post({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private _sendGraph(graph: NonNullable<typeof this._currentGraph>): void {
    const nodes = this._hideTestFiles
      ? graph.nodes.filter((n) => !n.isTestFile)
      : graph.nodes;

    this._post({
      kind: "graphData",
      nodes,
      edges: graph.edges,
      rootId: graph.rootId,
      hideTestFiles: this._hideTestFiles,
    });
  }

  private _post(message: ExtensionMessage): void {
    const validated = ExtensionMessageSchema.safeParse(message);
    if (!validated.success) return;
    void this._panel.webview.postMessage(validated.data);
  }

  private _buildHtml(): string {
    const webview = this._panel.webview;
    const nonce = getNonce();

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "webview", "index.js"),
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "webview", "index.css"),
    );

    const csp = [
      `default-src 'none'`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `script-src 'nonce-${nonce}'`,
      `img-src ${webview.cspSource} data:`,
    ].join("; ");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="${csp}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="${styleUri}" />
  <title>Mewra Pounce</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}
