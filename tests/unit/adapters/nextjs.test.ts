// MARK: Next.js Adapter Tests
import { describe, expect, it } from "vitest";

import { nextjsAdapter } from "../../../src/core/matchers/adapters/nextjs";

describe("nextjsAdapter", () => {
  it("detects Pages Router api routes", () => {
    const result = nextjsAdapter.detect({
      filePath: "/src/pages/api/login.ts",
      symbolName: "default",
    });

    expect(result).toEqual({
      type: "route",
      framework: "nextjs",
    });
  });

  it("detects App Router route handlers with HTTP verbs", () => {
    const result = nextjsAdapter.detect({
      filePath: "/src/app/api/users/route.ts",
      symbolName: "GET",
    });

    expect(result).toEqual({
      type: "route",
      framework: "nextjs",
      method: "GET",
    });
  });

  it("detects App Router POST handler", () => {
    const result = nextjsAdapter.detect({
      filePath: "/src/app/api/checkout/route.ts",
      symbolName: "POST",
    });

    expect(result).toEqual({
      type: "route",
      framework: "nextjs",
      method: "POST",
    });
  });

  it("returns null for non-route app components", () => {
    const result = nextjsAdapter.detect({
      filePath: "/src/app/page.tsx",
      symbolName: "HomePage",
    });

    expect(result).toBeNull();
  });
});
