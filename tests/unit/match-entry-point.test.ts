// MARK: Match Entry Point Tests
import { describe, expect, it } from "vitest";

import { matchEntryPoint } from "../../src/core/matchers/match-entry-point";

describe("matchEntryPoint", () => {
  it("dispatches to express adapter", () => {
    const result = matchEntryPoint({
      filePath: "/src/routes/api.ts",
      symbolName: "app.get",
    });

    expect(result).toEqual({
      type: "route",
      framework: "express",
      method: "GET",
    });
  });

  it("dispatches to worker adapter", () => {
    const result = matchEntryPoint({
      filePath: "/src/jobs/process.worker.ts",
      symbolName: "processJob",
    });

    expect(result).toEqual({
      type: "worker",
      framework: "worker",
    });
  });

  it("respects enabledFrameworks filter", () => {
    const result = matchEntryPoint(
      {
        filePath: "/src/server.ts",
        symbolName: "app.get",
      },
      ["fastify", "nestjs"],
    );

    expect(result).toBeNull();
  });

  it("allows match when framework is in enabledFrameworks", () => {
    const result = matchEntryPoint(
      {
        filePath: "/src/server.ts",
        symbolName: "app.get",
      },
      ["express"],
    );

    expect(result).toEqual({
      type: "route",
      framework: "express",
      method: "GET",
    });
  });

  it("returns null when no adapter matches", () => {
    const result = matchEntryPoint({
      filePath: "/src/helpers/calc.ts",
      symbolName: "sum",
    });

    expect(result).toBeNull();
  });

  it("accepts object with uri and name", () => {
    const result = matchEntryPoint({
      uri: { fsPath: "/src/pages/api/auth.ts" },
      name: "default",
    });

    expect(result).toEqual({
      type: "route",
      framework: "nextjs",
    });
  });
});
