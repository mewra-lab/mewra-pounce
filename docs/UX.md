# Mewra Pounce — UX Specification

## 1. Webview graph panel

- Library: **Cytoscape.js** with `cytoscape-dagre` layout plugin
- Layout: vertical `dagre` — entry points at top, starting function at bottom
- Panel opens in `ViewColumn.Beside` (alongside the editor)

## 2. Node colors

| Color                               | Meaning                                              |
| ----------------------------------- | ---------------------------------------------------- |
| 🟢 Green (`#22c55e`)                | Entry point (route / worker / cron)                  |
| 🔵 Blue (`#3b82f6`)                 | The trace's starting point (function under cursor)   |
| ⚪ Gray (VS Code editor background) | Intermediate function                                |
| 🔴 Red dashed border (`#ef4444`)    | Unresolved / dynamic call that could not be followed |

## 3. Header bar

```
⚠ Impacts 4 API Routes  |  1 Background Worker
[Toggle test files]  [Copy as Mermaid]
```

- Blast radius summary updates whenever the graph data changes.
- "Toggle test files" hides or shows nodes where `isTestFile === true`.
- "Copy as Mermaid" invokes `mewra-pounce.exportMermaid`.

## 4. Node interaction

- **Click** any node → opens the file at the node's line via `openFile` message.
- **Pan / zoom** — standard Cytoscape gestures.

## 5. Loading state

While tracing: centered spinner + "Tracing callers…" text.

## 6. Error state

If no call hierarchy item is found at cursor or the LSP fails: centered warning icon + error message text.

## 7. Commands and keybindings

| Command ID                     | Title                      | Keybinding          |
| ------------------------------ | -------------------------- | ------------------- |
| `mewra-pounce.trace`           | Trace Callers              | `Alt+T`             |
| `mewra-pounce.toggleTestFiles` | Toggle Test Files in Graph | `Alt+Shift+T`       |
| `mewra-pounce.exportMermaid`   | Copy Graph as Mermaid      | Webview button only |
| `mewra-pounce.clearCache`      | Clear Entry Point Cache    | —                   |

## 8. Settings

| Key                                  | Default  | Description                          |
| ------------------------------------ | -------- | ------------------------------------ |
| `mewraPounce.maxDepth`               | `12`     | Max traversal depth                  |
| `mewraPounce.hideTestFilesByDefault` | `true`   | Hide test files on first render      |
| `mewraPounce.frameworks`             | all four | Frameworks to detect as entry points |
| `mewraPounce.cacheEntryPoints`       | `true`   | Cache detected entry points          |

## 9. Design principles

- Uses VS Code theme CSS variables exclusively — no hardcoded colors in structure.
- Must remain usable in narrow editor groups (sidebar-width panels).
- Keyboard-navigable controls (buttons reachable by Tab).
- No external fonts or remote resources loaded by the Webview.
