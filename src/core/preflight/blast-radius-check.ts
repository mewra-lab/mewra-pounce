import type { PreFlightCheck } from "../../shared/preflight-api";
import { buildMermaidDiagram, scanEntryPoints } from "./entry-point-scanner";

const routeExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".go",
  ".py",
  ".php",
  ".rb",
  ".rs",
]);

export const preflightBlastRadiusCheck: PreFlightCheck = {
  id: "pounce:blast-radius",
  label: "Mewra Pounce — Blast Radius",
  severity: "warning",
  pack: "pounce",
  appliesTo(diff) {
    return diff.changedFiles.some((file) =>
      routeExtensions.has(file.path.slice(file.path.lastIndexOf("."))),
    );
  },
  async run(diff) {
    const routes = scanEntryPoints(diff);
    if (routes.length === 0) {
      return {
        status: "pass",
        findings: [],
        message: "No impacted entry points detected in this diff.",
      };
    }
    const modifiedFiles = diff.changedFiles
      .filter((file) => file.status !== "deleted")
      .map((file) => file.path);
    return {
      status: "warning",
      findings: routes.map((route) => ({
        file: route.file,
        line: route.line ?? 0,
        message: `Entry point reached: ${route.method} ${route.route}`,
      })),
      message: `${routes.length} entry point${routes.length === 1 ? "" : "s"} impacted by this diff.`,
      mermaid: buildMermaidDiagram(routes, modifiedFiles),
      routes,
    };
  },
};
