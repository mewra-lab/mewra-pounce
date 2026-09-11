export interface CallNode {
  id: string;
  symbolName: string;
  filePath: string;
  line: number;
  isEntryPoint: boolean;
  entryPointType?: "route" | "worker" | "cron" | "unknown" | undefined;
  framework?: string | undefined;
  isUnresolved?: true | undefined;
  isTestFile?: true | undefined;
}

export interface CallEdge {
  from: string;
  to: string;
}

export interface CallGraph {
  nodes: CallNode[];
  edges: CallEdge[];
  rootId: string;
}

export type FrameworkId =
  "express" | "fastify" | "nestjs" | "nextjs" | "worker";

export interface EntryPointMatch {
  type: "route" | "worker" | "cron";
  method?: string | undefined;
  path?: string | undefined;
  framework: FrameworkId;
}
