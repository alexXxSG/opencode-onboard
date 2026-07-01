---
description: Archive the oldest merged unarchived OpenSpec change and update documentation.
---

> **Command aliases:** Loaded skills may reference `/opsx-propose`, `/opsx-apply`, `/opsx-archive`, or `/opsx-explore`. Always substitute: `/opsx-propose` -> `/ob-propose`, `/opsx-apply` -> `/ob-apply`, `/opsx-archive` -> `/ob-archive`, `/opsx-explore` -> `/ob-explore`. Never mention the `opsx-` names in your responses to the user.

Apply `## Optimizations` from AGENTS.md (RTK, codegraph, memory, etc.).
<!-- OB-CMD-RTK-START -->
Prefix all bash commands with `rtk` when RTK is enabled.
<!-- OB-CMD-RTK-END -->

---

Find the oldest unarchived OpenSpec change that has a completed PR, archive it, update docs, and open an archive PR. No input required.

<!-- OB-CMD-CODEGRAPH-START -->
Use codegraph MCP tools (NOT CLI commands). Do NOT run `codegraph` in bash — use the MCP tools directly.
- `codegraph_impact` when checking if the archived change's specs affect `ARCHITECTURE.md` or `DESIGN.md`.
<!-- OB-CMD-CODEGRAPH-END -->

<!-- OB-CMD-MEMORY-START -->
Use basic-memory MCP tools (NOT CLI commands). Do NOT run `basic-memory` in bash — use the MCP tools directly.
- `search` for the `change-{slug}-context` note and any `task-<id>-result` notes from the change being archived.
- `write_note` with title `archive-{slug}` summarizing what was archived, what docs changed, and the archive PR link.
<!-- OB-CMD-MEMORY-END -->

**Steps**

1. **Prepare working tree**

   ```bash
   REPO_ROOT="$(git rev-parse --show-toplevel)"
   ```

   If not on `main` with uncommitted changes, stash them (`git stash push -m "WIP before archive"`) and warn the user before exit. Then sync `main`:

   ```bash
   git switch main && git pull origin main
   ```

<!-- OB-PLATFORM-ARCHIVE-START -->
<!-- OB-PLATFORM-ARCHIVE-END -->
