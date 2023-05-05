import { afterEach, beforeEach } from '@jest/globals'
import * as os from 'os'
import process from 'process'
import path from 'path'
import cp from 'child_process'
import * as fs from 'fs'

const tmpDir = path.join(__dirname, '..', 'tmp')
const outputsFile = path.join(tmpDir, 'outputs')

const githubOutputEnvKey = 'GITHUB_OUTPUT'

/**
 * A helper class for testing GitHub Actions. This class emulates how GitHub Actions runs the action by running it in a
 * child process (see {@link run}). Any inputs set by {@link setInput} or {@link setInputs} will be available to the
 * action through {@link @actions/core.getInput} as they would be when run in GitHub Actions.
 */
export default class ActionRunner {
  /**
   * The outputs set by the action via {@link @actions/core.setOutput}. Will be empty until {@link run} or {@link call}
   * is called and will be reset after each test.
   */
  outputs: { [key: string]: string } = {}

  /**
   * The error set by the action via {@link @actions/core.setFailed}. Will be null until {@link run} is called and will
   * be reset after each test. Due to the way this error has to be parsed, it is not set when {@link call} is used.
   */
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

  /**
   * Sets an input for the action. Must be called before {@link run} or {@link call} for the inputs to have an effect.
   *
   * @param key The name of the input as it appears in action.yml ('milliseconds', not 'INPUT_MILLISECONDS'.)
   * @param value The value of the input.
   */
  setInput(key: string, value: string): void {
    this.inputs[`INPUT_${key.replace(/ /g, '_').toUpperCase()}`] = value
  }

  /**
   * Set multiple inputs at once. Must be called before {@link run} or {@link call} for the inputs to have an effect.
   *
   * @param inputs The inputs to set. See {@link setInput} for details.
   */
  setInputs(inputs: { [key: string]: string }): void {
    for (const key in inputs) {
      this.setInput(key, inputs[key])
    }
  }

  /**
   * Emulates how GitHub Actions runs the action by running it in a child process.
   * <br/>
   * Any inputs set by {@link setInput} or {@link setInputs} will be available to the action through
   * {@link @actions/core.getInput} as they would be when run in GitHub Actions.
   * <br/>
   * Any outputs set by the action via {@link @actions/core.setOutput} will be available through {@link outputs}.
   * <br/>
   * Any errors set by the action via {@link @actions/core.setFailed} will be available through {@link error}.
   *
   * @returns The stdout of the action.
   */
  run(): string {
    this.outputs = {}
    this.error = null
    this.setEnv()

    const output = this.runAction()
    this.collectOutputs()
    return output
  }

  /**
   * Provides a way to call arbitrary code in the same environment as the action.
   * <br/>
   * Any inputs set by {@link setInput} or {@link setInputs} will be available to the action through
   * {@link @actions/core.getInput} as they would be when run in GitHub Actions.
   * <br/>
   * Any outputs set in the callback via {@link @actions/core.setOutput} will be available through {@link outputs}.
   *
   * @param callback The code to call that needs access to the action's inputs.
   * @returns The return value of the callback, if any.
   */
  async call(callback: () => Promise<unknown>): Promise<unknown> {
    this.setEnv()

    const output = await callback()
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
