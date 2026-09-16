# Mewra Pounce — Release and Distribution

## 1. Release targets

- Visual Studio Code Marketplace
- Open VSX Registry
- GitHub Releases as a `.vsix` artifact (with SHA-256 checksum)

## 2. Versioning

Semantic Versioning:

```text
0.1.0  — initial release: reverse call trace engine, Cytoscape.js graph, polyglot framework detection, Mermaid export
0.1.1  — documentation alignment, responsive landing page, marketplace overview sync
0.2.0  — live file-watcher cache invalidation, keyboard graph navigation, entry-point category filters
0.3.0  — Mewra PreFlight companion integration for diff-scoped blast-radius route summaries
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

## 6. Automated GitHub Release

`.github/workflows/release.yml` runs on a `vMAJOR.MINOR.PATCH` tag or manually
with `workflow_dispatch`. It verifies that the tag matches `package.json`, runs
the full quality gate, packages the VSIX, and publishes the VSIX plus
`SHA256SUMS.txt` to the GitHub Release.

Create a release only after its pull request is merged into `main`:

```bash
git checkout main
git pull --ff-only origin main
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
```

The `v0.3.0` tag was originally pushed before this workflow existed. After this
workflow is merged, that tag is recreated at the workflow commit so the first
automated release can be built from its tagged source.
