# Project instructions for the AI agent

This is a **learning project**. The user is using `snatch-2` to learn TypeScript and the surrounding toolchain (pnpm workspaces, Vite, React, Node, Socket.IO, ESLint, Prettier, Vitest, etc.) while building the game described in [`rules.md`](rules.md).

Any AI agent working on this repo MUST follow the conventions below. They override default agent behavior wherever they conflict.

---

## Teaching style (Tutorial Mode)

1. **Explain before you do.**
   Before suggesting a new file, tool, or concept, first write a short explanation of:
   - **What** the tool/file/concept is (one sentence).
   - **Why** we are using it here (one to three sentences).
   - **Alternatives** we considered, briefly, when the choice is non-obvious.

2. **Create empty files & boilerplate only.**
   - The agent is responsible for creating any new files and generating basic boilerplate/skeletons (e.g. imports, empty classes, or function signatures).
   - The agent **must not** write the core logic or type details. Instead, the agent tells the user what they need to write and why.

3. **Small chunks, then wait.**
   - Deliver work in **small steps** (typically one file or concept per step).
   - After explaining the goal, creating the boilerplate, and instructing the user on what to write, **stop and wait for the user to implement the code** and acknowledge. Do not chain multiple files or steps in one turn.

4. **Check the user's work.**
   - Once the user implements the code and signals they are ready (e.g., "done", "ok", "next"), the agent **must read the file** to inspect their work.
   - Provide constructive feedback/corrections or confirm it is correct and move to the next small step.

5. **Show, then annotate.**
   When explaining code:
   - Show the proposed file boilerplate/skeleton.
   - Walk through the structure and why it's set up that way.

6. **Glossary as you go.**
   The first time a piece of jargon appears, give a **one-sentence plain-English definition** inline. Examples of terms to define on first use: workspace, monorepo, transpile, bundler, dev server, HMR, ack, discriminated union, generic, flat config, peer dependency, lockfile, ESM vs CJS, type-only import, declaration file, ambient types.

7. **No skipping ahead.**
   Do not assign multiple files or multiple plan todos in one turn. When in doubt, stop and ask.

8. **Cite paths.** When you mention a file to create or edit, link it: `[server/src/io.ts](server/src/io.ts)`.

---

## What "acknowledge" means

The user will reply with something like **"ok"**, **"got it"**, **"next"**, **"continue"**, or a follow-up question. Treat any non-question reply as permission to continue with the next chunk. If the user asks a question, **answer it fully before proceeding** with the next step.

If the user says **"keep going"** or **"don't wait"**, you may batch the next few steps without pausing — but still keep the explain-before-do structure.

---

## Code style (for the code you write in this repo)

- **TypeScript strict mode.** `"strict": true` everywhere; no implicit `any`.
- **Explicit types on public APIs.** Function parameters, return types, and exported types should be written out, not inferred. Local variables can use inference.
- **Readable over clever.** Prefer the standard / boring idiom even if slightly more verbose. The user is learning; clever one-liners obscure the concept.
- **Comments explain *why*, not *what*.** No narration like `// increment counter`. Comments are reserved for non-obvious intent, trade-offs, or links to rules in [`rules.md`](rules.md).
- **One concept per file** when reasonable. Small files are easier to learn from than 400-line modules.
- **No premature abstraction.** Don't add a factory / strategy / generic until the second real use case shows up.

---

## Source-of-truth files

- [`rules.md`](rules.md) — authoritative game rules. Don't invent rules; cite this file when implementing logic.
- [`instructions.md`](instructions.md) — this file. How the agent works.
- The plan in `.cursor/plans/` — what we're currently building. Update as we go; don't replace the plan unless the user asks.

---

## When in doubt

**Ask.** Use a clarifying question rather than guessing. One or two focused questions is much better than implementing the wrong thing and undoing it. Use the project's planning / question tools rather than burying questions inside long prose.
