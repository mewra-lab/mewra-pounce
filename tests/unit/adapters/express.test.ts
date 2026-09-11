// MARK: Express Adapter Tests
import { describe, expect, it } from "vitest";

import { expressAdapter } from "../../../src/core/matchers/adapters/express";

describe("expressAdapter", () => {
  it("detects route methods on app", () => {
    const result = expressAdapter.detect({
      filePath: "/src/server.ts",
      symbolName: "app.get",
    });

    expect(result).toEqual({
      type: "route",
      framework: "express",
      method: "GET",
    });
  });

  it("detects route methods on router", () => {
    const result = expressAdapter.detect({
      filePath: "/src/user.ts",
      symbolName: "router.post",
    });

    expect(result).toEqual({
      type: "route",
      framework: "express",
      method: "POST",
    });
  });

  it("detects router.use without method verb", () => {
    const result = expressAdapter.detect({
      filePath: "/src/server.ts",
      symbolName: "router.use",
    });

    expect(result).toEqual({
      type: "route",
      framework: "express",
    });
  });

  it("detects functions located in routes directory", () => {
    const result = expressAdapter.detect({
      filePath: "/src/routes/user.ts",
      symbolName: "getUser",
    });

    expect(result).toEqual({
      type: "route",
      framework: "express",
    });
  });

  it("returns null for regular helper function", () => {
    const result = expressAdapter.detect({
      filePath: "/src/utils/math.ts",
      symbolName: "add",
    });

    expect(result).toBeNull();
  });
});
