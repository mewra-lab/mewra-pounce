// MARK: Fastify Adapter Tests
import { describe, expect, it } from "vitest";

import { fastifyAdapter } from "../../../src/core/matchers/adapters/fastify";

describe("fastifyAdapter", () => {
  it("detects fastify.get", () => {
    const result = fastifyAdapter.detect({
      filePath: "/src/app.ts",
      symbolName: "fastify.get",
    });

    expect(result).toEqual({
      type: "route",
      framework: "fastify",
      method: "GET",
    });
  });

  it("detects fastify.post", () => {
    const result = fastifyAdapter.detect({
      filePath: "/src/app.ts",
      symbolName: "fastify.post",
    });

    expect(result).toEqual({
      type: "route",
      framework: "fastify",
      method: "POST",
    });
  });

  it("detects fastify.route without verb", () => {
    const result = fastifyAdapter.detect({
      filePath: "/src/app.ts",
      symbolName: "fastify.route",
    });

    expect(result).toEqual({
      type: "route",
      framework: "fastify",
    });
  });

  it("returns null for non-fastify functions", () => {
    const result = fastifyAdapter.detect({
      filePath: "/src/services/user.ts",
      symbolName: "findUser",
    });

    expect(result).toBeNull();
  });
});
