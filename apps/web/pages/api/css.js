export default async (req, res) => {
  const { url } = req.query;
  if (!url)
    return res
      .status(400)
      .json({ status: 400, error: 'url query param required' })
  const css = await fetch(url).then(r => r.text())
  if (!css)
    return res
      .status(500)
      .json({ status: 500, error: 'Could not download CSS' })

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=604800'
  )
  res.send(css)
}
