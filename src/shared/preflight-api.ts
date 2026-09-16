export type CheckSeverity = "error" | "warning";

export type ChangedFile = {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
  oldPath?: string;
};

export type GitDiff = {
  baseBranch: string;
  headBranch: string;
  changedFiles: ChangedFile[];
  rawPatch: string;
};

export type RouteChip = {
  method: string;
  route: string;
  file: string;
  line?: number;
};

export type CheckFinding = {
  file: string;
  line: number;
  message: string;
};

export type CheckResult = {
  status: "pass" | "fail" | "warning" | "not-configured" | "skipped";
  findings: CheckFinding[];
  message?: string;
  mermaid?: string;
  routes?: RouteChip[];
};

export type PreFlightContext = {
  workspaceRoot: string;
  resolveTool(binName: string): Promise<string | null>;
  runCommand(
    command: string,
    args: string[],
    cwd?: string,
    timeoutMs?: number,
  ): Promise<{ stdout: string; stderr: string; code: number }>;
};

export type PreFlightCheck = {
  readonly id: string;
  readonly label: string;
  readonly severity: CheckSeverity;
  readonly pack: string;
  appliesTo(diff: GitDiff): boolean;
  run(diff: GitDiff, context: PreFlightContext): Promise<CheckResult>;
};

export type PreFlightApi = {
  readonly apiVersion: 1;
  registerCheck(check: PreFlightCheck): { dispose(): void };
};
