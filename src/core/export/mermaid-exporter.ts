import type { CallEdge, CallNode } from "../../shared/types";

export function toMermaid(
  nodes: CallNode[],
  edges: CallEdge[],
  rootId: string,
): string {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const sanitize = (s: string): string =>
    s.replace(/"/g, "'").replace(/[<>]/g, "");

  const nodeLines = nodes.map((n) => {
    const label = `${sanitize(n.symbolName)}<br/>${sanitize(n.filePath.split("/").at(-1) ?? "")}:${n.line}`;
    const id = `N${nodes.indexOf(n)}`;
    return { id, nodeId: n.id, line: `    ${id}["${label}"]` };
  });

  const idToMermaidId = new Map(nodeLines.map((nl) => [nl.nodeId, nl.id]));

  const edgeLines = edges.map((e) => {
    const from = idToMermaidId.get(e.from) ?? "?";
    const to = idToMermaidId.get(e.to) ?? "?";
    return `    ${from} --> ${to}`;
  });

  const styleLines: string[] = [];
  nodes.forEach((n, i) => {
    const mId = `N${i}`;
    if (n.id === rootId) {
      styleLines.push(`    style ${mId} fill:#3b82f6,color:#fff`);
    } else if (n.isEntryPoint) {
      styleLines.push(`    style ${mId} fill:#22c55e,color:#fff`);
    } else if (n.isUnresolved) {
      styleLines.push(`    style ${mId} stroke:#ef4444,stroke-width:2px`);
    }
  });

  const lines = [
    "graph TD",
    ...nodeLines.map((nl) => nl.line),
    ...edgeLines,
    ...styleLines,
  ];

  return lines.join("\n");
}
