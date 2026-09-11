// MARK: Imports
import { useEffect, useRef, useState } from "preact/hooks";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";

import type { ExtensionMessage, WebviewMessage } from "../shared/messages";
import { MewraLogo } from "./logo";

cytoscape.use(dagre);

// MARK: Types
interface VsCodeApi {
  postMessage: (message: unknown) => void;
}

interface Props {
  vscode: VsCodeApi;
  logoUri?: string;
}

type GraphData = Extract<ExtensionMessage, { kind: "graphData" }>;
type NodeItem = GraphData["nodes"][number];

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; graphData: GraphData };

function post(vscode: VsCodeApi, msg: WebviewMessage): void {
  vscode.postMessage(msg);
}

// MARK: Main Component
export function App({ vscode, logoUri }: Props) {
  const [state, setState] = useState<State>({ status: "idle" });
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data as ExtensionMessage;
      if (msg.kind === "loading") {
        setState({ status: "loading" });
      } else if (msg.kind === "error") {
        setState({ status: "error", message: msg.message });
      } else if (msg.kind === "graphData") {
        setState({ status: "ready", graphData: msg });
        setSelectedNode(null);
      } else if (msg.kind === "mermaidText") {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2200);
      }
    };

    window.addEventListener("message", handler);
    post(vscode, { kind: "ready" });
    return () => window.removeEventListener("message", handler);
  }, [vscode]);

  if (state.status === "idle" || state.status === "loading") {
    return (
      <div class="pounce-loading">
        {logoUri ? (
          <img src={logoUri} class="pounce-loading-logo" alt="Mewra" />
        ) : (
          <MewraLogo size={32} class="pounce-loading-logo" />
        )}
        <span class="pounce-loading-text">Tracing call hierarchy…</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div class="pounce-error-card">
        <span class="pounce-error-icon">⚠️</span>
        <h3>Trace Failed</h3>
        <p>{state.message}</p>
        <button
          class="pounce-btn pounce-btn--primary"
          onClick={() => post(vscode, { kind: "ready" })}
        >
          Retry
        </button>
      </div>
    );
  }

  const { nodes, edges, rootId, hideTestFiles } = state.graphData;
  const rootNode = nodes.find((n) => n.id === rootId);
  const callerNodes = nodes.filter((n) => n.id !== rootId);
  const routes = nodes.filter(
    (n) => n.isEntryPoint && n.entryPointType === "route",
  );
  const workers = nodes.filter(
    (n) => n.isEntryPoint && n.entryPointType === "worker",
  );
  const isLeaf = callerNodes.length === 0;

  return (
    <div class="pounce-root">
      {/* MARK: Clean Toolbar */}
      <header class="pounce-header">
        <div class="pounce-header-top">
          <div class="pounce-brand">
            {logoUri ? (
              <img src={logoUri} class="pounce-brand-logo" alt="Mewra" />
            ) : (
              <MewraLogo size={18} />
            )}
            <span class="pounce-brand-title">Mewra Pounce</span>
            {rootNode && (
              <span
                class="pounce-target-tag"
                title={`${rootNode.filePath}:${rootNode.line + 1}`}
                onClick={() =>
                  post(vscode, {
                    kind: "openFile",
                    filePath: rootNode.filePath,
                    line: rootNode.line,
                  })
                }
              >
                {rootNode.symbolName}()
              </span>
            )}
          </div>

          <div class="pounce-header-actions">
            <button
              id="btn-toggle-tests"
              class={`pounce-btn ${hideTestFiles ? "" : "is-active"}`}
              title={
                hideTestFiles ? "Show test files in graph" : "Hide test files"
              }
              onClick={() => post(vscode, { kind: "toggleTestFiles" })}
            >
              {hideTestFiles ? "Include Tests" : "Tests Shown"}
            </button>

            <button
              id="btn-copy-mermaid"
              class="pounce-btn pounce-btn--primary"
              title="Copy graph as Mermaid Markdown"
              onClick={() => post(vscode, { kind: "exportMermaid" })}
            >
              Copy Mermaid
            </button>

            <button
              id="btn-retrace"
              class="pounce-btn pounce-btn--icon"
              title="Re-trace callers"
              onClick={() => post(vscode, { kind: "ready" })}
            >
              ↺
            </button>
          </div>
        </div>

        <div class="pounce-header-bar">
          <div class="pounce-chips">
            {routes.length > 0 && (
              <span class="pounce-chip pounce-chip--route">
                ● {routes.length} Route{routes.length !== 1 ? "s" : ""}
              </span>
            )}
            {workers.length > 0 && (
              <span class="pounce-chip pounce-chip--worker">
                ● {workers.length} Worker{workers.length !== 1 ? "s" : ""}
              </span>
            )}
            <span class="pounce-chip">
              {callerNodes.length} Caller{callerNodes.length !== 1 ? "s" : ""}
            </span>
            {isLeaf && (
              <span class="pounce-chip pounce-chip--muted">
                Leaf function (no callers found)
              </span>
            )}
          </div>
        </div>
      </header>

      {/* MARK: Graph Canvas */}
      <div class="pounce-canvas">
        <GraphView
          nodes={nodes}
          edges={edges}
          rootId={rootId}
          onSelectNode={setSelectedNode}
          vscode={vscode}
        />

        {/* Selected Node Details Bar */}
        {selectedNode && (
          <div class="pounce-inspector">
            <div class="pounce-inspector-info">
              <span class="pounce-inspector-name">
                {selectedNode.symbolName}
              </span>
              <span class="pounce-inspector-path">
                {selectedNode.filePath.split("/").slice(-2).join("/")}:
                {selectedNode.line + 1}
              </span>
            </div>
            <div class="pounce-inspector-actions">
              <button
                class="pounce-btn pounce-btn--sm pounce-btn--primary"
                onClick={() =>
                  post(vscode, {
                    kind: "openFile",
                    filePath: selectedNode.filePath,
                    line: selectedNode.line,
                  })
                }
              >
                Open ↗
              </button>
              <button
                class="pounce-btn pounce-btn--sm"
                onClick={() => setSelectedNode(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div class="pounce-legend">
          <span>
            <span class="pounce-dot pounce-dot--root" /> Target
          </span>
          <span>
            <span class="pounce-dot pounce-dot--route" /> Route
          </span>
          <span>
            <span class="pounce-dot pounce-dot--worker" /> Worker
          </span>
          <span>
            <span class="pounce-dot pounce-dot--test" /> Test
          </span>
          <span>
            <span class="pounce-dot pounce-dot--caller" /> Caller
          </span>
        </div>

        {/* Copied Toast */}
        {copiedToast && (
          <div class="pounce-toast">✓ Copied Mermaid to clipboard</div>
        )}
      </div>
    </div>
  );
}

// MARK: Cytoscape View
interface GraphViewProps {
  nodes: NodeItem[];
  edges: GraphData["edges"];
  rootId: string;
  onSelectNode: (node: NodeItem | null) => void;
  vscode: VsCodeApi;
}

function GraphView({
  nodes,
  edges,
  rootId,
  onSelectNode,
  vscode,
}: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const nodeSet = new Set(nodes.map((n) => n.id));
    const validEdges = edges.filter(
      (e) => nodeSet.has(e.from) && nodeSet.has(e.to),
    );

    const elements = [
      ...nodes.map((n) => {
        const isRoot = n.id === rootId;
        const isEntry = n.isEntryPoint;
        const isTest = n.isTestFile ?? false;
        let kind = "caller";
        if (isRoot) kind = "target";
        else if (isEntry && n.entryPointType === "route") kind = "route";
        else if (isEntry && n.entryPointType === "worker") kind = "worker";
        else if (isTest) kind = "test";

        return {
          data: {
            id: n.id,
            label: n.symbolName,
            sublabel: `${n.filePath.split("/").pop()}:${n.line + 1}`,
            kind,
            raw: n,
          },
        };
      }),
      ...validEdges.map((e) => ({
        data: {
          id: `${e.from}->${e.to}`,
          source: e.from,
          target: e.to,
        },
      })),
    ];

    const cy = cytoscape({
      container: el,
      elements,
      boxSelectionEnabled: false,
      layout: {
        name: "dagre",
        rankDir: "TB",
        nodeSep: 40,
        rankSep: 60,
      } as cytoscape.LayoutOptions,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "#1e2030",
            "border-color": "#3b4261",
            "border-width": 1.5,
            color: "#cad3f5",
            "font-size": 11,
            "font-weight": "normal",
            "font-family": "var(--vscode-font-family, sans-serif)",
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "ellipsis",
            "text-max-width": "150px",
            width: 160,
            height: 40,
            shape: "roundrectangle",
          },
        },
        {
          selector: "node[kind = 'target']",
          style: {
            "background-color": "#1e3a8a",
            "border-color": "#3b82f6",
            "border-width": 2,
            color: "#ffffff",
            "font-weight": "bold",
          },
        },
        {
          selector: "node[kind = 'route']",
          style: {
            "background-color": "#064e3b",
            "border-color": "#10b981",
            "border-width": 2,
            color: "#ecfdf5",
          },
        },
        {
          selector: "node[kind = 'worker']",
          style: {
            "background-color": "#78350f",
            "border-color": "#f59e0b",
            "border-width": 2,
            color: "#fffbeb",
          },
        },
        {
          selector: "node[kind = 'test']",
          style: {
            "background-color": "#3b1d6e",
            "border-color": "#8b5cf6",
            "border-width": 1.5,
            color: "#f5f3ff",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "#f59e0b",
            "border-width": 2.5,
          },
        },
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
            "line-color": "#4b5563",
            "target-arrow-color": "#4b5563",
            width: 1.5,
            "arrow-scale": 1,
          },
        },
      ],
    });

    cy.on("tap", "node", (evt: cytoscape.EventObject) => {
      const raw = evt.target.data("raw") as NodeItem;
      onSelectNode(raw);
    });

    cy.on("dbltap", "node", (evt: cytoscape.EventObject) => {
      const raw = evt.target.data("raw") as NodeItem;
      post(vscode, {
        kind: "openFile",
        filePath: raw.filePath,
        line: raw.line,
      });
    });

    cy.on("tap", (evt: cytoscape.EventObject) => {
      if (evt.target === cy) {
        onSelectNode(null);
      }
    });

    setTimeout(() => {
      cy.resize();
      cy.fit(undefined, 30);
    }, 50);

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [nodes, edges, rootId, onSelectNode, vscode]);

  return (
    <div class="pounce-graph-viewport">
      <div ref={containerRef} class="pounce-cy-mount" />

      <div class="pounce-hud">
        <button
          class="pounce-hud-btn"
          title="Zoom in"
          onClick={() => {
            if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.25);
          }}
        >
          +
        </button>
        <button
          class="pounce-hud-btn"
          title="Zoom out"
          onClick={() => {
            if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 0.8);
          }}
        >
          −
        </button>
        <button
          class="pounce-hud-btn"
          title="Fit view"
          onClick={() => {
            if (cyRef.current) cyRef.current.fit(undefined, 30);
          }}
        >
          ⛶
        </button>
      </div>
    </div>
  );
}
