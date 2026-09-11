// MARK: FastAPI Adapter Tests
import { describe, expect, it } from "vitest";

import { fastapiAdapter } from "../../../src/core/matchers/adapters/fastapi";

describe("fastapiAdapter", () => {
  it("detects route decorator with HTTP verb", () => {
    const result = fastapiAdapter.detect({
      filePath: "/src/main.py",
      symbolName: "@app.get",
    });

    expect(result).toEqual({
      type: "route",
      framework: "fastapi",
      method: "GET",
    });
  });

  it("detects router decorator with POST verb", () => {
    const result = fastapiAdapter.detect({
      filePath: "/src/routers/items.py",
      symbolName: "@router.post",
    });

    expect(result).toEqual({
      type: "route",
      framework: "fastapi",
      method: "POST",
    });
  });

  it("detects python files in routers directory", () => {
    const result = fastapiAdapter.detect({
      filePath: "/src/routers/users.py",
      symbolName: "get_current_user",
    });

    expect(result).toEqual({
      type: "route",
      framework: "fastapi",
    });
  });

  it("returns null for non-fastapi python utility", () => {
    const result = fastapiAdapter.detect({
      filePath: "/src/utils/calc.py",
      symbolName: "compute_hash",
    });

    expect(result).toBeNull();
  });
});
