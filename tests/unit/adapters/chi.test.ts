// MARK: Chi Adapter Tests
import { describe, expect, it } from "vitest";

import { chiAdapter } from "../../../src/core/matchers/adapters/chi";

describe("chiAdapter", () => {
  it("detects r.Get", () => {
    const result = chiAdapter.detect({
      filePath: "/src/main.go",
      symbolName: "r.Get",
    });

    expect(result).toEqual({
      type: "route",
      framework: "chi",
      method: "GET",
    });
  });

  it("detects r.Post", () => {
    const result = chiAdapter.detect({
      filePath: "/src/router.go",
      symbolName: "r.Post",
    });

    expect(result).toEqual({
      type: "route",
      framework: "chi",
      method: "POST",
    });
  });

  it("detects r.Route without method verb", () => {
    const result = chiAdapter.detect({
      filePath: "/src/main.go",
      symbolName: "r.Route",
    });

    expect(result).toEqual({
      type: "route",
      framework: "chi",
    });
  });

  it("returns null for non-go file", () => {
    const result = chiAdapter.detect({
      filePath: "/src/routes.ts",
      symbolName: "r.Get",
    });

    expect(result).toBeNull();
  });
});
