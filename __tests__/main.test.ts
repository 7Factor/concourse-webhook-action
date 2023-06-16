import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import ActionRunner from './action_runner'
import testInputs from './test_inputs'
import { triggerWebhook } from '../src/webhook'
import { sendWebhookRequest } from '../src/main'

jest.mock('../src/webhook', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ...(jest.requireActual('../src/webhook') as {}),
  triggerWebhook: jest.fn(),
}))
const mockedTriggerWebhook = triggerWebhook as jest.MockedFunction<typeof triggerWebhook>

const { concourseUrl, concourseTeam, concoursePipeline, pipelineResource, resourceWebhookToken, pipelineVariables } =
  testInputs

describe('When run as a GitHub Action', () => {
  const actionRunner = new ActionRunner()

  describe('given the required action inputs are provided', () => {
    beforeEach(() => {
      actionRunner.setInputs({
        'concourse-url': concourseUrl,
        'concourse-team': concourseTeam,
        'concourse-pipeline': concoursePipeline,
        'pipeline-resource': pipelineResource,
        'resource-webhook-token': resourceWebhookToken,
        'pipeline-variables': JSON.stringify(pipelineVariables),
      })
    })

    it('runs with error', () => {
      const output = actionRunner.run()
      console.log(output)

      // The action runner runs the action in a child process meaning we can't mock axios. The expected result is this:
      expect(actionRunner.error).toEqual(`getaddrinfo ENOTFOUND ${concourseUrl.replace('https://', '')}`)
    })
  })
})

describe('When calling sendWebhookRequest', () => {
  describe('given the action inputs are provided', () => {
    it('the URL provided to triggerWebhook does not include the webhook token', async () => {
      await sendWebhookRequest(testInputs)

      expect(mockedTriggerWebhook.mock.calls[0][0].toString()).not.toContain(resourceWebhookToken)
    })
  })
})
