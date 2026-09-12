// MARK: PHP Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const PHP_ROUTE_PATTERN =
  /Route::(get|post|put|patch|delete|any|resource|apiResource)\b/i;

const PHP_ATTRIBUTE_ROUTE = /#\[Route\b/i;

const PHP_QUEUE_PATTERN =
  /(?:ShouldQueue|implements\s+ShouldQueue|Job::dispatch)/i;

export const phpAdapter: FrameworkAdapter = {
  name: "php",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".php")) {
      return null;
    }

    if (PHP_QUEUE_PATTERN.test(symbolName)) {
      return {
        type: "worker",
        framework: "php",
      };
    }

    if (PHP_ATTRIBUTE_ROUTE.test(symbolName)) {
      return {
        type: "route",
        framework: "php",
      };
    }

    const routeMatch = symbolName.match(PHP_ROUTE_PATTERN);
    if (routeMatch?.[1]) {
      const verb = routeMatch[1].toUpperCase();
      const match: EntryPointMatch = {
        type: "route",
        framework: "php",
      };
      if (verb !== "RESOURCE" && verb !== "APIRESOURCE" && verb !== "ANY") {
        match.method = verb;
      }
      return match;
    }

    if (
      filePath.endsWith("index.php") ||
      filePath.endsWith("artisan") ||
      symbolName === "handle" ||
      symbolName === "__invoke"
    ) {
      return {
        type: "route",
        framework: "php",
      };
    }

    return null;
  },
};
