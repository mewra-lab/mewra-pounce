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

  it("dispatches to fastapi adapter", () => {
    const result = matchEntryPoint({
      filePath: "/src/main.py",
      symbolName: "@app.get",
    });

    expect(result).toEqual({
      type: "route",
      framework: "fastapi",
      method: "GET",
    });
  });

  it("dispatches to gin adapter", () => {
    const result = matchEntryPoint({
      filePath: "/src/main.go",
      symbolName: "router.GET",
    });

    expect(result).toEqual({
      type: "route",
      framework: "gin",
      method: "GET",
    });
  });

  it("dispatches to plain python adapter", () => {
    const result = matchEntryPoint({
      filePath: "/src/cli.py",
      symbolName: "main",
    });

    expect(result).toEqual({
      type: "route",
      framework: "python",
    });
  });

  it("dispatches to plain go adapter", () => {
    const result = matchEntryPoint({
      filePath: "/cmd/main.go",
      symbolName: "main",
    });

    expect(result).toEqual({
      type: "route",
      framework: "go",
    });
  });

  it("dispatches to rust adapter", () => {
    const result = matchEntryPoint({
      filePath: "/src/main.rs",
      symbolName: "main",
    });

    expect(result).toEqual({
      type: "route",
      framework: "rust",
    });
  });

  it("dispatches to c adapter", () => {
    const result = matchEntryPoint({
      filePath: "/src/main.cpp",
      symbolName: "main",
    });

    expect(result).toEqual({
      type: "route",
      framework: "c",
    });
  });

  it("dispatches to java adapter", () => {
    const result = matchEntryPoint({
      filePath: "/src/UserController.java",
      symbolName: '@GetMapping("/users")',
    });

    expect(result).toEqual({
      type: "route",
      framework: "java",
      method: "GET",
    });
  });

  it("dispatches to csharp adapter", () => {
    const result = matchEntryPoint({
      filePath: "/src/UserController.cs",
      symbolName: '[HttpGet("api/users")]',
    });

    expect(result).toEqual({
      type: "route",
      framework: "csharp",
      method: "GET",
    });
  });

  it("dispatches to php adapter", () => {
    const result = matchEntryPoint({
      filePath: "/routes/api.php",
      symbolName: "Route::get",
    });

    expect(result).toEqual({
      type: "route",
      framework: "php",
      method: "GET",
    });
  });

  it("dispatches to swift adapter", () => {
    const result = matchEntryPoint({
      filePath: "/Sources/App/routes.swift",
      symbolName: "app.get",
    });

    expect(result).toEqual({
      type: "route",
      framework: "swift",
      method: "GET",
    });
  });

  it("dispatches to dart adapter", () => {
    const result = matchEntryPoint({
      filePath: "/bin/server.dart",
      symbolName: "router.get",
    });

    expect(result).toEqual({
      type: "route",
      framework: "dart",
      method: "GET",
    });
  });
});
