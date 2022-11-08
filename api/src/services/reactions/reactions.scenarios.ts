import type { Prisma, Reaction } from '@prisma/client'

import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.ReactionCreateArgs>({
  reaction: {
    one: { data: { accountsReacted: 'String' } },
    two: { data: { accountsReacted: 'String' } },
  },
})

export type StandardScenario = ScenarioData<Reaction, 'reaction'>
