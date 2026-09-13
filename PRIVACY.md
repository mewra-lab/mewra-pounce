# Mewra Pounce — Privacy

Mewra Pounce is a local-first VS Code extension. It reads your source code structure via the VS Code Language Server Protocol, renders a graph inside a Webview, and operates entirely on your machine.

---

## Default privacy promise

Mewra Pounce:

- does **not** require an account;
- does **not** send telemetry, analytics, or usage data to Mewra or any third party;
- does **not** upload your source code, file paths, or function names to any server;
- does **not** make network requests of any kind (0.1.0 is 100% offline);
- does **not** read `.env` files, credentials, or secrets;
- stores **no** user data beyond the optional workspace cache described below.

---

## Optional workspace cache

When `mewraPounce.cacheEntryPoints` is `true` (default), detected entry points may be stored in:

```
.vscode/.mewra-pounce-cache.json
```

This file:

- stays on your local machine only;
- contains file paths and symbol names from your workspace;
- is already listed in `.gitignore` — it is not committed to version control;
- can be deleted at any time with the `Mewra Pounce: Clear Entry Point Cache` command.

> **0.1.0 note:** the file-based cache is not yet written or read. The cache is currently in-memory only and cleared when VS Code is restarted.

---

## Graph data

When you invoke `Mewra Pounce: Trace Callers`, the extension queries the VS Code LSP Call Hierarchy API and traverses your workspace's TypeScript/JavaScript symbol graph. This data:

- stays entirely within your local VS Code instance;
- is sent only to the local Webview panel for rendering;
- is discarded when the panel is closed.

---

## Mermaid export

When you click "Copy as Mermaid", a text representation of the current graph (file paths and function names from your workspace) is written to your clipboard. This data does not leave your machine automatically — you choose where to paste it.

---

## What is never collected

- Source code bodies;
- keystrokes or cursor positions;
- workspace folder names (beyond what VS Code itself exposes);
- personal information;
- IP addresses;
- browser cookies.

---

## Third-party dependencies

Mewra Pounce bundles several open-source libraries (see `package.json`). None of these libraries are configured to make network requests by this extension. Cytoscape.js and Preact are fully offline graph/UI libraries.

---

## Changes to this policy

If a future version introduces network functionality, it will be documented here and in the changelog before release, and will require explicit user consent.
