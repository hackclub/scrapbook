import type { EmojiType } from '@prisma/client'

import {
  emojiTypes,
  emojiType,
  createEmojiType,
  updateEmojiType,
  deleteEmojiType,
} from './emojiTypes'
import type { StandardScenario } from './emojiTypes.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float and DateTime types.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('emojiTypes', () => {
  scenario('returns all emojiTypes', async (scenario: StandardScenario) => {
    const result = await emojiTypes()

    expect(result.length).toEqual(Object.keys(scenario.emojiType).length)
  })

  scenario('returns a single emojiType', async (scenario: StandardScenario) => {
    const result = await emojiType({ id: scenario.emojiType.one.id })

    expect(result).toEqual(scenario.emojiType.one)
  })

  scenario('creates a emojiType', async () => {
    const result = await createEmojiType({
      input: { name: 'String1652330' },
    })

    expect(result.name).toEqual('String1652330')
  })

  scenario('updates a emojiType', async (scenario: StandardScenario) => {
    const original = (await emojiType({
      id: scenario.emojiType.one.id,
    })) as EmojiType
    const result = await updateEmojiType({
      id: original.id,
      input: { name: 'String88334872' },
    })

    expect(result.name).toEqual('String88334872')
  })

  scenario('deletes a emojiType', async (scenario: StandardScenario) => {
    const original = (await deleteEmojiType({
      id: scenario.emojiType.one.id,
    })) as EmojiType
    const result = await emojiType({ id: original.id })

    expect(result).toEqual(null)
  })
})
