import axios from 'axios'
import * as core from '@actions/core'
import { URL } from 'url'
import { Inputs } from './inputs'

export const triggerWebhook = async (url: URL, webhookToken: string): Promise<void> => {
  const urlWithToken = new URL(url.toString())
  urlWithToken.searchParams.append('webhook_token', webhookToken)

  core.info(`Sending POST request to ${getUrlWithRedactedToken(url, webhookToken)}`)

  await axios.post(urlWithToken.toString())
  core.info('Webhook triggered successfully!')
}

const getUrlWithRedactedToken = (url: URL, webhookToken: string): string => {
  const urlWithRedactedToken = new URL(url.toString())
  const redactedToken = webhookToken.replace(/./g, '*')
  urlWithRedactedToken.searchParams.append('webhook_token', redactedToken)
  return urlWithRedactedToken.toString()
}

export const buildWebhookUrl = (inputs: Inputs): URL => {
  const url = new URL(inputs.concourseUrl)
  url.pathname = `/api/v1/teams/${inputs.concourseTeam}/pipelines/${inputs.concoursePipeline}/resources/${inputs.pipelineResource}/check/webhook`
  for (const [key, value] of Object.entries(inputs.pipelineVariables)) {
    url.searchParams.append(key, value.toString())
  }
  return url
}
