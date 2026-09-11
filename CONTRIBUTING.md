# Contributing to Mewra Pounce

Thank you for contributing. Mewra Pounce is a local-first, security-conscious VS Code extension. Contributions are welcome, but changes to Webview code and framework adapters receive additional review.

---

## 1. Before contributing

Read these first:

- [`SPEC.md`](./SPEC.md) — product specification
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — module structure and trust boundaries
- [`docs/TESTING.md`](./docs/TESTING.md) — testing strategy
- [`docs/UX.md`](./docs/UX.md) — UX specification
- [`docs/GIT-WORKFLOW.md`](./docs/GIT-WORKFLOW.md) — Git branching, Conventional Commits, and PR workflow
- [`SECURITY.md`](./SECURITY.md) — security requirements

---

## 2. Local setup

```bash
git clone https://github.com/mewra/pounce
cd mewra-pounce
pnpm install
pnpm build
```

Press `F5` in VS Code to launch the Extension Development Host for manual testing.

Full quality gate:

```bash
pnpm validate
```

Expected pipeline: format check → TypeScript check → unit tests → build.

---

## 3. Pull request workflow & rules

See the comprehensive [Git, Branch & PR Workflow](./docs/GIT-WORKFLOW.md). Key expectations:

- **Branching**: Branch from latest `main` using descriptive prefix (`feat/`, `adapter/`, `fix/`, `test/`, `docs/`, `chore/`).
- **Scope**: 1 PR = 1 coherent feature or milestone. Never mix unrelated refactors or features.
- **Commit style**: Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat(scope): ...`, `fix(scope): ...`).
- **Quality gate**: `pnpm validate` must pass 100% green before opening PR and before merging.
- **Code comments**: Follow the `AGENTS.md` no-comment rule — only `// MARK:` section markers are permitted.
- **Template**: Fill out all sections in the [PR template](.github/pull_request_template.md).
- **Architecture compliance**: No direct adapter imports in `TraceOrchestrator`, no extension/core imports in `src/webview/`, single dispatch via `matchEntryPoint`.
- **Security & Privacy**: No network requests or telemetry. CSP strictly nonce-only. Untrusted Webview messages validated with Zod.
- **Tests**: Include unit tests under `tests/unit/` for all behavior changes.
- **Documentation**: Update relevant `docs/` or `SPEC.md` in the exact same PR when behavior/architecture changes.
- **Merge strategy**: All PRs merge via **Squash and Merge** into `main`.

---

## 4. Architecture rules

- `TraceOrchestrator` uses `matchEntryPoint` as the sole dispatch point — never import adapters directly into it.
- Each framework adapter lives in its own file under `src/core/matchers/adapters/`.
- `src/webview/` must not import from `src/extension/` or `src/core/`.
- `src/shared/` is the only layer both sides may import.
- `EntryPointCache` is always accessed through its interface — never as a raw in-memory object from call sites.
- Do not call VS Code APIs directly from `src/core/` pure logic modules.

---

## 5. Coding rules

- Strict TypeScript — no `any` unless narrowly justified.
- No code comments unless they are `// MARK:` section markers. Let types and names be self-documenting.
- Prefer small modules with explicit dependencies.
- Validate all Webview messages at runtime with Zod (`src/shared/messages.ts`).
- Never use `eval` or `new Function`.
- Never build shell commands from user or workspace input.

---

## 6. Security-sensitive changes

These require explicit reviewer attention:

- Webview CSP (any relaxation is a blocker);
- `localResourceRoots` expansion;
- new `executeCommand` calls driven by Webview input;
- Zod schema changes in `src/shared/messages.ts`;
- new framework adapters that process workspace file content;
- new VS Code API calls in core or webview layers.

Security-sensitive changes must add negative tests alongside happy-path tests.

---

## 7. Adding a framework adapter

1. Create `src/core/matchers/adapters/<framework>.ts` exporting a function `(item: vscode.CallHierarchyItem) => EntryPointMatch | null`.
2. Register it in `src/core/matchers/match-entry-point.ts`.
3. Add it to the `mewraPounce.frameworks` enum in `package.json` `contributes.configuration`.
4. Add unit tests in `tests/unit/adapters/<framework>.test.ts`.
5. Update `SPEC.md` and `docs/ARCHITECTURE.md` if the adapter pattern itself changes.

---

## 8. Dependency policy

Before adding a production dependency, explain:

- why existing VS Code APIs or TypeScript built-ins are insufficient;
- maintenance status and license;
- whether it runs install scripts or native code;
- bundle-size impact;
- security history.

Avoid dependencies for simple utility functions.

---

## 9. Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add NestJS resolver adapter
fix: skip dynamic imports in call hierarchy
refactor: extract adapter dispatch into match-entry-point
security: restrict localResourceRoots to dist/
chore: upgrade cytoscape to 3.x
docs: add manual test checklist to TESTING.md
```

---

## 10. Tests

Run before opening a PR:

```bash
pnpm validate
```

Unit tests live in `tests/unit/`. Extension host tests live in `tests/extension/`.

---

## 11. Documentation is part of the feature

Update the relevant file when changing:

| Change type                      | Update                                    |
| -------------------------------- | ----------------------------------------- |
| Feature behavior                 | `SPEC.md`, `docs/UX.md`                   |
| Architecture / module boundaries | `docs/ARCHITECTURE.md`                    |
| Framework adapter behavior       | `SPEC.md` §5.2, `docs/ARCHITECTURE.md` §7 |
| Security boundary                | `SECURITY.md`                             |
| Release process                  | `docs/RELEASE.md`                         |

---

## 12. Reporting vulnerabilities

Do not publish exploitable vulnerabilities in a public issue. Use GitHub's private vulnerability reporting channel. See [SECURITY.md](./SECURITY.md).

---

## Package manager and hook policy

This repository pins `pnpm@12.3.4`. Always commit `pnpm-lock.yaml`.

Husky pre-commit runs lint-staged (Prettier on staged files only). The full quality gate belongs in `pnpm validate` and CI, not the pre-commit hook.
