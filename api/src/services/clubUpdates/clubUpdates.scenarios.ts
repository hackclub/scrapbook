import type { Prisma, ClubUpdate } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.ClubUpdateCreateArgs>({
  clubUpdate: {
    one: {
      data: {
        update: {
          create: {
            attachments: 'String',
            muxAssetIDs: 'String',
            muxPlaybackIDs: 'String',
          },
        },
        club: {
          create: { slug: 'String5722067', name: 'String', logo: 'String' },
        },
      },
    },
    two: {
      data: {
        update: {
          create: {
            attachments: 'String',
            muxAssetIDs: 'String',
            muxPlaybackIDs: 'String',
          },
        },
        club: {
          create: { slug: 'String3701588', name: 'String', logo: 'String' },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<ClubUpdate, 'clubUpdate'>
