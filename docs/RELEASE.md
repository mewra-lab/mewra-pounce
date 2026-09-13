# Mewra Pounce — Release and Distribution

## 1. Release targets

- Visual Studio Code Marketplace
- Open VSX Registry
- GitHub Releases as a `.vsix` artifact (with SHA-256 checksum)

## 2. Versioning

Semantic Versioning:

```text
0.1.0  — initial release: reverse call trace engine, Cytoscape.js graph, polyglot framework detection, Mermaid export
0.2.0  — live file-watcher cache invalidation, keyboard graph navigation, entry-point category filters
0.3.0  — deep AST pattern matching, export graph as SVG/PNG, Mewra PreFlight integration
1.0.0  — cross-package monorepo tracing, first stable release
```

## 3. Pre-release checks

```bash
pnpm install --frozen-lockfile
pnpm validate
```

Security checks:

- Webview CSP reviewed (nonce-only scripts, no `unsafe-inline`);
- message validation tests pass;
- dependency audit reviewed;
- secret scan clean;
- VSIX contents inspected (no `.env`, no source secrets, no test fixtures with private paths).

## 4. Package inspection

The VSIX must include:

- `dist/extension.cjs`
- `dist/webview/index.js`
- `dist/webview/assets/mewra-logo.svg`
- `package.json`, `README.md`, `LICENSE`

The VSIX must **not** include:

- `.agents/`, `tests/`, `coverage/`, `node_modules/`;
- `.env` files or credentials;
- development-only screenshots with sensitive data.

## 5. Quality commands (current)

```bash
pnpm install --frozen-lockfile
pnpm validate
```
