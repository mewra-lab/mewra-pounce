// MARK: Worker Adapter Tests
import { describe, expect, it } from "vitest";

import { workerAdapter } from "../../../src/core/matchers/adapters/worker";

describe("workerAdapter", () => {
  it("detects worker file extensions", () => {
    const result = workerAdapter.detect({
      filePath: "/src/workers/email.worker.ts",
      symbolName: "sendEmail",
    });

    expect(result).toEqual({
      type: "worker",
      framework: "worker",
    });
  });

  it("detects cron file paths as cron type", () => {
    const result = workerAdapter.detect({
      filePath: "/src/cron/nightly-cleanup.cron.ts",
      symbolName: "runCleanup",
    });

    expect(result).toEqual({
      type: "cron",
      framework: "worker",
    });
  });

  it("detects BullMQ or generic worker symbol names", () => {
    const result = workerAdapter.detect({
      filePath: "/src/services/billing.ts",
      symbolName: "QueueWorker",
    });

    expect(result).toEqual({
      type: "worker",
      framework: "worker",
    });
  });

  it("detects @Cron decorator or symbol", () => {
    const result = workerAdapter.detect({
      filePath: "/src/services/tasks.ts",
      symbolName: "@Cron",
    });

    expect(result).toEqual({
      type: "cron",
      framework: "worker",
    });
  });

  it("detects Python Celery task decorators", () => {
    const result = workerAdapter.detect({
      filePath: "/src/tasks.py",
      symbolName: "@app.task",
    });

    expect(result).toEqual({
      type: "worker",
      framework: "worker",
    });
  });

  it("detects Go worker files", () => {
    const result = workerAdapter.detect({
      filePath: "/src/jobs/exporter.worker.go",
      symbolName: "ProcessTask",
    });

    expect(result).toEqual({
      type: "worker",
      framework: "worker",
    });
  });

  it("returns null for standard utility function", () => {
    const result = workerAdapter.detect({
      filePath: "/src/utils/format.ts",
      symbolName: "formatDate",
    });

    expect(result).toBeNull();
  });
});
