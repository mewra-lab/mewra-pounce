// MARK: Echo Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const ECHO_METHOD_PATTERN =
  /(?:^|\.)(?:GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD|Any)$/;

export const echoAdapter: FrameworkAdapter = {
  name: "echo",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".go")) {
      return null;
    }

    if (
      /(?:echo\.Context)/i.test(symbolName) ||
      (/\/(?:routes?|handlers?)\//i.test(filePath) &&
        /(?:Handler|Controller)$/i.test(symbolName))
    ) {
      return {
        type: "route",
        framework: "echo",
      };
    }

    const match = symbolName.match(ECHO_METHOD_PATTERN);
    if (match) {
      const verb = match[0].replace(/^\./, "").toUpperCase();
      const result: EntryPointMatch = {
        type: "route",
        framework: "echo",
      };
      if (verb !== "ANY") {
        result.method = verb;
      }
      return result;
    }

    return null;
  },
};
