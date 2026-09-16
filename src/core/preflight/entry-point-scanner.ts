import type { GitDiff, RouteChip } from "../../shared/preflight-api";

type RoutePattern = {
  regex: RegExp;
  method: (match: RegExpExecArray) => string;
  route: (match: RegExpExecArray, filePath?: string) => string;
};

function inferNextRoute(filePath?: string): string {
  if (!filePath) return "(Next.js route handler)";
  const route =
    /(?:apps\/[^/]+\/)?(?:src\/)?app\/(.+)\/route\.[a-zA-Z0-9]+$/.exec(
      filePath,
    );
  if (route?.[1]) return `/${route[1]}`;
  const page =
    /(?:apps\/[^/]+\/)?(?:src\/)?app\/(.+)\/page\.[a-zA-Z0-9]+$/.exec(filePath);
  if (page?.[1]) return `/${page[1]}`;
  if (/(?:apps\/[^/]+\/)?(?:src\/)?app\/page\.[a-zA-Z0-9]+$/.test(filePath)) {
    return "/";
  }
  return "(Next.js route handler)";
}

const patterns: RoutePattern[] = [
  {
    regex:
      /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s*\(/,
    method: (match) => match[1]!,
    route: (_match, filePath) => inferNextRoute(filePath),
  },
  {
    regex:
      /export\s+default\s+(?:async\s+)?function\s+(?:Page|Layout|page|layout)\s*\(/,
    method: () => "GET",
    route: (_match, filePath) => inferNextRoute(filePath),
  },
  {
    regex:
      /(?:app|api|hono|router|route)?\s*\.\s*(get|post|put|patch|delete|all|options|head)\s*\(\s*['\"`]([^'\"`]+)['\"`]/i,
    method: (match) => (match[1] ?? "ANY").toUpperCase(),
    route: (match) => match[2] ?? "/",
  },
  {
    regex:
      /(?:app|api|hono|router|route)?\s*\.\s*on\s*\(\s*(?:\[[^\]]+\]|['\"`]([A-Za-z]+)['\"`])\s*,\s*['\"`]([^'\"`]+)['\"`]/i,
    method: (match) => (match[1] ?? "ANY").toUpperCase(),
    route: (match) => match[2] ?? "/",
  },
  {
    regex:
      /@(Get|Post|Put|Patch|Delete|All|Options|Head)\s*\(\s*['\"`]?([^'\"`]*)['\"`]?\s*\)/i,
    method: (match) => match[1]!.toUpperCase(),
    route: (match) => {
      const path = match[2]?.trim() ?? "";
      return path ? (path.startsWith("/") ? path : `/${path}`) : "/";
    },
  },
  {
    regex: /http\.Handle(?:Func)?\s*\(\s*['\"`]([^'\"`]+)['\"`]/,
    method: () => "ANY",
    route: (match) => match[1] ?? "/",
  },
  {
    regex: /mux\.Handle(?:Func)?\s*\(\s*['\"`]([^'\"`]+)['\"`]/,
    method: () => "ANY",
    route: (match) => match[1] ?? "/",
  },
  {
    regex: /func\s+\(\s*\w+\s+\*\w+\)\s+\w+\(.*\*gin\.Context\)/,
    method: () => "ANY",
    route: () => "(Gin handler)",
  },
  {
    regex:
      /@(app|router|blueprint)\.(get|post|put|patch|delete|options|head)\s*\(\s*['\"`]([^'\"`]+)['\"`]/i,
    method: (match) => (match[2] ?? "ANY").toUpperCase(),
    route: (match) => match[3] ?? "/",
  },
  {
    regex:
      /Route::(get|post|put|patch|delete|options|any|match)\s*\(\s*['\"`]([^'\"`]+)['\"`]/i,
    method: (match) => (match[1] ?? "ANY").toUpperCase(),
    route: (match) => match[2] ?? "/",
  },
  {
    regex:
      /#\[(get|post|put|patch|delete)\s*\(\s*['\"`]([^'\"`]+)['\"`]\s*\)\]/i,
    method: (match) => (match[1] ?? "ANY").toUpperCase(),
    route: (match) => match[2] ?? "/",
  },
];

export function scanEntryPoints(diff: GitDiff): RouteChip[] {
  const chips: RouteChip[] = [];
  const validFiles = new Set(
    diff.changedFiles
      .filter((file) => file.status !== "deleted")
      .map((file) => file.path),
  );
  let inHunk = false;
  let currentFile = "";
  let lineNumber = 0;

  for (const line of diff.rawPatch.split("\n")) {
    if (line.startsWith("diff --git")) {
      currentFile = /b\/(.+)$/.exec(line)?.[1] ?? "";
      inHunk = false;
      continue;
    }
    if (!validFiles.has(currentFile)) continue;
    if (line.startsWith("@@")) {
      lineNumber = (parseInt(/\+(\d+)/.exec(line)?.[1] ?? "1", 10) || 1) - 1;
      inHunk = true;
      continue;
    }
    if (!inHunk) continue;
    if (line.startsWith("-")) continue;
    if (!line.startsWith("+") && !line.startsWith(" ")) {
      inHunk = false;
      continue;
    }
    lineNumber++;
    if (!line.startsWith("+")) continue;
    const content = line.slice(1);
    for (const pattern of patterns) {
      const match = pattern.regex.exec(content);
      if (!match) continue;
      chips.push({
        method: pattern.method(match),
        route: pattern.route(match, currentFile),
        file: currentFile,
        line: lineNumber,
      });
      break;
    }
  }

  for (const file of validFiles) {
    if (chips.some((chip) => chip.file === file)) continue;
    const route =
      /(?:apps\/[^/]+\/)?(?:src\/)?app\/(.+)\/route\.[a-zA-Z0-9]+$/.exec(file);
    const page =
      /(?:apps\/[^/]+\/)?(?:src\/)?app\/(.+)\/page\.[a-zA-Z0-9]+$/.exec(file);
    if (route?.[1]) chips.push({ method: "ANY", route: `/${route[1]}`, file });
    else if (page?.[1])
      chips.push({ method: "GET", route: `/${page[1]}`, file });
    else if (/(?:apps\/[^/]+\/)?(?:src\/)?app\/page\.[a-zA-Z0-9]+$/.test(file))
      chips.push({ method: "GET", route: "/", file });
  }

  return chips;
}

export function buildMermaidDiagram(
  chips: RouteChip[],
  modifiedFiles: string[],
): string {
  if (chips.length === 0 && modifiedFiles.length === 0)
    return "graph TD\n  A[No entry points detected in diff]";
  const lines = ["graph TD"];
  const nodes = new Map<string, string>();
  for (const [index, file] of modifiedFiles.slice(0, 10).entries()) {
    const id = `F_${index}`;
    nodes.set(file, id);
    lines.push(`  ${id}[\"${file.split("/").slice(-2).join("/")}\"]`);
  }
  const seen = new Set<string>();
  for (const [index, chip] of chips.entries()) {
    const key = `${chip.method} ${chip.route}:${chip.file}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const id = `EP_${index}`;
    lines.push(`  ${id}[\"${chip.method} ${chip.route}\"]`);
    const target = nodes.get(chip.file) ?? nodes.values().next().value;
    if (target) lines.push(`  ${id} --> ${target}`);
  }
  return lines.join("\n");
}
