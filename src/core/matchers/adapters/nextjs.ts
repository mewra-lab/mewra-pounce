// MARK: Next.js Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const HTTP_METHODS_PATTERN = /^(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/i;

export const nextjsAdapter: FrameworkAdapter = {
  name: "nextjs",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    const isPagesApi = /\/pages\/api\//.test(filePath);
    const isAppRoute = /\/app\/.*\/route\.(?:ts|js|mjs)$/.test(filePath);

    if (isPagesApi) {
      return {
        type: "route",
        framework: "nextjs",
      };
    }

    if (isAppRoute) {
      if (HTTP_METHODS_PATTERN.test(symbolName)) {
        return {
          type: "route",
          framework: "nextjs",
          method: symbolName.toUpperCase(),
        };
      }
      return {
        type: "route",
        framework: "nextjs",
      };
    }

    return null;
  },
};
