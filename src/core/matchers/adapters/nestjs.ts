// MARK: NestJS Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

export const nestjsAdapter: FrameworkAdapter = {
  name: "nestjs",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath } = target;

    if (filePath.endsWith(".go") || filePath.endsWith(".py")) {
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
