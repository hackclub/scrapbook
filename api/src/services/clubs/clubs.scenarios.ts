import type { Prisma, Club } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.ClubCreateArgs>({
  club: {
    one: { data: { slug: 'String429787', name: 'String', logo: 'String' } },
    two: { data: { slug: 'String1178416', name: 'String', logo: 'String' } },
  },
})

export type StandardScenario = ScenarioData<Club, 'club'>
