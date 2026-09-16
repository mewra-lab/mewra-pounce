# Mewra Pounce — Testing Strategy

## 1. Quality goals

Testing must protect:

- graph traversal correctness (DFS, cycle detection, depth limit);
- entry point pattern detection per framework;
- Mermaid export format correctness;
- Webview protocol safety (Zod message validation);
- node-count warning threshold;
- test-file filtering;
- VS Code extension lifecycle.

## 2. Test layers

### Unit tests (Vitest)

Pure modules testable without VS Code:

- `mermaid-exporter.ts` — output format, node colors, edge arrows;
- `match-entry-point.ts` — adapter dispatch, framework filtering;
- framework adapters — per-framework pattern matching;
- `messages.ts` — Zod schema validation for both directions.
- `core/preflight/` — diff-scoped route detection and the contributed Blast Radius check.

### Extension tests (@vscode/test-electron)

- activation and command registration;
- `PouncePanel` creation and disposal;
- `EntryPointCache` clear behavior;
- keybinding registration.

### Manual verification

Graph rendering and Cytoscape behavior cannot be fully automated.

Manual checklist:

- [ ] Place cursor on a function → `Alt+T` → panel opens
- [ ] Graph renders with correct colors (green entry, blue root, gray intermediate)
- [ ] Clicking a node opens the file at the correct line
- [ ] "Toggle test files" hides/shows test file nodes
- [ ] "Copy as Mermaid" copies valid Mermaid to clipboard
- [ ] `Alt+Shift+T` toggles test files from the editor
- [ ] Tracing a function with no callers shows an empty graph gracefully
- [ ] Tracing a function in a non-TS file shows an appropriate error
- [ ] With Mewra PreFlight installed, run its pipeline on a changed route and confirm the Pounce Blast Radius row appears

## 3. Running tests

```bash
pnpm test
```

## 4. Full quality gate

```bash
pnpm validate
```

Expected: format check → TypeScript check → unit tests → build.
