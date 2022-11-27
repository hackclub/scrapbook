import type { Emoji } from '@prisma/client'

import { emojis, emoji, createEmoji, updateEmoji, deleteEmoji } from './emojis'
import type { StandardScenario } from './emojis.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float and DateTime types.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('emojis', () => {
  scenario('returns all emojis', async (scenario: StandardScenario) => {
    const result = await emojis()

    expect(result.length).toEqual(Object.keys(scenario.emoji).length)
  })

  scenario('returns a single emoji', async (scenario: StandardScenario) => {
    const result = await emoji({ id: scenario.emoji.one.id })

    expect(result).toEqual(scenario.emoji.one)
  })

  scenario('creates a emoji', async () => {
    const result = await createEmoji({
      input: { name: 'String1652330' },
    })

    expect(result.name).toEqual('String1652330')
  })

  scenario('updates a emoji', async (scenario: StandardScenario) => {
    const original = (await emoji({
      id: scenario.emoji.one.id,
    })) as Emoji
    const result = await updateEmoji({
      id: original.id,
      input: { name: 'String88334872' },
    })

    expect(result.name).toEqual('String88334872')
  })

  scenario('deletes a emoji', async (scenario: StandardScenario) => {
    const original = (await deleteEmoji({
      id: scenario.emoji.one.id,
    })) as Emoji
    const result = await emoji({ id: original.id })

    expect(result).toEqual(null)
  })
})
