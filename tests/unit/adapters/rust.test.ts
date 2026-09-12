// MARK: Rust Adapter Tests
import { describe, expect, it } from "vitest";

import { rustAdapter } from "../../../src/core/matchers/adapters/rust";

describe("rustAdapter", () => {
  it("detects main.rs files", () => {
    const result = rustAdapter.detect({
      filePath: "/src/main.rs",
      symbolName: "run_server",
    });

    expect(result).toEqual({
      type: "route",
      framework: "rust",
    });
  });

  it("detects main function symbol in rust file", () => {
    const result = rustAdapter.detect({
      filePath: "/src/bin/cli.rs",
      symbolName: "main",
    });

    expect(result).toEqual({
      type: "route",
      framework: "rust",
    });
  });

  it("detects Actix or Rocket route macros", () => {
    const result = rustAdapter.detect({
      filePath: "/src/handlers.rs",
      symbolName: '#[get("/items")]',
    });

    expect(result).toEqual({
      type: "route",
      framework: "rust",
      method: "GET",
    });
  });

  it("detects web or routing method symbols", () => {
    const result = rustAdapter.detect({
      filePath: "/src/routes.rs",
      symbolName: "routing::post",
    });

    expect(result).toEqual({
      type: "route",
      framework: "rust",
      method: "POST",
    });
  });

  it("returns null for standard rust internal function", () => {
    const result = rustAdapter.detect({
      filePath: "/src/utils.rs",
      symbolName: "format_uuid",
    });

    expect(result).toBeNull();
  });

  it("returns null for non-rust files", () => {
    const result = rustAdapter.detect({
      filePath: "/src/main.ts",
      symbolName: "main",
    });

    expect(result).toBeNull();
  });
});
