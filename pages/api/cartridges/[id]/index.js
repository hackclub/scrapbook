export const getCartridge = async id => {
  const url = `https://project-bucket-hackclub.s3.eu-west-1.amazonaws.com/${id}.json`;
  const cartridge = await fetch(url).then(r => r.json())
  return cartridge
}

export default async (req, res) => {
  const {name, version} = await getCartridge(req.query.id)
  res.json({ name, version })
}