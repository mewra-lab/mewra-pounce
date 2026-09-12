// MARK: Java Adapter Tests
import { describe, expect, it } from "vitest";

import { javaAdapter } from "../../../src/core/matchers/adapters/java";

describe("javaAdapter", () => {
  it("detects Spring GetMapping annotation", () => {
    const result = javaAdapter.detect({
      filePath: "/src/UserController.java",
      symbolName: '@GetMapping("/users")',
    });

    expect(result).toEqual({
      type: "route",
      framework: "java",
      method: "GET",
    });
  });

  it("detects Spring PostMapping annotation in Kotlin", () => {
    const result = javaAdapter.detect({
      filePath: "/src/OrderController.kt",
      symbolName: '@PostMapping("/orders")',
    });

    expect(result).toEqual({
      type: "route",
      framework: "java",
      method: "POST",
    });
  });

  it("detects Spring Scheduled annotation as cron", () => {
    const result = javaAdapter.detect({
      filePath: "/src/DailyJob.java",
      symbolName: '@Scheduled(cron = "0 0 * * *")',
    });

    expect(result).toEqual({
      type: "cron",
      framework: "java",
    });
  });

  it("detects KafkaListener annotation as worker", () => {
    const result = javaAdapter.detect({
      filePath: "/src/PaymentConsumer.java",
      symbolName: '@KafkaListener(topics = "payments")',
    });

    expect(result).toEqual({
      type: "worker",
      framework: "java",
    });
  });

  it("detects main method entry point", () => {
    const result = javaAdapter.detect({
      filePath: "/src/Application.java",
      symbolName: "main(String[] args)",
    });

    expect(result).toEqual({
      type: "route",
      framework: "java",
    });
  });

  it("returns null for regular internal Java method", () => {
    const result = javaAdapter.detect({
      filePath: "/src/OrderService.java",
      symbolName: "calculateTotal",
    });

    expect(result).toBeNull();
  });

  it("returns null for non-Java files", () => {
    const result = javaAdapter.detect({
      filePath: "/src/OrderService.ts",
      symbolName: '@GetMapping("/users")',
    });

    expect(result).toBeNull();
  });
});
