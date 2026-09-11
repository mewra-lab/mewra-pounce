// MARK: Types
import type { EntryPointMatch } from "../../../shared/types";

export interface HierarchyTarget {
  filePath: string;
  symbolName: string;
  line?: number | undefined;
}

export interface FrameworkAdapter {
  name: string;
  detect(target: HierarchyTarget): EntryPointMatch | null;
}
