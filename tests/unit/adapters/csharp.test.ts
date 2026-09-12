// MARK: CSharp Adapter Tests
import { describe, expect, it } from "vitest";

import { csharpAdapter } from "../../../src/core/matchers/adapters/csharp";

describe("csharpAdapter", () => {
  it("detects ASP.NET HttpGet attribute", () => {
    const result = csharpAdapter.detect({
      filePath: "/src/Controllers/UserController.cs",
      symbolName: '[HttpGet("api/users")]',
    });

    expect(result).toEqual({
      type: "route",
      framework: "csharp",
      method: "GET",
    });
  });

  it("detects ASP.NET HttpPost attribute", () => {
    const result = csharpAdapter.detect({
      filePath: "/src/Controllers/OrderController.cs",
      symbolName: '[HttpPost("api/orders")]',
    });

    expect(result).toEqual({
      type: "route",
      framework: "csharp",
      method: "POST",
    });
  });

  it("detects Minimal API MapGet method", () => {
    const result = csharpAdapter.detect({
      filePath: "/src/Endpoints/UserEndpoints.cs",
      symbolName: "app.MapGet",
    });

    expect(result).toEqual({
      type: "route",
      framework: "csharp",
      method: "GET",
    });
  });

  it("detects Azure Function TimerTrigger as cron", () => {
    const result = csharpAdapter.detect({
      filePath: "/src/Functions/CleanupFunction.cs",
      symbolName: '[TimerTrigger("0 */5 * * * *")]',
    });

    expect(result).toEqual({
      type: "cron",
      framework: "csharp",
    });
  });

  it("detects QueueTrigger as worker", () => {
    const result = csharpAdapter.detect({
      filePath: "/src/Functions/QueueProcessor.cs",
      symbolName: '[QueueTrigger("incoming-orders")]',
    });

    expect(result).toEqual({
      type: "worker",
      framework: "csharp",
    });
  });

  it("detects Program.cs entry file", () => {
    const result = csharpAdapter.detect({
      filePath: "/src/Program.cs",
      symbolName: "RunApplication",
    });

    expect(result).toEqual({
      type: "route",
      framework: "csharp",
    });
  });

  it("returns null for internal C# service method", () => {
    const result = csharpAdapter.detect({
      filePath: "/src/Services/UserService.cs",
      symbolName: "FindByIdAsync",
    });

    expect(result).toBeNull();
  });

  it("returns null for non-C# files", () => {
    const result = csharpAdapter.detect({
      filePath: "/src/Controllers/UserController.ts",
      symbolName: '[HttpGet("api/users")]',
    });

    expect(result).toBeNull();
  });
});
