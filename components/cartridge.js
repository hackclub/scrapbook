import React, { useEffect, useState } from 'react'
import Tilt from 'react-tilt'

const defaultLogo =
  'https://cloud-dtoqnx6gl-hack-club-bot.vercel.app/0yellow.png'
const loadingLogo =
  'https://cloud-dtoqnx6gl-hack-club-bot.vercel.app/1loading.gif'

const spriteToImage = asset => {
  // from https://github.com/hackclub/gamelab/blob/d3e482167374d9e770fb70b21da94941ad3d38e3/pixel-editor/pixel-editor.js#L516
  const [gridW, gridH] = asset.data.size
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(gridW, gridH)
  canvas.height = Math.max(gridW, gridH)
  const ctx = canvas.getContext('2d')
  const pixels = new Uint8ClampedArray(gridW * gridH * 4).fill(0)
  asset.data.colors.forEach((color, i) => {
    let index = i * 4
    pixels[index] = color[0]
    pixels[index + 1] = color[1]
    pixels[index + 2] = color[2]
    pixels[index + 3] = color[3]
  })
  ctx.webkitImageSmoothingEnabled = false
  ctx.mozImageSmoothingEnabled = false
  ctx.imageSmoothingEnabled = false
  const image = new ImageData(pixels, gridW, gridH)
  ctx.putImageData(image, 0, 0)
  return canvas.toDataURL()
}

const Cartridge = ({ id }) => {
  const [status, setStatus] = useState('loading')
  const [spriteLogo, setSpriteLogo] = useState(null)
  const [version, setVersion] = useState('-')
  const [name, setName] = useState('gamelab')
  const [scores, setScores] = useState([])

  useEffect(() => {
    let isMounted = true
    fetch(`/api/cartridges/${id}/scores`)
      .then(r => r.json())
      .then(s => {
        if (isMounted) {
          setScores(s)
        }
      })
      .catch(e => {
        console.log(e)
      })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    try {
      fetch(`/api/cartridges/${id.trim()}/logo`)
        .then(r => r.json())
        .then(logo => {
          if (isMounted && Object.keys(logo).length > 0) {
            setStatus('success')
            setSpriteLogo(logo)
          }
        })
        .catch(e => {
          console.log(e)
        })
    } catch (e) {
      if (isMounted) {
        setStatus('failed')
      }
    }
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    try {
      fetch(`/api/cartridges/${id.trim()}/`)
        .then(r => r.json())
        .then(cartridge => {
          if (isMounted) {
            setStatus('success')
            setVersion(cartridge.version)
            setName(cartridge.name)
          }
        })
    } catch (e) {
      if (isMounted) {
        setStatus('failed')
      }
    }
    return () => {
      isMounted = false
    }
  }, [])

  const logo = () => {
    if (status == 'loading') {
      return loadingLogo
    } else if (spriteLogo) {
      return spriteToImage(spriteLogo)
    } else {
      return defaultLogo
    }
  }

  // based on https://replit.com/@MaxWofford/cartridge-experiment#cartridge/index.html
  return (
    <a
      href={`https://gamelab.hackclub.com?id=${id}`}
      target="_blank"
      className="cartridge-container"
    >
      <Tilt className="cartridge" options={{ max: 10 }}>
        <div className="arrow">▲</div>
        <div className="content-area">
          <div className="header">
            <div className="name">{name}</div>
            <div className="play"></div>
          </div>
          <img className="preview" src={logo()} />
          <div className="logo">
            <span>made with:</span>
            <span>gamelab</span>
          </div>
        </div>
        <div className="version">{version}</div>
      </Tilt>
    </a>
  )
}
export default Cartridge
