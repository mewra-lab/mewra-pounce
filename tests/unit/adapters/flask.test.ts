// MARK: Flask Adapter Tests
import { describe, expect, it } from "vitest";

import { flaskAdapter } from "../../../src/core/matchers/adapters/flask";

describe("flaskAdapter", () => {
  it("detects app.route decorator", () => {
    const result = flaskAdapter.detect({
      filePath: "/src/app.py",
      symbolName: "@app.route",
    });

    expect(result).toEqual({
      type: "route",
      framework: "flask",
    });
  });

  it("detects blueprint route decorator", () => {
    const result = flaskAdapter.detect({
      filePath: "/src/blueprints/auth.py",
      symbolName: "@bp.route",
    });

    expect(result).toEqual({
      type: "route",
      framework: "flask",
    });
  });

  it("detects views directory file", () => {
    const result = flaskAdapter.detect({
      filePath: "/src/views/admin.py",
      symbolName: "admin_dashboard",
    });

    expect(result).toEqual({
      type: "route",
      framework: "flask",
    });
  });

  it("returns null for non-flask python file", () => {
    const result = flaskAdapter.detect({
      filePath: "/src/models/user.py",
      symbolName: "User",
    });

    expect(result).toBeNull();
  });
});
