// MARK: FastAPI Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const FASTAPI_ROUTE_PATTERN =
  /(?:@(?:app|router)\.(get|post|put|patch|delete|options|head)|(?:app|router)\.(get|post|put|patch|delete|options|head))/i;

const FASTAPI_PATH_PATTERN =
  /(?:routers\/|endpoints\/|api\/v\d+\/|(?:^|\/)routers?\.py$)/i;

export const fastapiAdapter: FrameworkAdapter = {
  name: "fastapi",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".py")) {
      return null;
    }

    const routeMatch = symbolName.match(FASTAPI_ROUTE_PATTERN);
    if (routeMatch) {
      const verb = (routeMatch[1] ?? routeMatch[2])?.toUpperCase();
      const match: EntryPointMatch = {
        type: "route",
        framework: "fastapi",
      };
      if (verb) {
        match.method = verb;
      }
      return match;
    }

    if (FASTAPI_PATH_PATTERN.test(filePath) && filePath.endsWith(".py")) {
      return {
        type: "route",
        framework: "fastapi",
      };
    }

    return null;
  },
};
