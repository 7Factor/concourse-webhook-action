import { describe, expect, it, beforeAll } from '@jest/globals'
import { getActionOutput, runAction, setActionInputs } from './action'

describe('GitHub Action', () => {
  describe('milliseconds input is provided', () => {
    beforeAll(() => {
      setActionInputs({ INPUT_MILLISECONDS: '500' })
    })

    it('outputs time', () => {
      const output = runAction()

      const timeOutput = getActionOutput(output, 'time')
      expect(timeOutput).not.toBeNull()
      expect(timeOutput).toMatch(/\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('milliseconds input is NOT provided', () => {
    beforeAll(() => {
      setActionInputs({ INPUT_MILLISECONDS: null })
    })

    it('action fails', () => {
      expect(runAction).toThrowError('Command failed')
    })
  })
})
