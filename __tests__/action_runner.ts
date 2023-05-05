import { afterEach, beforeEach } from '@jest/globals'
import * as os from 'os'
import process from 'process'
import path from 'path'
import cp from 'child_process'
import * as fs from 'fs'

const tmpDir = path.join(__dirname, '..', 'tmp')
const outputsFile = path.join(tmpDir, 'outputs')

const githubOutputEnvKey = 'GITHUB_OUTPUT'

export default class ActionRunner {
  outputs: { [key: string]: string } = {}
  error: string | null = null
  private inputs: { [key: string]: string } = {}

  constructor() {
    beforeEach(() => {
      this.createOutputsFile()
    })
    afterEach(() => {
      this.deleteOutputsFile()
      this.cleanEnv()
      this.inputs = {}
    })
  }

  setInput(key: string, value: string): void {
    this.inputs[`INPUT_${key.replace(/ /g, '_').toUpperCase()}`] = value
  }

  setInputs(inputs: { [key: string]: string }): void {
    for (const key in inputs) {
      this.setInput(key, inputs[key])
    }
  }

  run(): string {
    this.outputs = {}
    this.error = null
    this.setEnv()

    const output = this.runAction()
    this.collectOutputs()
    return output
  }

  private createOutputsFile(): void {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir)
    }
    fs.writeFileSync(outputsFile, '')
  }

  private deleteOutputsFile(): void {
    if (fs.existsSync(outputsFile)) {
      fs.unlinkSync(outputsFile)
    }
  }

  private cleanEnv(): void {
    for (const key in this.inputs) {
      delete process.env[key]
    }
    delete process.env[githubOutputEnvKey]
  }

  private setEnv(): void {
    for (const key in this.inputs) {
      process.env[key] = this.inputs[key]
    }
    process.env[githubOutputEnvKey] = outputsFile
  }

  private runAction(): string {
    const nodePath = process.execPath
    const actionPath = path.join(__dirname, '..', 'lib', 'main.js')
    const options: cp.SpawnOptions = {
      env: process.env,
    }

    const proc = cp.spawnSync(nodePath, [actionPath], options)
    if (proc.status) {
      this.error = this.getActionError(proc.stdout)
    }
    return proc.stdout.toString()
  }

  private collectOutputs(): void {
    const rawOutputs = fs.readFileSync(outputsFile, 'utf8')
    const regex = new RegExp(`(.*?)<<(?<delimiter>.*?)${os.EOL}(.*?)${os.EOL}\\k<delimiter>`, 'sg')
    const matches = rawOutputs.matchAll(regex)
    for (const match of matches) {
      this.outputs[match[1]] = match[3]
    }
  }

  private getActionError(consoleOutput: string | Buffer): string | null {
    const output = consoleOutput.toString()
    console.log(output)

    const regex = new RegExp(`::error::(.*)${os.EOL}`)
    const match = output.match(regex)
    return match ? match[1] : null
  }
}
