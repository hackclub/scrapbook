import React from 'react'
import Cartridge from './cartridge'
const Cartridges = ({text}) => {
  const gamelabLinkRegex = /https:\/\/gamelab\.hackclub\.com[\-A-Za-z0-9+&@#\/%?=~_|$!:,.;]*/g
  const detectedIDs = text.match(gamelabLinkRegex).map(url => {
    const parsedURL = new URL(url)
    const search = new URLSearchParams(parsedURL.search);
    const id = search.get('id');
    return id
  }).filter(id => id)
  console.log(detectedIDs)

  return (
    <>
      {detectedIDs.map((id, i) => (
        <Cartridge id={id} key={id} />
      ))}
    </>
  )
}
export default Cartridges