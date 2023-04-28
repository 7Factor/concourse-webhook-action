import { describe, expect, it, beforeEach } from '@jest/globals'
import ActionRunner from './action_runner'

describe('GitHub Action', () => {
  const actionRunner = new ActionRunner()

  describe('milliseconds input is provided', () => {
    beforeEach(() => {
      actionRunner.setInput('milliseconds', '500')
    })

    it('outputs time', () => {
      const output = actionRunner.run()
      console.log(output)

      const timeOutput = actionRunner.outputs['time']
      expect(timeOutput).toBeDefined()
      expect(timeOutput).toMatch(/\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('milliseconds input is NOT provided', () => {
    it('action fails', () => {
      const output = actionRunner.run()
      console.log(output)

      const error = actionRunner.error
      expect(error).not.toBeNull()
      expect(error).toEqual('milliseconds not a number')
    })
  })
})
