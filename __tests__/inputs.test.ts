import { describe, expect, it, beforeEach } from '@jest/globals'
import ActionRunner from './action_runner'
import { getInputs } from '../src/inputs'

describe('getInputs', () => {
  const actionRunner = new ActionRunner()

  describe('when no action inputs provided', () => {
    it('fails for missing concourse-url input', async () => {
      await actionRunner.call(async () => {
        expect(() => getInputs()).toThrow(new Error('Input required and not supplied: concourse-url'))
      })
    })
  })

  describe('when concourse-url action input is provided', () => {
    const concourseUrl = 'https://concourse.example.com'

    beforeEach(() => actionRunner.setInput('concourse-url', concourseUrl))

    it('fails for missing concourse-team input', async () => {
      await actionRunner.call(async () => {
        expect(() => getInputs()).toThrow(new Error('Input required and not supplied: concourse-team'))
      })
    })

    describe('when concourse-team action input is provided', () => {
      const concourseTeam = 'my-team'

      beforeEach(() => actionRunner.setInput('concourse-team', concourseTeam))

      it('fails for missing concourse-pipeline input', async () => {
        await actionRunner.call(async () => {
          expect(() => getInputs()).toThrow(new Error('Input required and not supplied: concourse-pipeline'))
        })
      })

      describe('when concourse-pipeline action input is provided', () => {
        const concoursePipeline = 'my-pipeline'

        beforeEach(() => actionRunner.setInput('concourse-pipeline', concoursePipeline))

        it('fails for missing pipeline-resource input', async () => {
          await actionRunner.call(async () => {
            expect(() => getInputs()).toThrow(new Error('Input required and not supplied: pipeline-resource'))
          })
        })

        describe('when pipeline-resource action input is provided', () => {
          const pipelineResource = 'my-resource'

          beforeEach(() => actionRunner.setInput('pipeline-resource', pipelineResource))

          it('fails for missing resource-webhook-token input', async () => {
            await actionRunner.call(async () => {
              expect(() => getInputs()).toThrow(new Error('Input required and not supplied: resource-webhook-token'))
            })
          })

          describe('when resource-webhook-token action input is provided', () => {
            const resourceWebhookToken = 'my-token'

            beforeEach(() => actionRunner.setInput('resource-webhook-token', resourceWebhookToken))

            it('returns Inputs object with all required inputs', async () => {
              await actionRunner.call(async () => {
                const inputs = getInputs()
                expect(inputs).toEqual({
                  concourseUrl,
                  concourseTeam,
                  concoursePipeline,
                  pipelineResource,
                  resourceWebhookToken,
                  pipelineVariables: {},
                })
              })
            })

            describe('when pipeline-variables action input is a string', () => {
              beforeEach(() => actionRunner.setInput('pipeline-variables', 'not an object'))

              it('fails with an error', async () => {
                await actionRunner.call(async () => {
                  expect(() => getInputs()).toThrow(new Error('Input pipeline-variables must be a JSON object'))
                })
              })
            })

            describe('when pipeline-variables action input is a number', () => {
              beforeEach(() => actionRunner.setInput('pipeline-variables', 123))

              it('fails with an error', async () => {
                await actionRunner.call(async () => {
                  expect(() => getInputs()).toThrow(new Error('Input pipeline-variables must be a JSON object'))
                })
              })
            })

            describe('when pipeline-variables action input is an array', () => {
              beforeEach(() => actionRunner.setInput('pipeline-variables', ['not an object']))

              it('fails with an error', async () => {
                await actionRunner.call(async () => {
                  expect(() => getInputs()).toThrow(new Error('Input pipeline-variables must be a JSON object'))
                })
              })
            })

            describe('when pipeline-variables action input is an object', () => {
              const pipelineVariables = {
                'my-var': 'my-val',
              }

              beforeEach(() => actionRunner.setInput('pipeline-variables', pipelineVariables))

              it('returns Inputs object with all required inputs', async () => {
                await actionRunner.call(async () => {
                  const inputs = getInputs()
                  expect(inputs).toEqual({
                    concourseUrl,
                    concourseTeam,
                    concoursePipeline,
                    pipelineResource,
                    resourceWebhookToken,
                    pipelineVariables,
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})
