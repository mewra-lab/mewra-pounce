// MARK: CSharp Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const CSHARP_HTTP_ATTRIBUTES =
  /\[(?:(Http(?:Get|Post|Put|Delete|Patch))|Route)\b/i;

const CSHARP_MINIMAL_API_PATTERN = /\.Map(Get|Post|Put|Delete|Patch)\b/i;

const CSHARP_WORKER_ATTRIBUTES =
  /\[(?:Queue|QueueTrigger|ServiceBusTrigger|EventHubTrigger|Topic)\b/i;

const CSHARP_CRON_ATTRIBUTES = /\[TimerTrigger\b/i;

export const csharpAdapter: FrameworkAdapter = {
  name: "csharp",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!filePath.endsWith(".cs")) {
      return null;
    }

    if (CSHARP_CRON_ATTRIBUTES.test(symbolName)) {
      return {
        type: "cron",
        framework: "csharp",
      };
    }

    if (CSHARP_WORKER_ATTRIBUTES.test(symbolName)) {
      return {
        type: "worker",
        framework: "csharp",
      };
    }

    if (CSHARP_HTTP_ATTRIBUTES.test(symbolName)) {
      const verbMatch = symbolName.match(
        /\[Http(Get|Post|Put|Delete|Patch)\b/i,
      );
      const match: EntryPointMatch = {
        type: "route",
        framework: "csharp",
      };
      if (verbMatch?.[1]) {
        match.method = verbMatch[1].toUpperCase();
      }
      return match;
    }

    const minimalApiMatch = symbolName.match(CSHARP_MINIMAL_API_PATTERN);
    if (minimalApiMatch?.[1]) {
      return {
        type: "route",
        framework: "csharp",
        method: minimalApiMatch[1].toUpperCase(),
      };
    }

    if (
      filePath.endsWith("Program.cs") ||
      symbolName === "Main" ||
      symbolName.startsWith("Main(")
    ) {
      return {
        type: "route",
        framework: "csharp",
      };
    }

    return null;
  },
};
