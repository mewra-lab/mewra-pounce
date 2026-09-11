import { useEffect, useRef, useState } from "preact/hooks";

import type cytoscape from "cytoscape";

import type { ExtensionMessage, WebviewMessage } from "../shared/messages";

interface VsCodeApi {
  postMessage: (message: unknown) => void;
}

interface Props {
  vscode: VsCodeApi;
}

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      graphData: Extract<ExtensionMessage, { kind: "graphData" }>;
    };

function post(vscode: VsCodeApi, msg: WebviewMessage): void {
  vscode.postMessage(msg);
}

export function App({ vscode }: Props) {
  const [state, setState] = useState<State>({ status: "idle" });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data as ExtensionMessage;
      if (msg.kind === "loading") setState({ status: "loading" });
      if (msg.kind === "error")
        setState({ status: "error", message: msg.message });
      if (msg.kind === "graphData")
        setState({ status: "ready", graphData: msg });
    };
    window.addEventListener("message", handler);
    post(vscode, { kind: "ready" });
    return () => window.removeEventListener("message", handler);
  }, [vscode]);

  if (state.status === "idle" || state.status === "loading") {
    return (
      <div class="pounce-loading">
        <div class="pounce-spinner" />
        <span>Tracing callers…</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div class="pounce-error">
        <span class="pounce-error-icon">⚠</span>
        <p>{state.message}</p>
      </div>
    );
  }

  const { nodes, edges, rootId } = state.graphData;
  const routes = nodes.filter(
    (n) => n.isEntryPoint && n.entryPointType === "route",
  );
  const workers = nodes.filter(
    (n) => n.isEntryPoint && n.entryPointType === "worker",
  );

  return (
    <div class="pounce-root">
      <header class="pounce-header">
        <div class="pounce-blast-radius">
          {routes.length > 0 && (
            <span class="pounce-badge pounce-badge--route">
              ⚠ Impacts {routes.length} API Route
              {routes.length !== 1 ? "s" : ""}
            </span>
          )}
          {workers.length > 0 && (
            <span class="pounce-badge pounce-badge--worker">
              {workers.length} Background Worker
              {workers.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div class="pounce-actions">
          <button
            id="btn-toggle-tests"
            class="pounce-btn"
            onClick={() => post(vscode, { kind: "toggleTestFiles" })}
          >
            Toggle test files
          </button>
          <button
            id="btn-copy-mermaid"
            class="pounce-btn pounce-btn--primary"
            onClick={() => post(vscode, { kind: "exportMermaid" })}
          >
            Copy as Mermaid
          </button>
        </div>
      </header>
      <div id="cy-container" ref={containerRef} class="pounce-graph">
        <GraphView
          nodes={nodes}
          edges={edges}
          rootId={rootId}
          container={containerRef}
          vscode={vscode}
        />
      </div>
    </div>
  );
}

type GraphData = Extract<ExtensionMessage, { kind: "graphData" }>;

interface GraphViewProps {
  nodes: GraphData["nodes"];
  edges: GraphData["edges"];
  rootId: string;
  container: { current: HTMLDivElement | null };
  vscode: VsCodeApi;
}

function GraphView({
  nodes,
  edges,
  rootId,
  container,
  vscode,
}: GraphViewProps) {
  useEffect(() => {
    if (!container.current) return;

    const el = container.current;
    el.innerHTML = "";

    const nodeSet = new Set(nodes.map((n) => n.id));
    const validEdges = edges.filter(
      (e) => nodeSet.has(e.from) && nodeSet.has(e.to),
    );

    import("cytoscape").then(({ default: cytoscape }) => {
      import("cytoscape-dagre").then(({ default: dagre }) => {
        cytoscape.use(dagre);

        const cy = cytoscape({
          container: el,
          elements: [
            ...nodes.map((n) => ({
              data: {
                id: n.id,
                label: n.symbolName,
                filePath: n.filePath,
                line: n.line,
                isEntryPoint: n.isEntryPoint,
                isRoot: n.id === rootId,
                isUnresolved: n.isUnresolved ?? false,
              },
            })),
            ...validEdges.map((e) => ({
              data: { source: e.from, target: e.to },
            })),
          ],
          layout: {
            name: "dagre",
            rankDir: "TB",
            nodeSep: 60,
            rankSep: 80,
          } as cytoscape.LayoutOptions,
          style: [
            {
              selector: "node",
              style: {
                label: "data(label)",
                "background-color": "var(--vscode-editor-background, #1e1e1e)",
                "border-color": "var(--vscode-focusBorder, #007acc)",
                "border-width": 1,
                color: "var(--vscode-editor-foreground, #d4d4d4)",
                "font-size": 11,
                "text-valign": "center",
                "text-halign": "center",
                "text-wrap": "wrap",
                "text-max-width": "120px",
                width: 130,
                height: 40,
                shape: "roundrectangle",
              },
            },
            {
              selector: "node[?isRoot]",
              style: {
                "background-color": "#3b82f6",
                "border-color": "#1d4ed8",
                color: "#fff",
              },
            },
            {
              selector: "node[?isEntryPoint]",
              style: {
                "background-color": "#22c55e",
                "border-color": "#15803d",
                color: "#fff",
              },
            },
            {
              selector: "node[?isUnresolved]",
              style: {
                "border-color": "#ef4444",
                "border-width": 2,
                "border-style": "dashed",
              },
            },
            {
              selector: "edge",
              style: {
                "curve-style": "bezier",
                "target-arrow-shape": "triangle",
                "line-color": "var(--vscode-editorWidget-border, #454545)",
                "target-arrow-color":
                  "var(--vscode-editorWidget-border, #454545)",
                width: 1,
              },
            },
            {
              selector: "node:selected",
              style: {
                "border-color": "#f59e0b",
                "border-width": 2,
              },
            },
          ],
        });

        cy.on("tap", "node", (evt: cytoscape.EventObject) => {
          const data = evt.target.data() as {
            filePath: string;
            line: number;
          };
          post(vscode, {
            kind: "openFile",
            filePath: data.filePath,
            line: data.line,
          });
        });
      });
    });

    return () => {
      el.innerHTML = "";
    };
  }, [nodes, edges, rootId, container, vscode]);

  return null;
}
