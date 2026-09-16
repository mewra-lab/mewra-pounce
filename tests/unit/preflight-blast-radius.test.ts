import { describe, expect, it } from "vitest";

import { preflightBlastRadiusCheck } from "../../src/core/preflight/blast-radius-check";
import {
  buildMermaidDiagram,
  scanEntryPoints,
} from "../../src/core/preflight/entry-point-scanner";
import type { GitDiff } from "../../src/shared/preflight-api";

function makeDiff(paths: string[], rawPatch: string): GitDiff {
  return {
    baseBranch: "main",
    headBranch: "feat/test",
    changedFiles: paths.map((path) => ({ path, status: "modified" as const })),
    rawPatch,
  };
}

const expressPatch = `diff --git a/src/routes/user.ts b/src/routes/user.ts
@@ -1,3 +1,5 @@
+router.get('/api/users', handler)
+router.post('/api/users', createUser)
`;

describe("PreFlight blast-radius check", () => {
  it("detects changed route declarations without using the editor or LSP", () => {
    const routes = scanEntryPoints(
      makeDiff(["src/routes/user.ts"], expressPatch),
    );
    expect(routes).toMatchObject([
      { method: "GET", route: "/api/users", file: "src/routes/user.ts" },
      { method: "POST", route: "/api/users", file: "src/routes/user.ts" },
    ]);
  });

  it("infers a Next.js route when its handler signature is unchanged", () => {
    const routes = scanEntryPoints(
      makeDiff(
        ["apps/web/src/app/api/orders/route.ts"],
        `diff --git a/apps/web/src/app/api/orders/route.ts b/apps/web/src/app/api/orders/route.ts
@@ -10,1 +10,2 @@
+const cacheTtl = 60;
`,
      ),
    );
    expect(routes).toContainEqual({
      method: "ANY",
      route: "/api/orders",
      file: "apps/web/src/app/api/orders/route.ts",
    });
  });

  it("returns a warning and a Mermaid summary when routes are impacted", async () => {
    const result = await preflightBlastRadiusCheck.run(
      makeDiff(["src/routes/user.ts"], expressPatch),
      {
        workspaceRoot: "/workspace",
        resolveTool: async () => null,
        runCommand: async () => ({ stdout: "", stderr: "", code: 0 }),
      },
    );
    expect(result.status).toBe("warning");
    expect(result.routes).toHaveLength(2);
    expect(result.mermaid).toContain("graph TD");
  });

  it("does not run for non-code diffs", () => {
    expect(
      preflightBlastRadiusCheck.appliesTo(makeDiff(["README.md"], "")),
    ).toBe(false);
  });

  it("creates a Mermaid placeholder for an empty input", () => {
    expect(buildMermaidDiagram([], [])).toContain("No entry points detected");
  });
});
