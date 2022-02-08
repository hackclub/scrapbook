import React from 'react'
import Cartridge from './cartridge'
const Cartridges = ({text}) => {
  const gamelabLinkRegex = /https:\/\/gamelab\.hackclub\.com[\-A-Za-z0-9+&@#\/%?=~_|$!:,.;]*/g
  const detectedLinks = text.match(gamelabLinkRegex) || []
  const detectedIDs = detectedLinks.map(url => {
    const parsedURL = new URL(url)
    const search = new URLSearchParams(parsedURL.search);
    const id = search.get('id');
    return id
  }).filter(id => id)

  return (
    <>
      {detectedIDs.map((id, i) => (
        <Cartridge id={id} key={id} />
      ))}
    </>
  )
}
export default Cartridges