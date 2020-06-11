export default async (req, res) => {
  const { url } = req.query
  if (!url) res.status(400).json({ status: 400, error: 'url query param required' })
  const css = await fetch(url).then(r => r.text())
  res.setHeader('Content-Type', 'text/css')
  res.send(css)
}
