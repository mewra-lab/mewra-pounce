// MARK: Gin Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const GIN_METHOD_PATTERN =
  /(?:^|\.)(?:GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD|Any)$/;

export const ginAdapter: FrameworkAdapter = {
  name: "gin",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".go")) {
      return null;
    }

    const match = symbolName.match(GIN_METHOD_PATTERN);
    if (match) {
      const verb = match[0].replace(/^\./, "").toUpperCase();
      const result: EntryPointMatch = {
        type: "route",
        framework: "gin",
      };
      if (verb !== "ANY") {
        result.method = verb;
      }
      return result;
    }

    if (
      /(?:routes?|handlers?|controllers?)\/[^/]+\.go$/i.test(filePath) &&
      /gin\.Context/i.test(symbolName)
    ) {
      return {
        type: "route",
        framework: "gin",
      };
    }

    return null;
  },
};
