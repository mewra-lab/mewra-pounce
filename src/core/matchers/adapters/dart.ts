// MARK: Dart and Flutter Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const DART_SHELF_PATTERN = /(?:router|app)\.(get|post|put|patch|delete)\b/i;

const DART_ENTRY_SYMBOLS =
  /(?:^main$|runApp|build|initState|onRequest|@pragma\('vm:entry-point'\))/;

export const dartAdapter: FrameworkAdapter = {
  name: "dart",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".dart")) {
      return null;
    }

    if (symbolName.includes("@pragma('vm:entry-point')")) {
      return {
        type: "worker",
        framework: "dart",
      };
    }

    const shelfMatch = symbolName.match(DART_SHELF_PATTERN);
    if (shelfMatch?.[1]) {
      return {
        type: "route",
        framework: "dart",
        method: shelfMatch[1].toUpperCase(),
      };
    }

    if (filePath.endsWith("main.dart") || DART_ENTRY_SYMBOLS.test(symbolName)) {
      return {
        type: "route",
        framework: "dart",
      };
    }

    return null;
  },
};
