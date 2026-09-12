// MARK: C and C++ Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const C_FILE_PATTERN = /\.(?:c|cpp|cc|cxx|h|hpp)$/i;

const C_ENTRY_SYMBOLS =
  /(?:^main$|^app_main$|^setup$|^loop$|CROW_ROUTE|ADD_METHOD_TO)/;

export const cAdapter: FrameworkAdapter = {
  name: "c",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!C_FILE_PATTERN.test(filePath)) {
      return null;
    }

    if (
      /(?:^|\/)main\.(?:c|cpp|cc|cxx)$/i.test(filePath) ||
      C_ENTRY_SYMBOLS.test(symbolName)
    ) {
      return {
        type: "route",
        framework: "c",
      };
    }

    return null;
  },
};
