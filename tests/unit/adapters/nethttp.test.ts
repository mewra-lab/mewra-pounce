// MARK: net/http Adapter Tests
import { describe, expect, it } from "vitest";

import { nethttpAdapter } from "../../../src/core/matchers/adapters/nethttp";

describe("nethttpAdapter", () => {
  it("detects http.HandleFunc", () => {
    const result = nethttpAdapter.detect({
      filePath: "/src/server.go",
      symbolName: "http.HandleFunc",
    });

    expect(result).toEqual({
      type: "route",
      framework: "nethttp",
    });
  });

  it("detects http.Handle", () => {
    const result = nethttpAdapter.detect({
      filePath: "/src/main.go",
      symbolName: "http.Handle",
    });

    expect(result).toEqual({
      type: "route",
      framework: "nethttp",
    });
  });

  it("detects ServeHTTP method", () => {
    const result = nethttpAdapter.detect({
      filePath: "/src/handler.go",
      symbolName: "ServeHTTP",
    });

    expect(result).toEqual({
      type: "route",
      framework: "nethttp",
    });
  });

  it("returns null for non-go file", () => {
    const result = nethttpAdapter.detect({
      filePath: "/src/server.ts",
      symbolName: "http.HandleFunc",
    });

    expect(result).toBeNull();
  });
});
