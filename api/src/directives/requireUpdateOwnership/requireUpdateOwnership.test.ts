import { mockRedwoodDirective, getDirectiveName } from '@redwoodjs/testing/api'

import requireUpdateOwnership from './requireUpdateOwnership'

describe('requireUpdateOwnership directive', () => {
  it('declares the directive sdl as schema, with the correct name', () => {
    expect(requireUpdateOwnership.schema).toBeTruthy()
    expect(getDirectiveName(requireUpdateOwnership.schema)).toBe('requireUpdateOwnership')
  })

  it('requireUpdateOwnership has stub implementation. Should not throw when current user', () => {
    // If you want to set values in context, pass it through e.g.
    // mockRedwoodDirective(requireUpdateOwnership, { context: { currentUser: { id: 1, name: 'Lebron McGretzky' } }})
    const mockExecution = mockRedwoodDirective(requireUpdateOwnership, { context: {} })

    expect(mockExecution).not.toThrowError()
  })
})
