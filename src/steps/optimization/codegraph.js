import { execa } from 'execa'
import { header, success, warn, error, loading } from '../../utils/exec.js'

export async function installCodegraph(options = {}) {
  if (!options.skipHeader) header('Installing codegraph')

  loading('installing codegraph globally...')

  try {
    const installResult = await execa('npm', ['install', '-g', '@colbymchenry/codegraph'], {
      reject: false,
      stdio: 'pipe',
    })

    if (installResult.exitCode !== 0) {
      warn('codegraph global install exited with non-zero code')
      return { optedIn: true, installed: false }
    }
    success('codegraph installed globally')
  } catch (err) {
    error(`Failed to install codegraph: ${err.message}`)
    return { optedIn: true, installed: false }
  }

  loading('configuring codegraph for opencode...')

  try {
    const configResult = await execa(
      'codegraph',
      ['install', '--target=opencode', '--location=local', '--yes'],
      {
        cwd: process.cwd(),
        reject: false,
        stdio: 'pipe',
      }
    )

    if (configResult.exitCode !== 0) {
      warn('codegraph install config exited with non-zero code')
      return { optedIn: true, installed: false }
    }
    success('codegraph configured for opencode (project-local)')
  } catch (err) {
    error(`Failed to configure codegraph: ${err.message}`)
    return { optedIn: true, installed: false }
  }

  loading('initializing codegraph project index...')

  try {
    const initResult = await execa('codegraph', ['init'], {
      cwd: process.cwd(),
      reject: false,
      stdio: 'pipe',
    })

    if (initResult.exitCode !== 0) {
      warn('codegraph init exited with non-zero code')
      return { optedIn: true, installed: false }
    }
    success('codegraph project index initialized')
  } catch (err) {
    error(`Failed to initialize codegraph: ${err.message}`)
    return { optedIn: true, installed: false }
  }

  return { optedIn: true, installed: true }
}
