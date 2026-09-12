// MARK: Swift Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const VAPOR_ROUTE_PATTERN = /(?:app|routes)\.(get|post|put|patch|delete)\b/i;

const SWIFT_ENTRY_SYMBOLS =
  /(?:^main$|@main|didFinishLaunchingWithOptions|viewDidLoad|body$|@IBAction)/;

export const swiftAdapter: FrameworkAdapter = {
  name: "swift",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".swift")) {
      return null;
    }

    const vaporMatch = symbolName.match(VAPOR_ROUTE_PATTERN);
    if (vaporMatch?.[1]) {
      return {
        type: "route",
        framework: "swift",
        method: vaporMatch[1].toUpperCase(),
      };
    }

    if (
      filePath.endsWith("main.swift") ||
      SWIFT_ENTRY_SYMBOLS.test(symbolName)
    ) {
      return {
        type: "route",
        framework: "swift",
      };
    }

    return null;
  },
};
