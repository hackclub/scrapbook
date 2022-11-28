import { MetaTags } from '@redwoodjs/web'

import UpdatesCell from 'src/components/Update/UpdatesCell'

import FlavourText from 'config/flavour.text.config'

const IndexPage = () => {
  return (
    <>
      <MetaTags title="Index" description="Index page" />
      <div className="py-4 text-black">
        <h2 className="mb-2 text-center font-header text-5xl">
          Welcome to <span className="text-muted">(the beta of)</span>
        </h2>
        <h1 className="text-shadow-2xl mb-2 bg-gradient-to-r from-blue to-green bg-clip-text text-center font-header text-6xl text-transparent">
          Hack Club's Scrapbook
        </h1>
        <div className="mb-3 text-center text-2xl">
          {FlavourText[Math.floor(Math.random() * FlavourText.length)]}
        </div>
      </div>
      <UpdatesCell />
    </>
  )
}

export default IndexPage
