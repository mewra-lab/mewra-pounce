// MARK: Worker & Cron Adapter
import type { EntryPointMatch } from "../../../shared/types";
import type { FrameworkAdapter, HierarchyTarget } from "./types";

const WORKER_FILE_PATTERN =
  /(?:\.(?:worker|cron|job|queue)\.(?:ts|tsx|js|jsx|mjs|py|go)$|\/(?:workers|jobs|queues|cron|tasks)\/|(?:^|\/)(?:tasks|celery)\.py$)/i;

const WORKER_SYMBOL_PATTERN =
  /(?:QueueWorker|Worker|CronJob|JobHandler|defineJob|processJob|handleJob|handleTask|@Cron|@Interval|@Timeout|@Process|@app\.task|@shared_task|ProcessTask|HandleTask|asynq\.Handler)/i;

export const workerAdapter: FrameworkAdapter = {
  name: "worker",
  detect(target: HierarchyTarget): EntryPointMatch | null {
    const { filePath, symbolName } = target;

    const isWorkerFile = WORKER_FILE_PATTERN.test(filePath);
    const isWorkerSymbol = WORKER_SYMBOL_PATTERN.test(symbolName);

    if (isWorkerFile || isWorkerSymbol) {
      const isCron =
        filePath.includes(".cron.") ||
        filePath.includes("/cron/") ||
        /cron/i.test(symbolName);

      return {
        type: isCron ? "cron" : "worker",
        framework: "worker",
      };
    }

    return null;
  },
};
