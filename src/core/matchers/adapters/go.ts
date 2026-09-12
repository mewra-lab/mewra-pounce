// MARK: Plain Go Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const GO_ENTRY_FILES = /(?:^|\/)main\.go$/i;

export const goAdapter: FrameworkAdapter = {
  name: "go",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".go")) {
      return null;
    }

    if (GO_ENTRY_FILES.test(filePath) || symbolName === "main") {
      return {
        type: "route",
        framework: "go",
      };
    }

    return null;
  },
};
