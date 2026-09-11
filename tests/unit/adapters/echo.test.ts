// MARK: Echo Adapter Tests
import { describe, expect, it } from "vitest";

import { echoAdapter } from "../../../src/core/matchers/adapters/echo";

describe("echoAdapter", () => {
  it("detects e.GET", () => {
    const result = echoAdapter.detect({
      filePath: "/src/main.go",
      symbolName: "e.GET",
    });

    expect(result).toEqual({
      type: "route",
      framework: "echo",
      method: "GET",
    });
  });

  it("detects echo.Context in handler", () => {
    const result = echoAdapter.detect({
      filePath: "/src/handlers/item.go",
      symbolName: "GetItem(c echo.Context)",
    });

    expect(result).toEqual({
      type: "route",
      framework: "echo",
    });
  });

  it("detects Handler suffix in routes directory", () => {
    const result = echoAdapter.detect({
      filePath: "/src/routes/profile.go",
      symbolName: "ProfileHandler",
    });

    expect(result).toEqual({
      type: "route",
      framework: "echo",
    });
  });

  it("returns null for non-go file", () => {
    const result = echoAdapter.detect({
      filePath: "/src/main.py",
      symbolName: "e.GET",
    });

    expect(result).toBeNull();
  });
});
