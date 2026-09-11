import { z } from "zod";

export const WebviewMessageSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("toggleTestFiles"),
  }),
  z.object({
    kind: z.literal("exportMermaid"),
  }),
  z.object({
    kind: z.literal("openFile"),
    filePath: z.string(),
    line: z.number().int().nonnegative(),
  }),
  z.object({
    kind: z.literal("ready"),
  }),
]);

export type WebviewMessage = z.infer<typeof WebviewMessageSchema>;

export const ExtensionMessageSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("graphData"),
    nodes: z.array(
      z.object({
        id: z.string(),
        symbolName: z.string(),
        filePath: z.string(),
        line: z.number(),
        isEntryPoint: z.boolean(),
        entryPointType: z
          .enum(["route", "worker", "cron", "unknown"])
          .optional(),
        framework: z.string().optional(),
        isUnresolved: z.boolean().optional(),
        isTestFile: z.boolean().optional(),
      }),
    ),
    edges: z.array(
      z.object({
        from: z.string(),
        to: z.string(),
      }),
    ),
    rootId: z.string(),
  }),
  z.object({
    kind: z.literal("loading"),
  }),
  z.object({
    kind: z.literal("error"),
    message: z.string(),
  }),
  z.object({
    kind: z.literal("mermaidText"),
    text: z.string(),
  }),
]);

export type ExtensionMessage = z.infer<typeof ExtensionMessageSchema>;
