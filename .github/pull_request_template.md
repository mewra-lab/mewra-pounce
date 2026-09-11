## Summary

<!-- Provide a concise description of the purpose of this PR and what problem it solves. -->

## Changes

<!-- List the key changes introduced in this PR. -->

-

## Type of Change

- [ ] `feat`: New feature or capability
- [ ] `adapter`: New framework adapter
- [ ] `fix`: Bug fix
- [ ] `refactor`: Structural refactoring with no behavior change
- [ ] `test`: New or improved tests
- [ ] `docs`: Documentation updates
- [ ] `chore`: Maintenance, dependencies, or tooling
- [ ] `security`: Security-related fix or hardening

## Architecture & Code Standards

- [ ] **Single dispatch**: `TraceOrchestrator` uses `matchEntryPoint` (no direct adapter imports)
- [ ] **Layer isolation**: `src/webview/` does not import from `src/extension/` or `src/core/`
- [ ] **Shared bridge**: Only `src/shared/` is shared across boundaries
- [ ] **Zod validation**: All Webview message payloads validated via Zod schemas
- [ ] **No-comment rule**: No code comments except `// MARK:` section markers
- [ ] **No eval**: Never uses `eval`, `new Function`, or unvalidated shell execution

## Security & Privacy

- [ ] Local-first: 100% on-device, zero remote network calls or telemetry
- [ ] CSP compliant: Strict nonce-only script CSP (no `unsafe-inline`)
- [ ] Restricted access: `localResourceRoots` strictly confined to `dist/`

## Testing & Verification

- [ ] `pnpm validate` passes cleanly (`format:check` + `typecheck` + `test` + `build`)
- [ ] Unit tests added/updated under `tests/unit/`
- [ ] Edge cases (cycles, missing symbols, unknown frameworks) covered
- [ ] Tested manually via Extension Development Host (`F5`)

## Documentation Synchronization

- [ ] Documentation updated in the same PR if behavior/architecture changed:
  - `SPEC.md`
  - `docs/ARCHITECTURE.md`
  - `docs/UX.md`
  - `docs/TESTING.md`
  - `SECURITY.md`
  - `README.md`

## Screenshots / Screen Recordings (if UI affected)

<!-- Attach before/after screenshots or screen recording of the Webview graph -->
