import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import axios from 'axios'
import testInputs from './test_inputs'
import { Inputs } from '../src/inputs'
import { buildWebhookUrl, triggerWebhook } from '../src/webhook'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const { concourseUrl, concourseTeam, concoursePipeline, pipelineResource, resourceWebhookToken, pipelineVariables } =
  testInputs

describe('When calling buildWebhookUrl', () => {
  describe('given a set of inputs without pipeline variables', () => {
    const inputs: Inputs = {
      concourseUrl,
      concourseTeam,
      concoursePipeline,
      pipelineResource,
      resourceWebhookToken,
      pipelineVariables: {},
    }

    it('returns a URL with the correct pathname', () => {
      const url = buildWebhookUrl(inputs)
      expect(url.pathname).toEqual(
        `/api/v1/teams/${concourseTeam}/pipelines/${concoursePipeline}/resources/${pipelineResource}/check/webhook`
      )
    })

    it('returns a URL with no search params', () => {
      const url = buildWebhookUrl(inputs)
      expect(url.searchParams.toString()).toEqual('')
    })
  })

  describe('given a set of inputs with pipeline variables', () => {
    const inputs: Inputs = {
      concourseUrl,
      concourseTeam,
      concoursePipeline,
      pipelineResource,
      resourceWebhookToken,
      pipelineVariables,
    }

    it('returns a URL with the correct pathname', () => {
      const url = buildWebhookUrl(inputs)
      expect(url.pathname).toEqual(
        `/api/v1/teams/${concourseTeam}/pipelines/${concoursePipeline}/resources/${pipelineResource}/check/webhook`
      )
    })

    it('returns a URL with the pipeline variables as search params', () => {
      const url = buildWebhookUrl(inputs)
      expect(url.searchParams.toString()).toEqual('my-var=my-value')
    })

    it('returns a URL without the webhook token anywhere in it', () => {
      const url = buildWebhookUrl(inputs)
      expect(url.toString()).not.toContain(resourceWebhookToken)
    })
  })
})

describe('When calling triggerWebhook', () => {
  describe('given a webhook url', () => {
    const inputs: Inputs = {
      concourseUrl,
      concourseTeam,
      concoursePipeline,
      pipelineResource,
      resourceWebhookToken,
      pipelineVariables,
    }
    let url: URL

    beforeEach(() => {
      url = buildWebhookUrl(inputs)
    })

    it('makes a POST request with the correct url & params', () => {
      triggerWebhook(url, resourceWebhookToken)

      url.searchParams.append('webhook_token', resourceWebhookToken)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.post).toHaveBeenCalledWith(url.toString())
    })

    describe('when the request fails', () => {
      beforeEach(() => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Request failed'))
      })

      it('throws an error', async () => {
        await expect(triggerWebhook(url, resourceWebhookToken)).rejects.toThrow('Request failed')
      })
    })
  })
})
