import { render } from '@redwoodjs/testing/web'

import IndexPage from './IndexPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('IndexPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<IndexPage />)
    }).not.toThrow()
  })
})
