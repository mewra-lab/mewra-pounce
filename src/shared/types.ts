export interface CallNode {
  id: string;
  symbolName: string;
  filePath: string;
  line: number;
  isEntryPoint: boolean;
  entryPointType?: "route" | "worker" | "cron" | "unknown";
  framework?: string;
  isUnresolved?: true;
  isTestFile?: true;
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

export type FrameworkId = "express" | "fastify" | "nestjs" | "nextjs";

export interface EntryPointMatch {
  type: "route" | "worker" | "cron";
  method?: string;
  path?: string;
  framework: FrameworkId;
}
