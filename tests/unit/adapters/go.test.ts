// MARK: Plain Go Adapter Tests
import { describe, expect, it } from "vitest";

import { goAdapter } from "../../../src/core/matchers/adapters/go";

describe("goAdapter", () => {
  it("detects main.go files", () => {
    const result = goAdapter.detect({
      filePath: "/cmd/app/main.go",
      symbolName: "run",
    });

    expect(result).toEqual({
      type: "route",
      framework: "go",
    });
  });

  it("detects main function in go file", () => {
    const result = goAdapter.detect({
      filePath: "/cmd/cli/root.go",
      symbolName: "main",
    });

    expect(result).toEqual({
      type: "route",
      framework: "go",
    });
  });

  it("returns null for standard go helper function", () => {
    const result = goAdapter.detect({
      filePath: "/pkg/utils/strings.go",
      symbolName: "Capitalize",
    });

    expect(result).toBeNull();
  });

  it("returns null for non-go files", () => {
    const result = goAdapter.detect({
      filePath: "/src/main.py",
      symbolName: "main",
    });

    expect(result).toBeNull();
  });
});
