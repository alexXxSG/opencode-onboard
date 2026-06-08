---
description: Archive a completed OpenSpec change.
---

> **Command aliases:** Loaded skills may reference `/opsx-propose`, `/opsx-apply`, `/opsx-archive`, or `/opsx-explore`. Always substitute: `/opsx-propose` → `/ob-propose`, `/opsx-apply` → `/ob-apply`, `/opsx-archive` → `/ob-archive`, `/opsx-explore` → `/ob-explore`. Never mention the `opsx-` names in your responses to the user.

Apply `## Optimizations` from AGENTS.md (RTK, codegraph, memory, etc.).

Load `@openspec-archive-change` skill and follow its instructions.


---
description: Archive change and update documentation. Triggered by /archive <url|change> command.
---

**Input**: A GitHub Issue URL, Azure DevOps work item URL or change ID.

**Steps:**

1. **Load baseline**
   Load `@ob-global`

2. **Create archive branch**
   - Switch to main branch and pull the latest changes to ensure it's up to date:
      ```bash
      git switch main
      git pull origin main
      ```
   - If there are changes in current branch (when switching or pulling), stash them and warn the user. 
   - Create a new branch named `archive/{id}-{slug}` based on main:
      ```bash
      git checkout -b archive/{id}-{slug}
      ```
   - Do not apply the stashed changes to the new archive branch, as the archive branch should only contain the changes related to the merged PR.

3. **Find oldest unarchived change**
   - List all the changes in the `openspec/changes` folder in descending order of creation date (exclude `openspec/changes/archive`):   
      ```bash
      ls -ltr openspec/changes | grep -v archive
      ```
   - Try to match a change (`us-{id}-{slug}`) with the provided URL (`feature/{id}-{slug}`) or change ID (`us-{id}-{slug}`).
   - If the change is not found, report as a blocker and do not proceed with archiving.
   - If the change is not the first in the list (the oldest), report that there are oldest changes that need to be archived first and do not proceed with archiving. Include the list of unarchived changes in the message and which one should be archived first.

4. **Detect platform and load matching skill**
   - GitHub Issue URL → load `ob-archive-gh` skill
   - Azure DevOps URL → load `ob-archive-az` skill
   - Change ID → try to detect if it's from GitHub or Azure DevOps based on the change metadata, then load the corresponding skill. If detection fails, ask the user to specify which platform the change is from and load the corresponding skill.

5. **Summary**
    Display:
    - Change ID and title
    - Link to new archive PR
    - Changes applied to ARCHITECTURE.md and DESIGN.md
