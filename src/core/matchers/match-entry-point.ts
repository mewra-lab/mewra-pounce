// MARK: Match Entry Point
import type { EntryPointMatch } from "../../shared/types";
import { ALL_ADAPTERS } from "./adapters";
import type { HierarchyTarget } from "./adapters";

export type MatchableItem =
  | HierarchyTarget
  | {
      uri: { fsPath: string };
      name: string;
      selectionRange?: { start: { line: number } };
    };

function toHierarchyTarget(item: MatchableItem): HierarchyTarget {
  if ("filePath" in item) {
    return item;
  }

  return {
    filePath: item.uri.fsPath,
    symbolName: item.name,
    line: item.selectionRange?.start.line,
  };
}

export function matchEntryPoint(
  item: MatchableItem,
  enabledFrameworks?: string[],
): EntryPointMatch | null {
  const target = toHierarchyTarget(item);

  for (const adapter of ALL_ADAPTERS) {
    if (enabledFrameworks && !enabledFrameworks.includes(adapter.name)) {
      continue;
    }

    const result = adapter.detect(target);
    if (result) {
      return result;
    }
  }

  return null;
}
