# AGENTS.md — Mewra Pounce

This file defines project-level rules for coding agents.

## Required reading

Before non-trivial changes, read:

1. `SPEC.md`
2. `docs/ARCHITECTURE.md`
3. `docs/TESTING.md`
4. `docs/UX.md`
5. `docs/GIT-WORKFLOW.md`

For packaging/release changes, also read `docs/RELEASE.md`.

## Product scope

Mewra Pounce is an open-source VS Code extension that traces the reverse call hierarchy of any function and renders an interactive directed graph, showing every entry point (API routes, workers, cron jobs) that can reach it.

Do **not** implement Go/Python adapters, AI integration, cross-repo tracing, or cloud features — these are v2/v3 roadmap items.

## Current stack

```text
TypeScript
VS Code Extension API (Call Hierarchy LSP)
Preact
Cytoscape.js (webview graph)
ts-morph (AST fallback for pattern matching)
Zod
esbuild
pnpm 12.3.4
Vitest
Prettier
Husky + lint-staged
```

## Architecture rules

- `TraceOrchestrator` must not import framework-specific adapter logic directly — use `matchEntryPoint` as the single dispatch point.
- Each framework adapter lives in its own file under `src/core/matchers/adapters/`.
- Keep Node/VS Code APIs out of `src/webview/` modules.
- Webview modules must not import from `src/extension/` or `src/core/`.
- `src/shared/` is the only layer both sides may import.
- Persistence (entry-point cache) must be behind the `EntryPointCache` interface.
- Do not call VS Code APIs directly from `src/core/` pure logic modules.

## Security invariants

Never introduce:

- `eval` or `new Function`;
- broad CSP wildcards or `unsafe-inline` scripts;
- arbitrary `executeCommand` driven by Webview input;
- unvalidated Webview messages (use Zod schemas in `src/shared/messages.ts`);
- shell commands built from user/workspace input;
- unsafe `innerHTML` for untrusted content.

If a requested feature appears to require one of these, stop and propose a safer design.

## Webview rules

Treat Webview input as untrusted.

- Validate both message directions at runtime with Zod.
- Keep `localResourceRoots` restricted to `dist/`.
- Nonce-only script CSP (no `unsafe-inline` scripts).
- Prefer VS Code theme variables for all colors.

Brand source:

```text
assets/brand/mewra-logo.svg
```

Runtime Webview assets are copied to `dist/webview/assets/` during build.

## No-comment rule

Do **not** add code comments unless they are `// MARK:` section markers.
Let types and naming be self-documenting.

## Quality gate

Before a task is complete:

```bash
pnpm validate
```

Expected pipeline: format check → TypeScript check → tests → build.

## Documentation discipline

Update the relevant Markdown file in `docs/` in the same change when modifying:

- requirements;
- architecture;
- security boundaries;
- framework adapter behavior;
- UX behavior;
- release behavior.

Do not silently diverge from documented architecture.
