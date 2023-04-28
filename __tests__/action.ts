import * as os from 'os'
import process from 'process'
import path from 'path'
import cp from 'child_process'

export const runAction = (inputs: { [key: string]: string } | null = null): string => {
  if (inputs != null) {
    setActionInputs(inputs)
  }

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.SpawnOptions = {
    env: process.env,
  }

  const proc = cp.spawnSync(np, [ip], options)
  return proc.stdout.toString()
}

export const setActionInputs = (inputs: { [key: string]: string | null } = {}): void => {
  for (const key in inputs) {
    const value = inputs[key]
    if (value != null) {
      process.env[key] = value
    } else {
      delete process.env[key]
    }
  }
}

export const getActionOutput = (consoleOutput: string | Buffer, outputName: string): string | null => {
  const output = readOutput(consoleOutput, 'set-output')
  const regex = new RegExp(` name=${outputName}::(.*)$`)
  const match = output.match(regex)
  return match ? match[1] : null
}

export const getActionError = (consoleOutput: string | Buffer): string | null => {
  const output = readOutput(consoleOutput, 'error') ?? null
  const regex = new RegExp(`::(.*)$`)
  const match = output.match(regex)
  return match ? match[1] : null
}

const readOutput = (consoleOutput: string | Buffer, key: string): string => {
  const output = consoleOutput.toString()
  const regex = new RegExp(`::${key}(.*)${os.EOL}`)
  const match = output.match(regex)
  return match ? match[1] : ''
}