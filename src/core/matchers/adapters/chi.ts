// MARK: Chi Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const CHI_METHOD_PATTERN =
  /(?:^|\.)(?:Get|Post|Put|Patch|Delete|Options|Head|Route|Mount)$/;

export const chiAdapter: FrameworkAdapter = {
  name: "chi",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".go")) {
      return null;
    }

    const match = symbolName.match(CHI_METHOD_PATTERN);
    if (match) {
      const verb = match[0].replace(/^\./, "").toUpperCase();
      const result: EntryPointMatch = {
        type: "route",
        framework: "chi",
      };
      if (verb !== "ROUTE" && verb !== "MOUNT") {
        result.method = verb;
      }
      return result;
    }

    return null;
  },
};
