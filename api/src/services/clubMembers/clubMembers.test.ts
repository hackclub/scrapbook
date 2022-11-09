import type { ClubMember } from '@prisma/client'

import {
  clubMembers,
  clubMember,
  createClubMember,
  updateClubMember,
  deleteClubMember,
} from './clubMembers'
import type { StandardScenario } from './clubMembers.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float and DateTime types.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('clubMembers', () => {
  scenario('returns all clubMembers', async (scenario: StandardScenario) => {
    const result = await clubMembers()

    expect(result.length).toEqual(Object.keys(scenario.clubMember).length)
  })

  scenario(
    'returns a single clubMember',
    async (scenario: StandardScenario) => {
      const result = await clubMember({ id: scenario.clubMember.one.id })

      expect(result).toEqual(scenario.clubMember.one)
    }
  )

  scenario('creates a clubMember', async (scenario: StandardScenario) => {
    const result = await createClubMember({
      input: {
        accountId: scenario.clubMember.two.accountId,
        clubId: scenario.clubMember.two.clubId,
      },
    })

    expect(result.accountId).toEqual(scenario.clubMember.two.accountId)
    expect(result.clubId).toEqual(scenario.clubMember.two.clubId)
  })

  scenario('updates a clubMember', async (scenario: StandardScenario) => {
    const original = (await clubMember({
      id: scenario.clubMember.one.id,
    })) as ClubMember
    const result = await updateClubMember({
      id: original.id,
      input: { accountId: scenario.clubMember.two.accountId },
    })

    expect(result.accountId).toEqual(scenario.clubMember.two.accountId)
  })

  scenario('deletes a clubMember', async (scenario: StandardScenario) => {
    const original = (await deleteClubMember({
      id: scenario.clubMember.one.id,
    })) as ClubMember
    const result = await clubMember({ id: original.id })

    expect(result).toEqual(null)
  })
})
