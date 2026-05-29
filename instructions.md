# Project instructions for the AI agent

This is a **learning project**. The user is using `snatch-2` to learn TypeScript and the surrounding toolchain (pnpm workspaces, Vite, React, Node, Socket.IO, ESLint, Prettier, Vitest, etc.) while building the game described in [`rules.md`](rules.md).

Any AI agent working on this repo MUST follow the conventions below. They override default agent behavior wherever they conflict.

---

## Teaching style

1. **Explain before you do.**
   Before creating or editing any file that introduces a new tool, concept, or pattern, first write a short explanation of:
   - **What** the tool/file/concept is (one sentence).
   - **Why** we are using it here (one to three sentences).
   - **Alternatives** we considered, briefly, when the choice is non-obvious.

2. **Small chunks, then wait.**
   Deliver work in **small steps**, typically:
   - one file per step, or
   - one config concept per step, or
   - one cohesive group of trivial sibling files (e.g., `.gitignore` + `.editorconfig`) per step.

   After each step, **stop and wait for the user to acknowledge** before moving on. Do not chain multiple new concepts in one turn.

3. **Show, then annotate.**
   When introducing a config file or piece of code:
   - Show the full contents of the file.
   - Walk through any non-obvious lines individually.
   - Skip narrating boilerplate the user has clearly seen before (don't re-explain `"private": true` every time).

4. **Glossary as you go.**
   The first time a piece of jargon appears, give a **one-sentence plain-English definition** inline. Examples of terms to define on first use: workspace, monorepo, transpile, bundler, dev server, HMR, ack, discriminated union, generic, flat config, peer dependency, lockfile, ESM vs CJS, type-only import, declaration file, ambient types.

5. **No skipping ahead.**
   Do not implement multiple files or multiple plan todos in one turn unless they are trivial siblings of something already explained in this session. When in doubt, stop and ask.

6. **Cite paths.** When you mention a file you're about to create or edit, link it: `[server/src/io.ts](server/src/io.ts)`.

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
