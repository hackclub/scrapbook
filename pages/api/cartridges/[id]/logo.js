import { getCartridge } from '.'

export default async (req, res) => {
  const cartridge = await getCartridge(req.query.id)

  const sprites = cartridge?.assets?.filter(asset => asset?.type == 'sprite')
  const spriteData = sprites.find(asset => asset?.name == 'logo') || sprites[0]

  if (spriteData) {
    res.send(spriteData)
  } else {
    res.send({})
  }
}
