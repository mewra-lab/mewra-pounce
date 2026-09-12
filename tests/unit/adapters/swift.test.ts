// MARK: Swift Adapter Tests
import { describe, expect, it } from "vitest";

import { swiftAdapter } from "../../../src/core/matchers/adapters/swift";

describe("swiftAdapter", () => {
  it("detects Vapor app.get route", () => {
    const result = swiftAdapter.detect({
      filePath: "/Sources/App/routes.swift",
      symbolName: "app.get",
    });

    expect(result).toEqual({
      type: "route",
      framework: "swift",
      method: "GET",
    });
  });

  it("detects Vapor routes.post route", () => {
    const result = swiftAdapter.detect({
      filePath: "/Sources/App/routes.swift",
      symbolName: "routes.post",
    });

    expect(result).toEqual({
      type: "route",
      framework: "swift",
      method: "POST",
    });
  });

  it("detects @main entry point", () => {
    const result = swiftAdapter.detect({
      filePath: "/Sources/App/Entry.swift",
      symbolName: "@main struct MyApp",
    });

    expect(result).toEqual({
      type: "route",
      framework: "swift",
    });
  });

  it("detects main.swift entry file", () => {
    const result = swiftAdapter.detect({
      filePath: "/Sources/App/main.swift",
      symbolName: "bootstrapServer",
    });

    expect(result).toEqual({
      type: "route",
      framework: "swift",
    });
  });

  it("detects UIKit viewDidLoad entry lifecycle", () => {
    const result = swiftAdapter.detect({
      filePath: "/Sources/UI/ProfileViewController.swift",
      symbolName: "viewDidLoad",
    });

    expect(result).toEqual({
      type: "route",
      framework: "swift",
    });
  });

  it("returns null for standard Swift model method", () => {
    const result = swiftAdapter.detect({
      filePath: "/Sources/Models/User.swift",
      symbolName: "calculateDiscount",
    });

    expect(result).toBeNull();
  });

  it("returns null for non-Swift files", () => {
    const result = swiftAdapter.detect({
      filePath: "/Sources/App/routes.ts",
      symbolName: "app.get",
    });

    expect(result).toBeNull();
  });
});
