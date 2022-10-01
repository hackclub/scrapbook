import type { Update } from '@prisma/client'

import {
  updates,
  update,
  createUpdate,
  updateUpdate,
  deleteUpdate,
} from './updates'
import type { StandardScenario } from './updates.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float and DateTime types.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('updates', () => {
  scenario('returns all updates', async (scenario: StandardScenario) => {
    const result = await updates()

    expect(result.length).toEqual(Object.keys(scenario.update).length)
  })

  scenario('returns a single update', async (scenario: StandardScenario) => {
    const result = await update({ id: scenario.update.one.id })

    expect(result).toEqual(scenario.update.one)
  })

  scenario('creates a update', async () => {
    const result = await createUpdate({
      input: {
        attachments: 'String',
        muxAssetIDs: 'String',
        muxPlaybackIDs: 'String',
      },
    })

    expect(result.attachments).toEqual('String')
    expect(result.muxAssetIDs).toEqual('String')
    expect(result.muxPlaybackIDs).toEqual('String')
  })

  scenario('updates a update', async (scenario: StandardScenario) => {
    const original = (await update({ id: scenario.update.one.id })) as Update
    const result = await updateUpdate({
      id: original.id,
      input: { attachments: 'String2' },
    })

    expect(result.attachments).toEqual('String2')
  })

  scenario('deletes a update', async (scenario: StandardScenario) => {
    const original = (await deleteUpdate({
      id: scenario.update.one.id,
    })) as Update
    const result = await update({ id: original.id })

    expect(result).toEqual(null)
  })
})
