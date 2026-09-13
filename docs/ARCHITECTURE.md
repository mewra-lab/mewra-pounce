# Mewra Pounce — Architecture

## 1. Architectural goals

Mewra Pounce must remain:

- deterministic and local-first (no AI, no network calls in 0.1.0);
- framework-neutral at the core (adapters registered per framework, not spread through logic);
- safe when handling untrusted Webview messages;
- fast enough to traverse 1,000+ node graphs in 2–3 seconds;
- testable without a live VS Code host for pure logic modules.

## 2. High-level architecture

```text
VS Code Workbench
│
├── Commands / Keybindings
│
├── Extension Host (TypeScript)
│   ├── extension.ts               — activation, command registration
│   ├── PouncePanel                — WebviewPanel lifecycle + message bridge
│   │
│   ├── Core
│   │   ├── TraceOrchestrator      — DFS traversal, cycle detection, depth limit
│   │   ├── Entry Point Matchers
│   │   │   ├── matchEntryPoint    — dispatcher
│   │   │   └── adapters/          — one file per framework
│   │   └── MermaidExporter        — pure string conversion
│   │
│   └── EntryPointCache            — in-memory + .vscode file cache
│
└── Webview UI (Preact + TypeScript)
    ├── App                        — state machine, header, controls
    ├── GraphView                  — Cytoscape.js renderer
    └── styles.css                 — VS Code theme variable tokens
```

## 3. Repository structure

```text
mewra-pounce/
├── assets/
│   └── brand/
│       ├── mewra-logo.svg
│       └── mewra-dark.svg
├── docs/
│   ├── ARCHITECTURE.md
│   ├── TESTING.md
│   ├── UX.md
│   ├── RELEASE.md
│   └── decisions/
├── scripts/
│   ├── clean.mjs
│   └── copy-assets.mjs
├── src/
│   ├── extension/
│   │   ├── extension.ts
│   │   ├── pounce-panel.ts
│   │   └── security/
│   ├── core/
│   │   ├── graph/
│   │   │   └── trace-orchestrator.ts
│   │   ├── matchers/
│   │   │   ├── match-entry-point.ts
│   │   │   ├── entry-point-cache.ts
│   │   │   └── adapters/          — express, fastify, nestjs, nextjs, worker, fastapi, flask, django, gin, echo, chi, nethttp, python, go, rust, c, java, csharp, php, swift, dart
│   │   └── export/
│   │       └── mermaid-exporter.ts
│   ├── shared/
│   │   ├── types.ts
│   │   └── messages.ts
│   └── webview/
│       ├── index.tsx
│       ├── app.tsx
│       └── styles.css
├── tests/
│   ├── unit/
│   └── extension/
├── SPEC.md
├── AGENTS.md
├── package.json
├── tsconfig.json
└── pnpm-workspace.yaml
```

## 4. Trust boundary

```text
Preact Webview
   │ unknown message (postMessage)
   ▼
Zod schema (WebviewMessageSchema)
   │
   ▼
PouncePanel (Extension Host)
   │
   ▼
TraceOrchestrator
   │ vscode.executeCommand (LSP)
   ▼
matchEntryPoint
   │
   ▼
CallGraph → MermaidExporter / PouncePanel → Webview
```

## 5. Cycle detection

Uses a simple `visited: Set<string>` where each entry is `${filePath}:${symbolName}:${line}`. This is sufficient for DAG-like call graphs. Mutual recursion (SCCs) is marked as cut rather than traversed.

## 6. Caching

Entry point cache is in-memory only for 0.1.0. The `.vscode/.mewra-pounce-cache.json` path is reserved for a future file-based cache and is already in `.gitignore`.

## 7. Framework adapter pattern

Each adapter is a function `(item: CallHierarchyItem) => EntryPointMatch | null`. Adapters are composed in `matchEntryPoint` and checked against `mewraPounce.frameworks` configuration. Adding a new framework requires only a new function — no changes to core traversal logic.
