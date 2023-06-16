import { wait } from '../src/wait'
import { describe, expect, it } from '@jest/globals'

describe('Wait function', () => {
  it('waits for the specified number of milliseconds', async () => {
    const start = new Date()
    await wait(500)
    const end = new Date()
    const delta = Math.abs(end.getTime() - start.getTime())
    expect(delta).toBeGreaterThan(450)
  })

  it('throws an error when given a non-number', async () => {
    const input = parseInt('foo', 10)
    await expect(wait(input)).rejects.toThrow('milliseconds not a number')
  })
})
