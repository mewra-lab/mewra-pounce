// MARK: Message Schema Tests
import { describe, expect, it } from "vitest";

import {
  ExtensionMessageSchema,
  WebviewMessageSchema,
} from "../../src/shared/messages";

describe("WebviewMessageSchema", () => {
  it("validates ready message", () => {
    const parsed = WebviewMessageSchema.safeParse({ kind: "ready" });
    expect(parsed.success).toBe(true);
  });

  it("validates openFile message", () => {
    const parsed = WebviewMessageSchema.safeParse({
      kind: "openFile",
      filePath: "/src/index.ts",
      line: 42,
    });
    expect(parsed.success).toBe(true);
  });

  it("validates toggleTestFiles message", () => {
    const parsed = WebviewMessageSchema.safeParse({ kind: "toggleTestFiles" });
    expect(parsed.success).toBe(true);
  });

  it("validates exportMermaid message", () => {
    const parsed = WebviewMessageSchema.safeParse({ kind: "exportMermaid" });
    expect(parsed.success).toBe(true);
  });

  it("rejects unknown message kind", () => {
    const parsed = WebviewMessageSchema.safeParse({ kind: "unknownCommand" });
    expect(parsed.success).toBe(false);
  });

  it("rejects openFile with negative line number", () => {
    const parsed = WebviewMessageSchema.safeParse({
      kind: "openFile",
      filePath: "/src/index.ts",
      line: -1,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("ExtensionMessageSchema", () => {
  it("validates loading message", () => {
    const parsed = ExtensionMessageSchema.safeParse({ kind: "loading" });
    expect(parsed.success).toBe(true);
  });

  it("validates error message", () => {
    const parsed = ExtensionMessageSchema.safeParse({
      kind: "error",
      message: "Failed to resolve call hierarchy",
    });
    expect(parsed.success).toBe(true);
  });

  it("validates graphData message", () => {
    const parsed = ExtensionMessageSchema.safeParse({
      kind: "graphData",
      nodes: [
        {
          id: "1",
          symbolName: "testFunc",
          filePath: "/src/test.ts",
          line: 1,
          isEntryPoint: false,
        },
      ],
      edges: [{ from: "1", to: "2" }],
      rootId: "1",
      hideTestFiles: true,
    });
    expect(parsed.success).toBe(true);
  });

  it("validates mermaidText message", () => {
    const parsed = ExtensionMessageSchema.safeParse({
      kind: "mermaidText",
      text: "graph TD\n    A --> B",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty error message", () => {
    const parsed = ExtensionMessageSchema.safeParse({
      kind: "error",
    });
    expect(parsed.success).toBe(false);
  });
});
