import { getCartridge } from "."

export default async (req, res) => {
  const cartridge = await getCartridge(req.query.id)
  
  const spriteData = cartridge?.assets?.find(asset => (
    asset?.type == 'sprite' && asset?.name == 'logo'
  ))

  if (spriteData) {
    res.send(spriteData)
  } else {
    res.send({})
  }
}