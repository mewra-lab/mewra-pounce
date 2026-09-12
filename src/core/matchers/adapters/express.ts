// MARK: Express Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const JS_TS_FILE_PATTERN = /\.(?:ts|tsx|js|jsx|mjs|cjs)$/i;

const ROUTE_METHOD_PATTERN =
  /^(?:app|router)\.(get|post|put|patch|delete|use)$/i;

export const expressAdapter: FrameworkAdapter = {
  name: "express",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!JS_TS_FILE_PATTERN.test(filePath)) {
      return null;
    }

    const methodMatch = symbolName.match(ROUTE_METHOD_PATTERN);
    if (methodMatch) {
      const method = methodMatch[1]?.toUpperCase();
      return {
        type: "route",
        framework: "express",
        method: method === "USE" ? undefined : method,
      };
    }

    if (filePath.includes("/routes/") || filePath.includes(".routes.")) {
      return {
        type: "route",
        framework: "express",
      };
    }

    return null;
  },
};
