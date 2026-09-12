// MARK: Plain Python Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const PYTHON_ENTRY_FILES =
  /(?:^|\/)(?:main|__main__|cli|run|app|manage|script)\.py$/i;

const PYTHON_ENTRY_SYMBOLS =
  /(?:^main$|^cli$|^run$|^execute$|^start$|@click\.(?:command|group)|@app\.command)/i;

export const pythonAdapter: FrameworkAdapter = {
  name: "python",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".py")) {
      return null;
    }

    const isEntryFile = PYTHON_ENTRY_FILES.test(filePath);
    const isEntrySymbol = PYTHON_ENTRY_SYMBOLS.test(symbolName);

    if (isEntryFile || isEntrySymbol) {
      return {
        type: "route",
        framework: "python",
      };
    }

    return null;
  },
};
