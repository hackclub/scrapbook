import type { Prisma, Update } from '@prisma/client'

import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.UpdateCreateArgs>({
  update: {
    one: {
      data: {
        attachments: 'String',
        muxAssetIDs: 'String',
        muxPlaybackIDs: 'String',
      },
    },
    two: {
      data: {
        attachments: 'String',
        muxAssetIDs: 'String',
        muxPlaybackIDs: 'String',
      },
    },
  },
})

export type StandardScenario = ScenarioData<Update, 'update'>
