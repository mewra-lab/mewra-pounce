// MARK: Plain Python Adapter Tests
import { describe, expect, it } from "vitest";

import { pythonAdapter } from "../../../src/core/matchers/adapters/python";

describe("pythonAdapter", () => {
  it("detects main.py script files", () => {
    const result = pythonAdapter.detect({
      filePath: "/src/main.py",
      symbolName: "run_pipeline",
    });

    expect(result).toEqual({
      type: "route",
      framework: "python",
    });
  });

  it("detects cli.py script files", () => {
    const result = pythonAdapter.detect({
      filePath: "/src/cli.py",
      symbolName: "parse_args",
    });

    expect(result).toEqual({
      type: "route",
      framework: "python",
    });
  });

  it("detects main function symbol in any python file", () => {
    const result = pythonAdapter.detect({
      filePath: "/src/pipeline/etl.py",
      symbolName: "main",
    });

    expect(result).toEqual({
      type: "route",
      framework: "python",
    });
  });

  it("detects click command decorator", () => {
    const result = pythonAdapter.detect({
      filePath: "/src/commands.py",
      symbolName: "@click.command",
    });

    expect(result).toEqual({
      type: "route",
      framework: "python",
    });
  });

  it("returns null for standard python utility function", () => {
    const result = pythonAdapter.detect({
      filePath: "/src/utils/format.py",
      symbolName: "format_date",
    });

    expect(result).toBeNull();
  });

  it("returns null for non-python files", () => {
    const result = pythonAdapter.detect({
      filePath: "/src/main.ts",
      symbolName: "main",
    });

    expect(result).toBeNull();
  });
});
