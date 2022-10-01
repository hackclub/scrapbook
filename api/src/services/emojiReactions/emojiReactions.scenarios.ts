import type { Prisma, EmojiReaction } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.EmojiReactionCreateArgs>({
  emojiReaction: {
    one: { data: { usersReacted: 'String' } },
    two: { data: { usersReacted: 'String' } },
  },
})

export type StandardScenario = ScenarioData<EmojiReaction, 'emojiReaction'>
