import type { ClubUpdate } from '@prisma/client'

import {
  clubUpdates,
  clubUpdate,
  createClubUpdate,
  updateClubUpdate,
  deleteClubUpdate,
} from './clubUpdates'
import type { StandardScenario } from './clubUpdates.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float and DateTime types.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('clubUpdates', () => {
  scenario('returns all clubUpdates', async (scenario: StandardScenario) => {
    const result = await clubUpdates()

    expect(result.length).toEqual(Object.keys(scenario.clubUpdate).length)
  })

  scenario(
    'returns a single clubUpdate',
    async (scenario: StandardScenario) => {
      const result = await clubUpdate({ id: scenario.clubUpdate.one.id })

      expect(result).toEqual(scenario.clubUpdate.one)
    }
  )

  scenario('creates a clubUpdate', async (scenario: StandardScenario) => {
    const result = await createClubUpdate({
      input: {
        updateId: scenario.clubUpdate.two.updateId,
        clubId: scenario.clubUpdate.two.clubId,
      },
    })

    expect(result.updateId).toEqual(scenario.clubUpdate.two.updateId)
    expect(result.clubId).toEqual(scenario.clubUpdate.two.clubId)
  })

  scenario('updates a clubUpdate', async (scenario: StandardScenario) => {
    const original = (await clubUpdate({
      id: scenario.clubUpdate.one.id,
    })) as ClubUpdate
    const result = await updateClubUpdate({
      id: original.id,
      input: { updateId: scenario.clubUpdate.two.updateId },
    })

    expect(result.updateId).toEqual(scenario.clubUpdate.two.updateId)
  })

  scenario('deletes a clubUpdate', async (scenario: StandardScenario) => {
    const original = (await deleteClubUpdate({
      id: scenario.clubUpdate.one.id,
    })) as ClubUpdate
    const result = await clubUpdate({ id: original.id })

    expect(result).toEqual(null)
  })
})
