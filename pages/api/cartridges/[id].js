export const getCartridge = async id => {
  const url = `https://project-bucket-hackclub.s3.eu-west-1.amazonaws.com/${id}.json`;
  const cartridgeData = await fetch(url).then(r => r.json())
  const cartridge = {}
  cartridge.name = cartridgeData.name
  cartridge.version = cartridgeData.version


  const spriteData = cartridgeData?.assets?.find(asset => (
    asset?.type == 'sprite' && asset?.name == 'logo'
  ))
  console.log({spriteData})
  if (spriteData) {
    cartridge.logo = spriteData
  }

  return cartridge
}

export default async (req, res) => {
  const {name, version, logo} = await getCartridge(req.query.id)
  res.json({ name, version, logo })
}