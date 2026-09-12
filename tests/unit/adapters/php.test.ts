// MARK: PHP Adapter Tests
import { describe, expect, it } from "vitest";

import { phpAdapter } from "../../../src/core/matchers/adapters/php";

describe("phpAdapter", () => {
  it("detects Laravel Route::get method", () => {
    const result = phpAdapter.detect({
      filePath: "/routes/api.php",
      symbolName: "Route::get",
    });

    expect(result).toEqual({
      type: "route",
      framework: "php",
      method: "GET",
    });
  });

  it("detects Laravel Route::post method", () => {
    const result = phpAdapter.detect({
      filePath: "/routes/web.php",
      symbolName: "Route::post",
    });

    expect(result).toEqual({
      type: "route",
      framework: "php",
      method: "POST",
    });
  });

  it("detects Laravel apiResource method", () => {
    const result = phpAdapter.detect({
      filePath: "/routes/api.php",
      symbolName: "Route::apiResource",
    });

    expect(result).toEqual({
      type: "route",
      framework: "php",
    });
  });

  it("detects Symfony Route attribute", () => {
    const result = phpAdapter.detect({
      filePath: "/src/Controller/ProductController.php",
      symbolName: '#[Route("/products")]',
    });

    expect(result).toEqual({
      type: "route",
      framework: "php",
    });
  });

  it("detects ShouldQueue as worker", () => {
    const result = phpAdapter.detect({
      filePath: "/app/Jobs/ProcessPodcast.php",
      symbolName: "ProcessPodcast implements ShouldQueue",
    });

    expect(result).toEqual({
      type: "worker",
      framework: "php",
    });
  });

  it("detects index.php entry file", () => {
    const result = phpAdapter.detect({
      filePath: "/public/index.php",
      symbolName: "bootstrapApp",
    });

    expect(result).toEqual({
      type: "route",
      framework: "php",
    });
  });

  it("returns null for standard PHP repository method", () => {
    const result = phpAdapter.detect({
      filePath: "/app/Repositories/UserRepository.php",
      symbolName: "findActiveUsers",
    });

    expect(result).toBeNull();
  });

  it("returns null for non-PHP files", () => {
    const result = phpAdapter.detect({
      filePath: "/routes/api.js",
      symbolName: "Route::get",
    });

    expect(result).toBeNull();
  });
});
