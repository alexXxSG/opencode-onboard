import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import fse from 'fs-extra'

vi.mock('execa', () => ({ execa: vi.fn() }))
vi.mock('../../utils/exec.js', () => ({
  header: vi.fn(),
  success: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  loading: vi.fn(),
}))

import { warn } from '../../utils/exec.js'
import { fixCodegraphConfig } from './codegraph.js'

describe('fixCodegraphConfig()', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codegraph-test-'))
    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir)
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it('does nothing when opencode.jsonc does not exist', async () => {
    await fixCodegraphConfig()
    // No error, no file created
    expect(fs.existsSync(path.join(tmpDir, '.opencode', 'opencode.json'))).toBe(false)
  })

  it('merges mcpServers from opencode.jsonc into .opencode/opencode.json', async () => {
    const rogueContent = {
      mcpServers: {
        codegraph: { command: 'codegraph', args: ['mcp'] }
      }
    }
    fs.writeFileSync(path.join(tmpDir, 'opencode.jsonc'), JSON.stringify(rogueContent))

    const opencodeDir = path.join(tmpDir, '.opencode')
    fs.mkdirSync(opencodeDir, { recursive: true })
    fs.writeFileSync(path.join(opencodeDir, 'opencode.json'), JSON.stringify({
      "$schema": "https://opencode.ai/config.json",
      "plugin": ["opencode-plugin-openspec@latest"]
    }))

    await fixCodegraphConfig()

    expect(fs.existsSync(path.join(tmpDir, 'opencode.jsonc'))).toBe(false)
    const result = await fse.readJson(path.join(opencodeDir, 'opencode.json'))
    expect(result.mcpServers.codegraph).toEqual({ command: 'codegraph', args: ['mcp'] })
    expect(result.plugin).toEqual(["opencode-plugin-openspec@latest"])
  })

  it('handles JSONC with comments', async () => {
    const rogueRaw = `{
  // This is a comment
  "mcpServers": {
    "codegraph": { "command": "codegraph", "args": ["mcp"] }
  }
}`
    fs.writeFileSync(path.join(tmpDir, 'opencode.jsonc'), rogueRaw)

    const opencodeDir = path.join(tmpDir, '.opencode')
    fs.mkdirSync(opencodeDir, { recursive: true })
    fs.writeFileSync(path.join(opencodeDir, 'opencode.json'), '{}')

    await fixCodegraphConfig()

    expect(fs.existsSync(path.join(tmpDir, 'opencode.jsonc'))).toBe(false)
    const result = await fse.readJson(path.join(opencodeDir, 'opencode.json'))
    expect(result.mcpServers.codegraph.command).toBe('codegraph')
  })

  it('removes unparseable opencode.jsonc and warns', async () => {
    fs.writeFileSync(path.join(tmpDir, 'opencode.jsonc'), 'not valid json {{{')

    await fixCodegraphConfig()

    expect(fs.existsSync(path.join(tmpDir, 'opencode.jsonc'))).toBe(false)
    expect(warn).toHaveBeenCalledWith('Could not parse opencode.jsonc, removing it')
  })

  it('creates .opencode/opencode.json if it does not exist', async () => {
    const rogueContent = {
      mcpServers: {
        codegraph: { command: 'codegraph', args: ['mcp'] }
      }
    }
    fs.writeFileSync(path.join(tmpDir, 'opencode.jsonc'), JSON.stringify(rogueContent))

    await fixCodegraphConfig()

    const result = await fse.readJson(path.join(tmpDir, '.opencode', 'opencode.json'))
    expect(result.mcpServers.codegraph.command).toBe('codegraph')
    expect(fs.existsSync(path.join(tmpDir, 'opencode.jsonc'))).toBe(false)
  })
})
