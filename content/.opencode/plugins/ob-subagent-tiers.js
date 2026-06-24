// ob-subagent-tiers
//
// On startup, reads *-engineer.md agent files (templates with no model) and
// injects tier variants (*-engineer.build, *-engineer.fast, *-engineer.plan)
// into the live config (cfg.agent) via the `config` hook, each with the model
// resolved from wizard.models.
//
// Model resolution priority:
//   1. `.opencode/opencode-onboard.user.json` → wizard.models  (user override, gitignored)
//   2. `.opencode/opencode-onboard.json`      → wizard.models  (team shared)
//   3. unset → variant not created (the template inherits the lead's model)
//
// This lets /ob-propose annotate tasks with tier-suffixed agent names
// (e.g. `backend-engineer.build`), and /ob-apply spawn them directly —
// the model is baked in at config time, no mid-session file editing needed.
//
// Template agents (*-engineer.md) have NO model: — they are plain templates.
// Tier variants are in-memory only (injected via the config hook); no
// generated files, no git churn.  Restart opencode after /ob-set-model to
// pick up model changes.

export const ObSubagentTiers = async ({ directory }) => {
  const root = directory || process.cwd()

  const TIERS = ["build", "fast", "plan"]

  async function readJson(filePath) {
    try {
      const fs = await import("node:fs/promises")
      const raw = await fs.readFile(filePath, "utf-8")
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  async function resolveModels() {
    const userPath = `${root}/.opencode/opencode-onboard.user.json`
    const teamPath = `${root}/.opencode/opencode-onboard.json`

    const user = await readJson(userPath)
    const team = await readJson(teamPath)

    const userModels = user?.wizard?.models ?? {}
    const teamModels = team?.wizard?.models ?? {}

    // User overrides team
    const models = {}
    for (const tier of TIERS) {
      models[tier] = userModels[tier] ?? teamModels[tier] ?? null
    }
    return models
  }

  return {
    config: async (cfg) => {
      try {
        const models = await resolveModels()
        const available = TIERS.filter((t) => models[t])
        if (available.length === 0) return

        cfg.agent = cfg.agent || {}

        // Find all *-engineer agents in the config (loaded from .opencode/agents/*.md)
        const engineerNames = Object.keys(cfg.agent).filter((name) =>
          name.endsWith("-engineer")
        )

        for (const name of engineerNames) {
          const template = cfg.agent[name]
          if (!template) continue

          for (const tier of available) {
            const variantName = `${name}.${tier}`
            // Shallow-clone the template (which has description, mode,
            // permission, system/prompt, etc.) and stamp the model on top.
            cfg.agent[variantName] = {
              ...template,
              model: models[tier],
            }
          }
        }
      } catch {
        // never break the session over tier injection
      }
    },
  }
}