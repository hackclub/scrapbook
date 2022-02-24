function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

export default async function handler(req, res) {
  try {
    await res.unstable_revalidate('/'+replaceAll(req.query.path, '&', '/'))
    return res.json({ revalidated: true })
  } catch (err) {
    return res.status(500).send('Error revalidating')
  }
}
