// MARK: Gin Adapter Tests
import { describe, expect, it } from "vitest";

import { ginAdapter } from "../../../src/core/matchers/adapters/gin";

describe("ginAdapter", () => {
  it("detects router.GET", () => {
    const result = ginAdapter.detect({
      filePath: "/src/main.go",
      symbolName: "router.GET",
    });

    expect(result).toEqual({
      type: "route",
      framework: "gin",
      method: "GET",
    });
  });

  it("detects group.POST", () => {
    const result = ginAdapter.detect({
      filePath: "/src/server.go",
      symbolName: "v1.POST",
    });

    expect(result).toEqual({
      type: "route",
      framework: "gin",
      method: "POST",
    });
  });

  it("detects handlers with gin.Context", () => {
    const result = ginAdapter.detect({
      filePath: "/src/handlers/user.go",
      symbolName: "GetUser(c *gin.Context)",
    });

    expect(result).toEqual({
      type: "route",
      framework: "gin",
    });
  });

  it("returns null for non-go file", () => {
    const result = ginAdapter.detect({
      filePath: "/src/main.ts",
      symbolName: "router.GET",
    });

    expect(result).toBeNull();
  });
});
