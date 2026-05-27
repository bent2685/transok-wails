# Development Guide

This is a Wails project using the App Router architecture.
You **MUST** absolutely obey this guide.

You need to communicate with the user in Chinese.

---

## Tech Stack
- Golang
- react+vite+unocss
- wails GUI

---

## UI/UX Design

@DESIGN.md in the packages root directory
**MUST** be followed for all UI/UX design decisions.

---

## Conventions
- Prefer named exports for components
- Use TypeScript strict mode

---

## Code Style
- Use functional components with TypeScript
- Prefer async/await over .then() chains
- Use early returns for cleaner code
- Keep components small and focused

---

## Coding Guidelines (Core Principle: Restraint)

### Do only what is requested

* **Do not proactively add features.** A bug fix does not need a "handy cleanup" of surrounding code; a simple feature does not require extra configuration options.
* **Do not write error handling / fallback / validation for non-existent scenarios.** Only validate at system boundaries (user input, external APIs). Internal code should trust each other.
* **Do not abstract for "potential future needs."** Use one-off code for one-off operations. Three lines of similar code are better than a premature abstraction.
* **Do not add comments / docstrings / type annotations to code you haven't modified.** Only comment where the logic is genuinely non-obvious.
* **Do not perform unrelated renaming / reordering / style unification.** Keep the diff minimal.

### Read before modifying

* **Modifying unread files based on impression is strictly forbidden.** If a user says "modify function X," first `Read` the entire file to understand the context, then `Edit`.
* Before modifying a public type / function, first `Grep` the entire repository for all call sites to confirm the blast radius.
* When changing styles, first check the patterns used in sibling files. **Copy your neighbors; do not invent your own.**

### Avoid destructive "shortcuts"

* When encountering obstacles, **do not resolve them by deleting, bypassing, or disabling checks.** Locate the root cause first.
* Operations like `--no-verify`, `--no-gpg-sign`, `git reset --hard`, `git push --force`, and `rm -rf` are not allowed unless **explicitly** authorized by the user.
* When encountering unfamiliar files / branches / configurations, investigate before handling them — they might be part of what the user is currently working on.

### Tool Preferences

* **Use dedicated tools over bash whenever possible:**
* Reading files → Use `Read`, not `cat` / `head` / `tail`
* Modifying files → Use `Edit`, not `sed` / `awk`
* Finding files → Use `Glob`, not `find` / `ls`
* Finding content → Use `Grep`, not `grep` / `rg`
* Writing files → Use `Write`, not `cat <<EOF` (multiple * **concurrently** --- Execute calls independent message), multiple rather same serially. than the tool within/>

---

## Commit Guidelines

### Conventional Commits Style

Format: `<type>: <subject>`, where the subject is written in Chinese.

| type | Purpose |
| --- | --- |
| `feat` | New features |
| `fix` | Bug fixes |
| `refactor` | Internal refactoring that does not change external behavior |
| `chore` | Miscellaneous (dependencies, configurations, build scripts) |
| `docs` | Documentation (README / AGENTS.md / comments) |
| `test` | Adding tests / modifying tests |
| `style` | Pure formatting adjustments (no semantic changes) |
| `perf` | Performance optimizations |

Examples:

```
feat: xxx
fix: xxx
refactor: xxx
test: xxx

```

### Small Steps, Frequent Commits

**Strict constraint: One commit per task.**

* If a PR contains 3 independent changes → **3 commits**, not 1 massive commit stuffed with everything.
* Refactoring + New Feature → Split them: first commit the refactoring (behavior unchanged), then commit the new feature.
* Bug fix + A typo found along the way → Split them: first commit the fix, then commit the chore.
* Writing code + Writing tests → These can be committed together, but **you must not write code without writing tests**.

The criterion for judgment: **If you would want to precisely roll back this specific change later, give it a separate commit.**

### Commit Message Body

* Explain **why**, not **what was done** (the diff already tells you what was done).
* 1-3 sentences are enough. No need to write a novel.
* Reference associated issues / PRs using the `owner/repo#123` format.

### Prohibited Actions

* **Never `git commit --amend**` unless the user explicitly tells you to "amend". To fix the previous commit, create a new fix commit instead.
* **Never use `--no-verify**`. If a pre-commit hook fails, fix the underlying issue instead of bypassing it.
* **Never `git push --force` to main / master.**
* **Never push when the user hasn't explicitly asked you to.** Local commits are perfectly fine, but pushing introduces side effects.
* **Never commit `.env` files, secret keys, or binaries larger than 1MB.**
* **Never append trailers / sign-off footers to commit messages.** This includes `Co-Authored-By:`, `Signed-off-by:`, `Generated-by:`, `Reviewed-by:` and any similar `Key: Value` footer at the end of the message. The commit body ends with the last sentence — nothing after it.

### Mandatory Checklist When Committing

* Run `git status` first to review the staged changes.
* Run `git diff --staged` to double-check that no unrelated files have slipped in.
* Run `git log -5 --oneline` to check the recent commit message style of the repository, and **copy that style**.
