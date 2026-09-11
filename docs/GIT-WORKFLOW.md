# Mewra Pounce — Git, Branch & Pull Request Workflow

## Purpose

This document defines the standard Git, branch, and Pull Request (PR) workflow for **Mewra Pounce**.

Mewra Pounce is an open-source VS Code extension with a local-first, zero-telemetry, and security-conscious design. While currently maintained in a focused team/solo maintainer setup, all development follows a strict open-source workflow so contributors and automated coding agents follow the exact same high standard.

The core development loop is:

```text
main
  ↓
feature / milestone branch
  ↓
focused, logical commits
  ↓
push
  ↓
Pull Request (PR)
  ↓
CI checks & review
  ↓
Squash and Merge
  ↓
main
```

---

# 1. Main Branch Policy

`main` is the primary stable branch.

Invariants for `main`:

- Always buildable: `pnpm build` must never fail on `main`.
- Always validated: `pnpm validate` passes 100% green (format check, TypeScript check, unit tests, build).
- Clean history: feature branches merge into `main` via **Squash and Merge**.
- No direct milestone development: do not implement full features or milestones directly on `main`.
- Protected: force pushes and deletions are prohibited on `main`.

---

# 2. Starting From `main`

Every feature, adapter, bug fix, or milestone branch **must** branch from the latest clean `main`:

```bash
git switch main
git pull origin main
git status
```

Verify that the working directory is clean before branching:

```bash
git switch -c feat/m1-call-hierarchy-trace
```

---

# 3. Branch Naming Conventions

Use lowercase branch names with hyphens and a descriptive category prefix:

| Prefix      | Purpose                                     | Example                               |
| ----------- | ------------------------------------------- | ------------------------------------- |
| `feat/`     | New user-facing or core feature             | `feat/trace-orchestrator-depth-limit` |
| `adapter/`  | New framework entry-point adapter           | `adapter/nestjs-controllers`          |
| `fix/`      | Bug fix                                     | `fix/resolve-alias-call-hierarchy`    |
| `refactor/` | Structural refactor without behavior change | `refactor/extract-match-entry-point`  |
| `test/`     | Adding or improving tests                   | `test/graph-cycle-detection`          |
| `docs/`     | Documentation changes                       | `docs/git-pr-workflow`                |
| `chore/`    | Tooling, dependencies, formatting           | `chore/upgrade-cytoscape`             |
| `ci/`       | CI/CD workflows and actions                 | `ci/github-actions-validate`          |
| `perf/`     | Performance optimizations                   | `perf/cache-symbol-lookups`           |

Avoid vague branch names like `dev`, `test`, `work`, or `patch`.

---

# 4. Milestone & Branch Discipline

- **1 PR = 1 coherent feature or milestone.**
- Avoid mixing unrelated concerns (e.g. do not mix a new framework adapter with a Webview styling overhaul and CI config changes in the same PR).
- Complete, validate, and merge the current milestone before starting the next one.
- Do not branch milestone N+1 off milestone N's unmerged branch unless there is an intentional dependency plan.

---

# 5. Commit Guidelines

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<optional scope>): <description in imperative present tense>
```

### Supported Types

- `feat:` new feature or capability
- `fix:` bug fix
- `refactor:` code restructuring without changing behavior
- `test:` adding or updating tests
- `docs:` documentation additions or edits
- `chore:` maintenance, dependency upgrades, tooling
- `perf:` performance improvement
- `ci:` CI workflow configuration
- `build:` packaging, esbuild, or asset build scripts
- `security:` security fix or hardening

### Scopes (Recommended)

- `core`: `src/core/` (orchestrator, graph walker, cache)
- `adapter`: `src/core/matchers/adapters/` (Express, Next.js, Fastify, etc.)
- `webview`: `src/webview/` (Preact UI, Cytoscape graph)
- `extension`: `src/extension/` (VS Code commands, panel registration)
- `shared`: `src/shared/` (messages, types, Zod schemas)
- `docs`: documentation files
- `ci`: CI workflows

### Commit Rules

- **One commit = one logical change.** Group related files (e.g., adapter implementation + its unit tests) into one commit.
- **No commit spam.** Do not commit every 2 minutes with messages like `wip`, `fix typo`, `test again`.
- **No comments rule.** Maintain code without explanatory comments except `// MARK:` section markers. Types and identifiers should be self-documenting.

---

# 6. Pre-Commit Hook

Mewra Pounce uses **Husky** + **lint-staged** + **Prettier**:

```text
git commit
   ↓
.husky/pre-commit
   ↓
lint-staged
   ↓
Prettier formats staged files
   ↓
commit created
```

The pre-commit hook only checks and formats staged files to keep the developer loop fast. The full quality gate runs via `pnpm validate`.

---

# 7. Quality Gate Before Opening a PR

Before opening or requesting review on any PR, run:

```bash
pnpm validate
```

This runs the complete validation pipeline:

```text
1. pnpm format:check  (Prettier syntax & formatting)
2. pnpm typecheck     (tsc --noEmit with strict TypeScript)
3. pnpm test          (Vitest unit test suite)
4. pnpm build         (esbuild bundling for extension and webview)
```

If any step fails, fix the issue before opening the PR.

---

# 8. Pull Request Rules & Expectations

Every Pull Request must meet these criteria:

### 1. Title & Description

- PR title follows Conventional Commits (e.g. `feat(adapter): add NestJS controller adapter`).
- PR description uses the standard template (see Section 10).
- Clearly explain **why** the change was made, not merely what files were touched.

### 2. Architecture Invariants

- `TraceOrchestrator` must never import framework adapters directly. Use `matchEntryPoint` as the single dispatch point.
- Each framework adapter must live in its own file under `src/core/matchers/adapters/`.
- No Node or VS Code APIs in `src/webview/`.
- `src/webview/` must not import from `src/extension/` or `src/core/`.
- `src/shared/` is the only bridge both extension and webview may import.
- No direct VS Code API calls in pure logic modules under `src/core/`.

### 3. Security Invariants

- Webview input is untrusted: all messages must be validated with Zod schemas defined in `src/shared/messages.ts`.
- Nonce-only script Content Security Policy (CSP); never use `unsafe-inline`.
- Never use `eval` or `new Function`.
- Never construct shell commands from workspace or user input.
- Keep `localResourceRoots` strictly restricted to `dist/`.
- Any PR touching CSP, Webview communication, or file reading must include negative security tests.

### 4. Tests

- Every new feature, adapter, or bug fix must have corresponding unit tests under `tests/unit/`.
- Happy paths AND edge cases (e.g. cyclic dependencies, missing symbols, unknown frameworks) must be covered.

### 5. Documentation Synchronization

- If behavior, architecture, adapter logic, UX, or release steps change, update the corresponding docs in the **same PR**:
  - `SPEC.md`
  - `docs/ARCHITECTURE.md`
  - `docs/UX.md`
  - `docs/TESTING.md`
  - `SECURITY.md`
  - `PRIVACY.md`
  - `README.md`

### 6. UI Changes

- For any UI or Webview graph changes, include screenshots or short recordings in the PR description.

---

# 9. Adding a Framework Adapter via PR

When contributing a framework adapter (e.g., Hono, Elysia, Fastify, NestJS, BullMQ):

1. **File placement**: Create `src/core/matchers/adapters/<framework>.ts`.
2. **Contract**: Export `export function match<Framework>(item: vscode.CallHierarchyItem): EntryPointMatch | null`.
3. **Dispatch**: Register it in `src/core/matchers/match-entry-point.ts`.
4. **Configuration**: Add the framework identifier to `package.json` under `mewraPounce.frameworks` enum.
5. **Tests**: Add unit tests in `tests/unit/adapters/<framework>.test.ts`.
6. **Documentation**: Update `SPEC.md` §5.2 and `docs/ARCHITECTURE.md` table of supported frameworks.

---

# 10. Pull Request Template

All PRs must include the following sections (configured in `.github/pull_request_template.md`):

```markdown
## Summary

<!-- Brief explanation of what this PR does and why it is needed. -->

## Changes

<!-- Bullet list of technical changes made. -->

## Architecture & Rules Check

- [ ] No direct adapter imports in `TraceOrchestrator` (dispatched via `matchEntryPoint`)
- [ ] Webview does not import from `src/extension/` or `src/core/`
- [ ] `src/shared/` used as the sole data boundary between extension and webview
- [ ] No code comments except `// MARK:` section markers
- [ ] No `eval` or `new Function`
- [ ] Webview messages validated at runtime with Zod

## Security & Privacy

<!-- Did this PR touch CSP, Webview messaging, localResourceRoots, or file reading? -->

- [ ] Local-first: zero remote network telemetry introduced
- [ ] CSP remains strict (nonce-only, no unsafe-inline)
- [ ] Untrusted inputs validated

## Testing Performed

- [ ] `pnpm validate` passes cleanly (format check, tsc, tests, build)
- [ ] Added/updated unit tests in `tests/`
- [ ] Manual testing in Extension Development Host (`F5`)

## Documentation Updated

- [ ] `SPEC.md` / `docs/ARCHITECTURE.md` / `docs/UX.md` / `docs/TESTING.md` / `README.md` (if applicable)

## Screenshots / Visuals (if UI changed)

<!-- Add before/after screenshots or screen recordings for Webview graph changes -->
```

---

# 11. Merge Strategy: Squash and Merge

All Pull Requests are merged using **Squash and Merge**.

Benefits:

- `main` history remains clean, linear, and readable with milestone-level commits.
- Feature branches can have detailed incremental commits during development without cluttering `main`.
- Rollbacks and `git bisect` become straightforward.

### Squash Commit Message Format

```text
feat(adapter): add NestJS controller and route matching (#42)
```

---

# 12. Post-Merge Cleanup

After a PR is merged:

```bash
git switch main
git pull origin main
git status
```

Delete the local feature branch:

```bash
git branch -d feat/my-feature
```

If the remote branch was not automatically deleted:

```bash
git push origin --delete feat/my-feature
```

Verify `main` is clean, up to date, and ready for the next task.

---

# 13. Summary Checklist

```text
[ ] Branch created from latest main (e.g. feat/name, adapter/name, fix/name)
[ ] Code follows strict TypeScript and // MARK: only comment rule
[ ] Architecture layers respected (core / extension / webview / shared)
[ ] Tests written and passing
[ ] Relevant documentation updated in the same PR
[ ] pnpm validate passes 100%
[ ] PR created using standard template
[ ] CI passes
[ ] Squash and Merge to main
[ ] Branch deleted and main pulled
```
