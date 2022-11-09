import type { Prisma, ClubMember } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.ClubMemberCreateArgs>({
  clubMember: {
    one: {
      data: {
        account: { create: { webring: 'String' } },
        club: {
          create: { slug: 'String7192807', name: 'String', logo: 'String' },
        },
      },
    },
    two: {
      data: {
        account: { create: { webring: 'String' } },
        club: {
          create: { slug: 'String2623307', name: 'String', logo: 'String' },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<ClubMember, 'clubMember'>
