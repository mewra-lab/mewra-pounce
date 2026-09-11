import * as vscode from "vscode";

import type { EntryPointMatch } from "../../shared/types";

type MatchFn = (item: vscode.CallHierarchyItem) => EntryPointMatch | null;

const expressAdapter: MatchFn = (item) => {
  const filePath = item.uri.fsPath;
  const name = item.name;

  const routeMethodPattern = /^(app|router)\.(get|post|put|patch|delete|use)$/;
  if (routeMethodPattern.test(name)) {
    return { type: "route", framework: "express" };
  }

  if (filePath.includes("/routes/") || filePath.includes(".routes.")) {
    return { type: "route", framework: "express" };
  }

  return null;
};

const fastifyAdapter: MatchFn = (item) => {
  const name = item.name;

  const fastifyPattern =
    /^fastify\.(get|post|put|patch|delete|route|register)$/;
  if (fastifyPattern.test(name)) {
    return { type: "route", framework: "fastify" };
  }

  return null;
};

const nestjsAdapter: MatchFn = (item) => {
  const filePath = item.uri.fsPath;

  if (
    filePath.includes(".controller.") ||
    filePath.includes(".resolver.") ||
    filePath.includes(".gateway.")
  ) {
    return { type: "route", framework: "nestjs" };
  }

  return null;
};

const nextjsAdapter: MatchFn = (item) => {
  const filePath = item.uri.fsPath;
  const name = item.name;

  if (
    filePath.match(/\/pages\/api\//) ||
    filePath.match(/\/app\/.*\/route\.ts$/)
  ) {
    if (
      name === "default" ||
      /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(name)
    ) {
      return { type: "route", framework: "nextjs" };
    }
  }

  return null;
};

const ADAPTERS: MatchFn[] = [
  expressAdapter,
  fastifyAdapter,
  nestjsAdapter,
  nextjsAdapter,
];

export function matchEntryPoint(
  item: vscode.CallHierarchyItem,
): EntryPointMatch | null {
  const config = vscode.workspace.getConfiguration("mewraPounce");
  const enabledFrameworks: string[] = config.get("frameworks") ?? [
    "express",
    "fastify",
    "nestjs",
    "nextjs",
  ];

  for (const adapter of ADAPTERS) {
    const result = adapter(item);
    if (result && enabledFrameworks.includes(result.framework)) {
      return result;
    }
  }

  return null;
}
