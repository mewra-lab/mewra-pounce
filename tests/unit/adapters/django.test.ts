// MARK: Django Adapter Tests
import { describe, expect, it } from "vitest";

import { djangoAdapter } from "../../../src/core/matchers/adapters/django";

describe("djangoAdapter", () => {
  it("detects urls.py files", () => {
    const result = djangoAdapter.detect({
      filePath: "/src/myproject/urls.py",
      symbolName: "urlpatterns",
    });

    expect(result).toEqual({
      type: "route",
      framework: "django",
    });
  });

  it("detects ViewSet in views.py", () => {
    const result = djangoAdapter.detect({
      filePath: "/src/blog/views.py",
      symbolName: "PostViewSet",
    });

    expect(result).toEqual({
      type: "route",
      framework: "django",
    });
  });

  it("detects APIView in views directory", () => {
    const result = djangoAdapter.detect({
      filePath: "/src/api/views/users.py",
      symbolName: "UserAPIView",
    });

    expect(result).toEqual({
      type: "route",
      framework: "django",
    });
  });

  it("returns null for models.py", () => {
    const result = djangoAdapter.detect({
      filePath: "/src/blog/models.py",
      symbolName: "Post",
    });

    expect(result).toBeNull();
  });
});
