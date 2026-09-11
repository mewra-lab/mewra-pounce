// MARK: Django Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const DJANGO_URL_PATTERN = /(?:^|\/)urls\.py$/i;
const DJANGO_VIEW_PATTERN = /(?:^|\/)(?:views\.py|views\/)/i;

export const djangoAdapter: FrameworkAdapter = {
  name: "django",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".py")) {
      return null;
    }

    if (DJANGO_URL_PATTERN.test(filePath)) {
      return {
        type: "route",
        framework: "django",
      };
    }

    if (
      DJANGO_VIEW_PATTERN.test(filePath) &&
      /(?:View|ViewSet|APIView|as_view)/i.test(symbolName)
    ) {
      return {
        type: "route",
        framework: "django",
      };
    }

    return null;
  },
};
