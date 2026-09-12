// MARK: Rust Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const RUST_ROUTE_MACRO_PATTERN =
  /#\[(?:get|post|put|patch|delete|head|options)\b/i;

const RUST_METHOD_PATTERN =
  /(?:web::|routing::)?(get|post|put|patch|delete|head|options)$/i;

export const rustAdapter: FrameworkAdapter = {
  name: "rust",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".rs")) {
      return null;
    }

    if (filePath.endsWith("main.rs") || symbolName === "main") {
      return {
        type: "route",
        framework: "rust",
      };
    }

    if (RUST_ROUTE_MACRO_PATTERN.test(symbolName)) {
      const verbMatch = symbolName.match(
        /#\[(get|post|put|patch|delete|head|options)/i,
      );
      const match: EntryPointMatch = {
        type: "route",
        framework: "rust",
      };
      if (verbMatch?.[1]) {
        match.method = verbMatch[1].toUpperCase();
      }
      return match;
    }

    const methodMatch = symbolName.match(RUST_METHOD_PATTERN);
    if (methodMatch?.[1]) {
      return {
        type: "route",
        framework: "rust",
        method: methodMatch[1].toUpperCase(),
      };
    }

    return null;
  },
};
