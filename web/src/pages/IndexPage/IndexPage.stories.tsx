import type { ComponentMeta } from '@storybook/react'

import IndexPage from './IndexPage'

export const generated = () => {
  return <IndexPage />
}

export default {
  title: 'Pages/IndexPage',
  component: IndexPage,
} as ComponentMeta<typeof IndexPage>
