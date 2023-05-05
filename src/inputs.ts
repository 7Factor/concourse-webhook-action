import * as core from '@actions/core'

export interface Inputs {
  concourseUrl: string
  concourseTeam: string
  concoursePipeline: string
  pipelineResource: string
  resourceWebhookToken: string
  pipelineVariables: Object
}

export const getInputs = (): Inputs => {
  const concourseUrl = core.getInput('concourse-url', { required: true })
  const concourseTeam = core.getInput('concourse-team', { required: true })
  const concoursePipeline = core.getInput('concourse-pipeline', { required: true })
  const pipelineResource = core.getInput('pipeline-resource', { required: true })
  const resourceWebhookToken = core.getInput('resource-webhook-token', { required: true })

  return {
    concourseUrl,
    concourseTeam,
    concoursePipeline,
    pipelineResource,
    resourceWebhookToken,
    pipelineVariables: getPipelineVariables(),
  }
}

const getPipelineVariables = (): {} => {
  let pipelineVariables = {}
  try {
    pipelineVariables = JSON.parse(core.getInput('pipeline-variables') || '{}')
  } catch (error) {
    throwPipelineVariableError()
  }

  // Check that pipelineVariables is an object or throw error
  if (typeof pipelineVariables !== 'object' || Array.isArray(pipelineVariables)) {
    throwPipelineVariableError()
  }

  return pipelineVariables
}

const throwPipelineVariableError = (): never => {
  throw new Error('Input pipeline-variables must be a JSON object')
}
