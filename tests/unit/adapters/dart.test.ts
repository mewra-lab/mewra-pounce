// MARK: Dart and Flutter Adapter Tests
import { describe, expect, it } from "vitest";

import { dartAdapter } from "../../../src/core/matchers/adapters/dart";

describe("dartAdapter", () => {
  it("detects main.dart file entry point", () => {
    const result = dartAdapter.detect({
      filePath: "/lib/main.dart",
      symbolName: "setupConfig",
    });

    expect(result).toEqual({
      type: "route",
      framework: "dart",
    });
  });

  it("detects runApp entry point", () => {
    const result = dartAdapter.detect({
      filePath: "/lib/app.dart",
      symbolName: "runApp",
    });

    expect(result).toEqual({
      type: "route",
      framework: "dart",
    });
  });

  it("detects Flutter widget build lifecycle method", () => {
    const result = dartAdapter.detect({
      filePath: "/lib/screens/home.dart",
      symbolName: "build",
    });

    expect(result).toEqual({
      type: "route",
      framework: "dart",
    });
  });

  it("detects Shelf router.get route", () => {
    const result = dartAdapter.detect({
      filePath: "/bin/server.dart",
      symbolName: "router.get",
    });

    expect(result).toEqual({
      type: "route",
      framework: "dart",
      method: "GET",
    });
  });

  it("detects background worker entry pragma", () => {
    const result = dartAdapter.detect({
      filePath: "/lib/services/background.dart",
      symbolName: "@pragma('vm:entry-point') void callbackDispatcher()",
    });

    expect(result).toEqual({
      type: "worker",
      framework: "dart",
    });
  });

  it("returns null for standard Dart model method", () => {
    const result = dartAdapter.detect({
      filePath: "/lib/models/cart.dart",
      symbolName: "calculateTotal",
    });

    expect(result).toBeNull();
  });

  it("returns null for non-Dart files", () => {
    const result = dartAdapter.detect({
      filePath: "/lib/main.ts",
      symbolName: "runApp",
    });

    expect(result).toBeNull();
  });
});
