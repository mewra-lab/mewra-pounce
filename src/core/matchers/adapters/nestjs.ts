// MARK: NestJS Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const JS_TS_FILE_PATTERN = /\.(?:ts|tsx|js|jsx|mjs|cjs)$/i;

export const nestjsAdapter: FrameworkAdapter = {
  name: "nestjs",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath } = target;

    if (!JS_TS_FILE_PATTERN.test(filePath)) {
      return null;
    }

    if (
      filePath.includes(".controller.") ||
      filePath.includes(".resolver.") ||
      filePath.includes(".gateway.")
    ) {
      return {
        type: "route",
        framework: "nestjs",
      };
    }

    return null;
  },
};
