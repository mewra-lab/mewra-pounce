import { describe, expect, it } from "vitest";

import { toMermaid } from "../../src/core/export/mermaid-exporter";
import type { CallEdge, CallNode } from "../../src/shared/types";

const makeNode = (overrides: Partial<CallNode> = {}): CallNode => ({
  id: "src/a.ts:foo:1",
  symbolName: "foo",
  filePath: "src/a.ts",
  line: 1,
  isEntryPoint: false,
  ...overrides,
});

describe("toMermaid", () => {
  it("produces a graph TD block", () => {
    const nodes: CallNode[] = [makeNode()];
    const edges: CallEdge[] = [];
    const result = toMermaid(nodes, edges, nodes[0]!.id);
    expect(result).toMatch(/^graph TD/);
  });

  it("includes node labels", () => {
    const nodes: CallNode[] = [makeNode({ symbolName: "validateInput" })];
    const result = toMermaid(nodes, [], nodes[0]!.id);
    expect(result).toContain("validateInput");
  });

  it("includes edge arrows", () => {
    const a = makeNode({ id: "a", symbolName: "a" });
    const b = makeNode({
      id: "b",
      symbolName: "b",
      isEntryPoint: true,
      entryPointType: "route",
    });
    const edges: CallEdge[] = [{ from: "a", to: "b" }];
    const result = toMermaid([a, b], edges, a.id);
    expect(result).toContain("-->");
  });

  it("adds style for entry point nodes", () => {
    const entry = makeNode({
      id: "entry",
      symbolName: "handler",
      isEntryPoint: true,
    });
    const result = toMermaid([entry], [], "other");
    expect(result).toContain("#22c55e");
  });

  it("adds style for root node", () => {
    const root = makeNode({ id: "root", symbolName: "root" });
    const result = toMermaid([root], [], "root");
    expect(result).toContain("#3b82f6");
  });
});
