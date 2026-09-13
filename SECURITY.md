# Mewra Pounce — Security Policy

Security is a release-blocking requirement. Mewra Pounce runs inside a VS Code Webview, accepts workspace file paths as inputs, and communicates across an Extension Host / Webview boundary. These are treated as security-sensitive surfaces.

---

## 1. Security goals

Mewra Pounce aims to protect:

- the user's source code and workspace from unexpected exfiltration;
- the VS Code extension host from code execution through malicious graph payloads;
- the Webview from XSS via node labels or file paths derived from workspace content;
- other extensions' credentials and secrets.

---

## 2. Trust boundaries

```text
Workspace source files
        │
        ▼
VS Code LSP Call Hierarchy API
        │ typed CallHierarchyItem
        ▼
TraceOrchestrator (Extension Host — privileged)
        │
        ▼
Zod schema (ExtensionMessageSchema)
        │ validated postMessage
        ▼
Webview (untrusted boundary — sandboxed iframe)
        │ Zod schema (WebviewMessageSchema)
        ▼
Extension Host
```

Untrusted inputs:

- all Webview messages (validated with Zod at both ends);
- workspace file paths and symbol names used as node labels;
- symbol names derived from the LSP (treated as untrusted strings for rendering).

---

## 3. Threat model

### 3.1 Webview XSS / content injection

Risk: symbol names or file paths from workspace code become executable HTML in the Webview.

Controls:

- strict CSP starting with `default-src 'none'`;
- nonce-only script loading — no `unsafe-inline` scripts;
- no `eval` or `new Function` anywhere in the extension or Webview;
- Preact renders node labels as text, not as raw HTML;
- Cytoscape.js node labels are set as plain strings via `data(label)`, not as HTML;
- all Webview messages parsed with Zod before acting on them.

### 3.2 Arbitrary command execution via Webview input

Risk: a Webview message triggers an unintended `vscode.commands.executeCommand` call.

Controls:

- `openFile` messages are validated by Zod (path is a string, line is a nonnegative integer);
- only known file URIs from workspace paths are opened — the handler uses `vscode.Uri.file()`, not `Uri.parse()` on raw input;
- no Webview message dispatches to arbitrary command IDs.

### 3.3 Uncontrolled traversal / denial of service

Risk: a deeply recursive codebase causes stack overflow or hangs VS Code.

Controls:

- configurable depth limit (default 12, max user-configurable);
- `visited` set prevents re-traversal of already-seen nodes;
- 500-node branch warning prompts the user to continue or stop;
- debounced command invocation.

### 3.4 Cache file poisoning

Risk: an attacker modifies `.vscode/.mewra-pounce-cache.json` to cause incorrect graph data.

Controls:

- cache is in-memory only in 0.1.0; the file path is reserved but not yet written or read;
- if a persistent file cache is introduced in a future release, it must be parsed with a Zod schema, not with bare `JSON.parse`.

---

## 4. Security invariants

Never introduce:

- `eval` or `new Function`;
- broad CSP wildcards (`*`) or `unsafe-inline` scripts;
- Webview messages dispatching to arbitrary `executeCommand` IDs;
- unvalidated Webview messages — always use `WebviewMessageSchema.safeParse`;
- shell commands built from workspace input;
- `innerHTML` assignment with untrusted content;
- network calls from the extension host or Webview (0.1.0 is fully local);
- telemetry or usage analytics.

---

## 5. Reporting a vulnerability

**Please do not publish exploitable vulnerabilities in a public GitHub issue.**

Use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) for this repository.

Include:

- a description of the vulnerability;
- steps to reproduce;
- potential impact;
- any suggested mitigations (optional).

We aim to acknowledge reports within 5 business days and release a fix within 30 days for confirmed issues, depending on severity.

---

## 6. Supported versions

| Version            | Supported             |
| ------------------ | --------------------- |
| latest pre-release | ✅                    |
| older releases     | ❌ — update to latest |

---

## 7. Security-sensitive code areas

Reviewers should pay particular attention to:

| Area                   | File(s)                                            |
| ---------------------- | -------------------------------------------------- |
| Webview CSP            | `src/extension/pounce-panel.ts`                    |
| Message validation     | `src/shared/messages.ts`                           |
| File open from Webview | `src/extension/pounce-panel.ts` `openFile` handler |
| Node label rendering   | `src/webview/app.tsx` Cytoscape styles             |
| Cache read/write       | `src/core/matchers/entry-point-cache.ts`           |

Any change to these files should include a brief security note in the PR description.
