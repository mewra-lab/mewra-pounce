// MARK: C and C++ Adapter Tests
import { describe, expect, it } from "vitest";

import { cAdapter } from "../../../src/core/matchers/adapters/c";

describe("cAdapter", () => {
  it("detects main.c files", () => {
    const result = cAdapter.detect({
      filePath: "/src/main.c",
      symbolName: "init_system",
    });

    expect(result).toEqual({
      type: "route",
      framework: "c",
    });
  });

  it("detects main.cpp files", () => {
    const result = cAdapter.detect({
      filePath: "/src/main.cpp",
      symbolName: "run_event_loop",
    });

    expect(result).toEqual({
      type: "route",
      framework: "c",
    });
  });

  it("detects main function symbol in C/C++ files", () => {
    const result = cAdapter.detect({
      filePath: "/src/app.c",
      symbolName: "main",
    });

    expect(result).toEqual({
      type: "route",
      framework: "c",
    });
  });

  it("detects embedded app_main entry point", () => {
    const result = cAdapter.detect({
      filePath: "/src/firmware.c",
      symbolName: "app_main",
    });

    expect(result).toEqual({
      type: "route",
      framework: "c",
    });
  });

  it("detects Arduino setup and loop entry points", () => {
    const resultSetup = cAdapter.detect({
      filePath: "/src/sketch.cpp",
      symbolName: "setup",
    });
    const resultLoop = cAdapter.detect({
      filePath: "/src/sketch.cpp",
      symbolName: "loop",
    });

    expect(resultSetup).toEqual({
      type: "route",
      framework: "c",
    });
    expect(resultLoop).toEqual({
      type: "route",
      framework: "c",
    });
  });

  it("detects Crow C++ web route macro", () => {
    const result = cAdapter.detect({
      filePath: "/src/server.cpp",
      symbolName: "CROW_ROUTE",
    });

    expect(result).toEqual({
      type: "route",
      framework: "c",
    });
  });

  it("returns null for standard internal helper function", () => {
    const result = cAdapter.detect({
      filePath: "/src/utils/matrix.c",
      symbolName: "multiply_matrices",
    });

    expect(result).toBeNull();
  });

  it("returns null for non-C files", () => {
    const result = cAdapter.detect({
      filePath: "/src/main.py",
      symbolName: "main",
    });

    expect(result).toBeNull();
  });
});
