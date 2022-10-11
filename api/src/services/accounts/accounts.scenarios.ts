import type { Prisma, Account } from '@prisma/client'

import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.AccountCreateArgs>({
  account: {
    one: { data: { webring: 'String' } },
    two: { data: { webring: 'String' } },
  },
})

export type StandardScenario = ScenarioData<Account, 'account'>
