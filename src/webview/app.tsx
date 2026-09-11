// MARK: Imports
import { useEffect, useRef, useState } from "preact/hooks";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";

import type { ExtensionMessage, WebviewMessage } from "../shared/messages";

cytoscape.use(dagre);

// MARK: Types
interface VsCodeApi {
  postMessage: (message: unknown) => void;
}

interface Props {
  vscode: VsCodeApi;
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
export function App({ vscode }: Props) {
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
        setTimeout(() => setCopiedToast(false), 2500);
      }
    };

    window.addEventListener("message", handler);
    post(vscode, { kind: "ready" });
    return () => window.removeEventListener("message", handler);
  }, [vscode]);

  if (state.status === "idle" || state.status === "loading") {
    return (
      <div class="pounce-loading">
        <div class="pounce-cat-pulse">
          <svg
            class="pounce-logo-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M12 2L9 9H2l6 4.5-2.5 7.5 6.5-5 6.5 5-2.5-7.5 6-4.5h-7z" />
          </svg>
        </div>
        <div class="pounce-loading-content">
          <span class="pounce-loading-title">Tracing Call Hierarchy</span>
          <span class="pounce-loading-sub">
            Walking reverse callers to API routes and workers…
          </span>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div class="pounce-error-card">
        <div class="pounce-error-header">
          <span class="pounce-error-icon">⚠️</span>
          <h3>Trace Failed</h3>
        </div>
        <p class="pounce-error-message">{state.message}</p>
        <button
          class="pounce-btn pounce-btn--primary"
          onClick={() => post(vscode, { kind: "ready" })}
        >
          Retry Trace
        </button>
      </div>
    );
  }

  const { nodes, edges, rootId, hideTestFiles } = state.graphData;
  const rootNode = nodes.find((n) => n.id === rootId);
  const routes = nodes.filter(
    (n) => n.isEntryPoint && n.entryPointType === "route",
  );
  const workers = nodes.filter(
    (n) => n.isEntryPoint && n.entryPointType === "worker",
  );
  const isLeafFunction = nodes.length <= 1 && edges.length === 0;

  return (
    <div class="pounce-root">
      {/* MARK: Header Toolbar */}
      <header class="pounce-header">
        <div class="pounce-header-brand">
          <div class="pounce-brand-pill">
            <svg
              class="pounce-cat-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M4 14l2.5-9 4.5 4 4.5-4 2.5 9c0 4-3.5 6-7 6s-7-2-7-6z" />
              <path d="M9 14h.01M15 14h.01" />
            </svg>
            <span class="pounce-brand-name">Mewra Pounce</span>
          </div>

          {rootNode && (
            <div
              class="pounce-target-pill"
              title={`${rootNode.filePath}:${rootNode.line + 1}`}
              onClick={() => {
                setSelectedNode(rootNode);
                post(vscode, {
                  kind: "openFile",
                  filePath: rootNode.filePath,
                  line: rootNode.line,
                });
              }}
            >
              <span class="pounce-target-label">target:</span>
              <span class="pounce-target-fn">{rootNode.symbolName}()</span>
              <span class="pounce-target-loc">:{rootNode.line + 1}</span>
            </div>
          )}
        </div>

        <div class="pounce-header-stats">
          {routes.length > 0 && (
            <span class="pounce-badge pounce-badge--route">
              <span class="pounce-dot pounce-dot--route" />
              {routes.length} Route{routes.length !== 1 ? "s" : ""}
            </span>
          )}
          {workers.length > 0 && (
            <span class="pounce-badge pounce-badge--worker">
              <span class="pounce-dot pounce-dot--worker" />
              {workers.length} Worker{workers.length !== 1 ? "s" : ""}
            </span>
          )}
          {!isLeafFunction && (
            <span class="pounce-badge pounce-badge--muted">
              {nodes.length} Callers
            </span>
          )}
          {isLeafFunction && (
            <span class="pounce-badge pounce-badge--warning">
              Leaf Function (0 Callers)
            </span>
          )}
        </div>

        <div class="pounce-actions">
          <button
            id="btn-toggle-tests"
            class={`pounce-btn pounce-btn--toggle ${hideTestFiles ? "is-active" : ""}`}
            title="Toggle inclusion of test and spec files in call graph"
            onClick={() => post(vscode, { kind: "toggleTestFiles" })}
          >
            <svg
              class="pounce-btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>{hideTestFiles ? "Tests Hidden" : "Tests Shown"}</span>
          </button>

          <button
            id="btn-copy-mermaid"
            class="pounce-btn pounce-btn--primary"
            title="Export full graph to Mermaid syntax"
            onClick={() => post(vscode, { kind: "exportMermaid" })}
          >
            <svg
              class="pounce-btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copy Mermaid</span>
          </button>

          <button
            id="btn-retrace"
            class="pounce-btn pounce-btn--icon-only"
            title="Re-trace callers from cursor position"
            onClick={() => post(vscode, { kind: "ready" })}
          >
            <svg
              class="pounce-btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </header>

      {/* MARK: Canvas & Overlays */}
      <div class="pounce-canvas-wrapper">
        <GraphView
          nodes={nodes}
          edges={edges}
          rootId={rootId}
          onSelectNode={setSelectedNode}
          vscode={vscode}
        />

        {/* Leaf Function Contextual Notice */}
        {isLeafFunction && rootNode && (
          <div class="pounce-leaf-banner">
            <div class="pounce-leaf-header">
              <span class="pounce-leaf-icon">ℹ️</span>
              <h4>0 Incoming Callers Found</h4>
            </div>
            <p>
              <code>{rootNode.symbolName}()</code> has no incoming calls
              detected in the workspace.
            </p>
            <p class="pounce-leaf-sub">
              It may be an unreferenced utility function, a top-level route
              handler, or references are still being indexed by TypeScript LSP.
            </p>
            <button
              class="pounce-btn pounce-btn--sm"
              onClick={() => post(vscode, { kind: "ready" })}
            >
              Re-scan References
            </button>
          </div>
        )}

        {/* Selected Node Details Card */}
        {selectedNode && (
          <div class="pounce-inspector-card">
            <div class="pounce-inspector-main">
              <div class="pounce-inspector-header">
                <span class="pounce-inspector-type">
                  {selectedNode.id === rootId
                    ? "TARGET CALLEE"
                    : selectedNode.isEntryPoint
                      ? `${(selectedNode.entryPointType ?? "ENTRY POINT").toUpperCase()} (${selectedNode.framework ?? "custom"})`
                      : "CALLER FUNCTION"}
                </span>
                <button
                  class="pounce-inspector-close"
                  onClick={() => setSelectedNode(null)}
                >
                  ✕
                </button>
              </div>
              <h4 class="pounce-inspector-symbol">
                {selectedNode.symbolName}()
              </h4>
              <p class="pounce-inspector-file">
                {selectedNode.filePath.split("/").slice(-2).join("/")}:
                {selectedNode.line + 1}
              </p>
            </div>
            <button
              class="pounce-btn pounce-btn--primary pounce-btn--sm"
              onClick={() =>
                post(vscode, {
                  kind: "openFile",
                  filePath: selectedNode.filePath,
                  line: selectedNode.line,
                })
              }
            >
              Open in Editor ↗
            </button>
          </div>
        )}

        {/* Floating Legend */}
        <div class="pounce-legend">
          <span class="pounce-legend-item">
            <span class="pounce-dot pounce-dot--root" /> Target
          </span>
          <span class="pounce-legend-item">
            <span class="pounce-dot pounce-dot--route" /> Route
          </span>
          <span class="pounce-legend-item">
            <span class="pounce-dot pounce-dot--worker" /> Worker
          </span>
          <span class="pounce-legend-item">
            <span class="pounce-dot pounce-dot--caller" /> Caller
          </span>
        </div>

        {/* Copied Toast */}
        {copiedToast && (
          <div class="pounce-toast">✓ Copied Mermaid graph to clipboard</div>
        )}
      </div>
    </div>
  );
}

// MARK: Graph View Component
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

    const cyElements = [
      ...nodes.map((n) => {
        const isRoot = n.id === rootId;
        const isEntry = n.isEntryPoint;
        let badge = "";
        if (isRoot) badge = "TARGET";
        else if (isEntry) badge = (n.entryPointType ?? "ROUTE").toUpperCase();

        return {
          data: {
            id: n.id,
            label: n.symbolName,
            sublabel: `${n.filePath.split("/").pop()}:${n.line + 1}`,
            badge,
            filePath: n.filePath,
            line: n.line,
            isEntryPoint: n.isEntryPoint,
            entryPointType: n.entryPointType ?? "route",
            isRoot,
            isUnresolved: n.isUnresolved ?? false,
            rawNode: n,
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
      elements: cyElements,
      boxSelectionEnabled: false,
      autounselectify: false,
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
            "background-color": "#181926",
            "border-color": "#3B4261",
            "border-width": 1.5,
            color: "#CAD3F5",
            "font-size": 11,
            "font-weight": "bold",
            "font-family": "var(--vscode-font-family, sans-serif)",
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "wrap",
            "text-max-width": "140px",
            width: 150,
            height: 48,
            shape: "roundrectangle",
            "transition-property":
              "border-color, background-color, border-width",
            "transition-duration": 0.2,
          },
        },
        {
          selector: "node[?isRoot]",
          style: {
            "background-color": "#4F46E5",
            "border-color": "#818CF8",
            "border-width": 2.5,
            color: "#FFFFFF",
            width: 160,
            height: 52,
          },
        },
        {
          selector: "node[?isEntryPoint][entryPointType = 'route']",
          style: {
            "background-color": "#065F46",
            "border-color": "#10B981",
            "border-width": 2,
            color: "#ECFDF5",
          },
        },
        {
          selector: "node[?isEntryPoint][entryPointType = 'worker']",
          style: {
            "background-color": "#92400E",
            "border-color": "#F59E0B",
            "border-width": 2,
            color: "#FFFBEB",
          },
        },
        {
          selector: "node[?isUnresolved]",
          style: {
            "border-color": "#EF4444",
            "border-width": 2,
            "border-style": "dashed",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "#A855F7",
            "border-width": 3,
          },
        },
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
            "line-color": "#475569",
            "target-arrow-color": "#475569",
            width: 1.8,
            "arrow-scale": 1.2,
          },
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#A855F7",
            "target-arrow-color": "#A855F7",
            width: 2.5,
          },
        },
      ],
    });

    cy.on("tap", "node", (evt: cytoscape.EventObject) => {
      const data = evt.target.data() as {
        filePath: string;
        line: number;
        rawNode: NodeItem;
      };
      onSelectNode(data.rawNode);
    });

    cy.on("dbltap", "node", (evt: cytoscape.EventObject) => {
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

    cy.on("tap", (evt: cytoscape.EventObject) => {
      if (evt.target === cy) {
        onSelectNode(null);
      }
    });

    // Auto-fit nicely
    setTimeout(() => {
      cy.resize();
      cy.fit(undefined, 40);
    }, 50);

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [nodes, edges, rootId, onSelectNode, vscode]);

  const handleZoomIn = () => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  };

  const handleZoomOut = () => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  };

  const handleFit = () => {
    if (!cyRef.current) return;
    cyRef.current.fit(undefined, 40);
  };

  const handleReset = () => {
    if (!cyRef.current) return;
    cyRef.current
      .layout({
        name: "dagre",
        rankDir: "TB",
        nodeSep: 60,
        rankSep: 80,
      } as cytoscape.LayoutOptions)
      .run();
    cyRef.current.fit(undefined, 40);
  };

  return (
    <div class="pounce-graph-container">
      <div id="cy-container" ref={containerRef} class="pounce-cy" />

      {/* Floating Canvas Controls */}
      <div class="pounce-canvas-controls">
        <button class="pounce-hud-btn" title="Zoom In" onClick={handleZoomIn}>
          +
        </button>
        <button class="pounce-hud-btn" title="Zoom Out" onClick={handleZoomOut}>
          −
        </button>
        <button
          class="pounce-hud-btn"
          title="Fit to Screen"
          onClick={handleFit}
        >
          ⛶
        </button>
        <button
          class="pounce-hud-btn"
          title="Reset Layout"
          onClick={handleReset}
        >
          ↺
        </button>
      </div>
    </div>
  );
}
