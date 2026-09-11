// MARK: Fastify Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const FASTIFY_PATTERN =
  /^fastify\.(get|post|put|patch|delete|route|register)$/i;

export const fastifyAdapter: FrameworkAdapter = {
  name: "fastify",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (filePath.endsWith(".go") || filePath.endsWith(".py")) {
      return null;
    }

    const match = symbolName.match(FASTIFY_PATTERN);
    if (match) {
      const verb = match[1]?.toUpperCase();
      return {
        type: "route",
        framework: "fastify",
        method: verb === "ROUTE" || verb === "REGISTER" ? undefined : verb,
      };
    }

    return null;
  },
};
