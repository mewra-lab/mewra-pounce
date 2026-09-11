// MARK: Flask Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const FLASK_ROUTE_PATTERN =
  /(?:@(?:app|bp|blueprint|api)\.route|app\.add_url_rule)/i;

export const flaskAdapter: FrameworkAdapter = {
  name: "flask",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".py")) {
      return null;
    }

    if (FLASK_ROUTE_PATTERN.test(symbolName)) {
      return {
        type: "route",
        framework: "flask",
      };
    }

    if (
      (filePath.includes("/blueprints/") || filePath.includes("/views/")) &&
      filePath.endsWith(".py")
    ) {
      return {
        type: "route",
        framework: "flask",
      };
    }

    return null;
  },
};
