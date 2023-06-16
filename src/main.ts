import * as core from '@actions/core'
import { getInputs, Inputs } from './inputs'
import { buildWebhookUrl, triggerWebhook } from './webhook'
import { URL } from 'url'

async function run(): Promise<void> {
  try {
    const inputs = getInputs()

    await sendWebhookRequest(inputs)
    core.info('Webhook triggered successfully!')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export const sendWebhookRequest = async (inputs: Inputs): Promise<void> => {
  const webhookUrl = buildWebhookUrl(inputs)

  core.info(`Sending POST request to ${getUrlWithRedactedToken(webhookUrl, inputs.resourceWebhookToken)}`)

  await triggerWebhook(webhookUrl, inputs.resourceWebhookToken)
}

const getUrlWithRedactedToken = (url: URL, webhookToken: string): string => {
  const urlWithRedactedToken = new URL(url.toString())
  const redactedToken = webhookToken.replace(/./g, '*')
  urlWithRedactedToken.searchParams.append('webhook_token', redactedToken)
  return urlWithRedactedToken.toString()
}

run()
