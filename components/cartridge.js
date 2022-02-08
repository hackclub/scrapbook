import React, { useEffect, useState, useRef } from "react"
import Tilt from 'react-tilt'

const defaultLogo = "https://cloud-dtoqnx6gl-hack-club-bot.vercel.app/0yellow.png"
const loadingLogo = "https://cloud-dtoqnx6gl-hack-club-bot.vercel.app/1loading.gif"

const spriteToImage = (asset) => {
  // from https://github.com/hackclub/gamelab/blob/d3e482167374d9e770fb70b21da94941ad3d38e3/pixel-editor/pixel-editor.js#L516
  const [gridW, gridH] = asset.data.size
  const canvas = document.createElement('canvas')
  canvas.width = gridW
  canvas.height = gridH
  const ctx = canvas.getContext('2d')
  const pixels = new Uint8ClampedArray(
    gridW * gridH * 4
  ).fill(0)
  asset.data.colors.forEach((color, i) => {
    let index = i * 4;
    pixels[index] = color[0];
    pixels[index + 1] = color[1];
    pixels[index + 2] = color[2];
    pixels[index + 3] = color[3];
  })
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  const image = new ImageData(
    pixels,
    gridW,
    gridH,
  )
  ctx.putImageData(image, 0, 0)
  return canvas.toDataURL()
}

const Cartridge = ({id}) => {
  const contentRef = useRef()
  const [status, setStatus] = useState("loading")
  const [cartridge, setCartridge] = useState({})
  const [spriteLogo, setSpriteLogo] = useState(null)

  useEffect(() => {
    if (contentRef) {
      window.VanillaTilt.init(contentRef)
    }
  }, [contentRef])

  useEffect(async () => {
    const url = `https://project-bucket-hackclub.s3.eu-west-1.amazonaws.com/${id}.json`;
    const cartridgeData = await fetch(url, { mode: "cors" }).then((r) => r.json());
    setCartridge(cartridgeData)
    const spriteData = cartridgeData?.assets?.find(asset => {
      return asset?.type == 'sprite' && asset?.name == 'logo'
    })
    if (spriteData) {
      setSpriteLogo(spriteToImage(spriteData))
    }
    setStatus('success')
  }, [id])

  const logo = () => {
    if (status == 'loading') {
      return loadingLogo
    } else if (spriteLogo) {
      return spriteLogo
    } else {
      return defaultLogo
    }
  }

  // based on https://replit.com/@MaxWofford/cartridge-experiment#cartridge/index.html
  return(
    <a href={`https://gamelab.hackclub.com?id=${id}`} target="_blank" className="container">
      <Tilt className="cartridge">
        <div className="arrow">▲</div>
        <div className="content-area">
          <img className="preview" src={logo()} />
          <div className="logo">
            <span>made with:</span>
            <span>gamelab</span>
          </div>
        </div>
      </Tilt>
    </a>
  )
}
export default Cartridge