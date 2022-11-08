import type { Prisma, Emoji } from '@prisma/client'

import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.EmojiCreateArgs>({
  emoji: {
    one: { data: { name: 'String469015' } },
    two: { data: { name: 'String4860426' } },
  },
})

export type StandardScenario = ScenarioData<Emoji, 'emoji'>
