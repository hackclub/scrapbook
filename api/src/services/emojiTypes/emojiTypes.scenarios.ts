import type { Prisma, EmojiType } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.EmojiTypeCreateArgs>({
  emojiType: {
    one: { data: { name: 'String469015' } },
    two: { data: { name: 'String4860426' } },
  },
})

export type StandardScenario = ScenarioData<EmojiType, 'emojiType'>
