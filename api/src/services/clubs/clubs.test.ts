import type { Club } from '@prisma/client'

import {
  clubs,
  club,
  createClub,
  updateClub,
  deleteClub,
} from './clubs'
import type { StandardScenario } from './clubs.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float and DateTime types.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('clubs', () => {
  scenario('returns all clubs', async (scenario: StandardScenario) => {
    const result = await clubs()

    expect(result.length).toEqual(Object.keys(scenario.club).length)
  })

  scenario('returns a single club', async (scenario: StandardScenario) => {
    const result = await club({ id: scenario.club.one.id })

    expect(result).toEqual(scenario.club.one)
  })

  scenario('creates a club', async () => {
    const result = await createClub({
      input: { slug: 'String9816484', name: 'String', logo: 'String' },
    })

    expect(result.slug).toEqual('String9816484')
    expect(result.name).toEqual('String')
    expect(result.logo).toEqual('String')
  })

  scenario('updates a club', async (scenario: StandardScenario) => {
    const original = (await club({ id: scenario.club.one.id })) as Club
    const result = await updateClub({
      id: original.id,
      input: { slug: 'String34017502' },
    })

    expect(result.slug).toEqual('String34017502')
  })

  scenario('deletes a club', async (scenario: StandardScenario) => {
    const original = (await deleteClub({ id: scenario.club.one.id })) as Club
    const result = await club({ id: original.id })

    expect(result).toEqual(null)
  })
})
