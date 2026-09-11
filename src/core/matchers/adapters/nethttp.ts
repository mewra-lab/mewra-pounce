// MARK: Standard net/http Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const NET_HTTP_PATTERN =
  /(?:http\.HandleFunc|http\.Handle|http\.ListenAndServe|ServeHTTP)$/;

export const nethttpAdapter: FrameworkAdapter = {
  name: "nethttp",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".go")) {
      return null;
    }

    if (NET_HTTP_PATTERN.test(symbolName)) {
      return {
        type: "route",
        framework: "nethttp",
      };
    }

    return null;
  },
};
