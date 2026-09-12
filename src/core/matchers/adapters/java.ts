// MARK: Java and Kotlin Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const JAVA_FILE_PATTERN = /\.(?:java|kt)$/i;

const JAVA_HTTP_ANNOTATIONS =
  /@(?:(Get|Post|Put|Delete|Patch)Mapping|RequestMapping)\b/i;

const JAVA_WORKER_ANNOTATIONS =
  /@(?:KafkaListener|RabbitListener|JmsListener|SqsListener|EventListener)\b/i;

const JAVA_CRON_ANNOTATIONS = /@Scheduled\b/i;

export const javaAdapter: FrameworkAdapter = {
  name: "java",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    if (!JAVA_FILE_PATTERN.test(filePath)) {
      return null;
    }

    if (JAVA_CRON_ANNOTATIONS.test(symbolName)) {
      return {
        type: "cron",
        framework: "java",
      };
    }

    if (JAVA_WORKER_ANNOTATIONS.test(symbolName)) {
      return {
        type: "worker",
        framework: "java",
      };
    }

    if (JAVA_HTTP_ANNOTATIONS.test(symbolName)) {
      const verbMatch = symbolName.match(
        /@(Get|Post|Put|Delete|Patch)Mapping\b/i,
      );
      const match: EntryPointMatch = {
        type: "route",
        framework: "java",
      };
      if (verbMatch?.[1]) {
        match.method = verbMatch[1].toUpperCase();
      }
      return match;
    }

    if (
      symbolName === "main" ||
      symbolName.startsWith("main(") ||
      symbolName.includes("@SpringBootApplication")
    ) {
      return {
        type: "route",
        framework: "java",
      };
    }

    return null;
  },
};
