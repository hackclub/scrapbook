import type { EmojiReaction } from '@prisma/client'

import {
  emojiReactions,
  emojiReaction,
  createEmojiReaction,
  updateEmojiReaction,
  deleteEmojiReaction,
} from './emojiReactions'
import type { StandardScenario } from './emojiReactions.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float and DateTime types.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('emojiReactions', () => {
  scenario('returns all emojiReactions', async (scenario: StandardScenario) => {
    const result = await emojiReactions()

    expect(result.length).toEqual(Object.keys(scenario.emojiReaction).length)
  })

  scenario(
    'returns a single emojiReaction',
    async (scenario: StandardScenario) => {
      const result = await emojiReaction({ id: scenario.emojiReaction.one.id })

      expect(result).toEqual(scenario.emojiReaction.one)
    }
  )

  scenario('creates a emojiReaction', async () => {
    const result = await createEmojiReaction({
      input: { usersReacted: 'String' },
    })

    expect(result.usersReacted).toEqual('String')
  })

  scenario('updates a emojiReaction', async (scenario: StandardScenario) => {
    const original = (await emojiReaction({
      id: scenario.emojiReaction.one.id,
    })) as EmojiReaction
    const result = await updateEmojiReaction({
      id: original.id,
      input: { usersReacted: 'String2' },
    })

    expect(result.usersReacted).toEqual('String2')
  })

  scenario('deletes a emojiReaction', async (scenario: StandardScenario) => {
    const original = (await deleteEmojiReaction({
      id: scenario.emojiReaction.one.id,
    })) as EmojiReaction
    const result = await emojiReaction({ id: original.id })

    expect(result).toEqual(null)
  })
})
