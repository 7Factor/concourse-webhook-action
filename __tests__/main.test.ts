import { describe, expect, it, beforeAll } from '@jest/globals'
import { getActionError, getActionOutput, runAction, setActionInputs } from './action'

describe('GitHub Action', () => {
  describe('milliseconds input is provided', () => {
    beforeAll(() => {
      setActionInputs({ INPUT_MILLISECONDS: '500' })
    })

    it('outputs time', () => {
      const output = runAction()
      console.log(output)

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
      const output = runAction()
      console.log(output)

      const error = getActionError(output)
      expect(error).not.toBeNull()
      expect(error).toEqual('milliseconds not a number')
    })
  })
})
