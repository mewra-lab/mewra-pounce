// MARK: NestJS Adapter Tests
import { describe, expect, it } from "vitest";

import { nestjsAdapter } from "../../../src/core/matchers/adapters/nestjs";

describe("nestjsAdapter", () => {
  it("detects controller files", () => {
    const result = nestjsAdapter.detect({
      filePath: "/src/users/users.controller.ts",
      symbolName: "findAll",
    });

    expect(result).toEqual({
      type: "route",
      framework: "nestjs",
    });
  });

  it("detects GraphQL resolver files", () => {
    const result = nestjsAdapter.detect({
      filePath: "/src/posts/posts.resolver.ts",
      symbolName: "getPosts",
    });

    expect(result).toEqual({
      type: "route",
      framework: "nestjs",
    });
  });

  it("detects WebSocket gateway files", () => {
    const result = nestjsAdapter.detect({
      filePath: "/src/events/events.gateway.ts",
      symbolName: "handleMessage",
    });

    expect(result).toEqual({
      type: "route",
      framework: "nestjs",
    });
  });

  it("returns null for standard service files", () => {
    const result = nestjsAdapter.detect({
      filePath: "/src/users/users.service.ts",
      symbolName: "createUser",
    });

    expect(result).toBeNull();
  });
});
