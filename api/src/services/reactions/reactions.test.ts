import type { Reaction } from '@prisma/client'

import {
  reactions,
  reaction,
  createReaction,
  updateReaction,
  deleteReaction,
} from './reactions'
import type { StandardScenario } from './reactions.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float and DateTime types.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('reactions', () => {
  scenario('returns all reactions', async (scenario: StandardScenario) => {
    const result = await reactions()

    expect(result.length).toEqual(Object.keys(scenario.reaction).length)
  })

  scenario('returns a single reaction', async (scenario: StandardScenario) => {
    const result = await reaction({ id: scenario.reaction.one.id })

    expect(result).toEqual(scenario.reaction.one)
  })

  scenario('creates a reaction', async () => {
    const result = await createReaction({
      input: { accountsReacted: 'String' },
    })

    expect(result.accountsReacted).toEqual('String')
  })

  scenario('updates a reaction', async (scenario: StandardScenario) => {
    const original = (await reaction({
      id: scenario.reaction.one.id,
    })) as Reaction
    const result = await updateReaction({
      id: original.id,
      input: { accountsReacted: 'String2' },
    })

    expect(result.accountsReacted).toEqual('String2')
  })

  scenario('deletes a reaction', async (scenario: StandardScenario) => {
    const original = (await deleteReaction({
      id: scenario.reaction.one.id,
    })) as Reaction
    const result = await reaction({ id: original.id })

    expect(result).toEqual(null)
  })
})
