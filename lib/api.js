export const allowAllOrigins = res => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  return res
}
