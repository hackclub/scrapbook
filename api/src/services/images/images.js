import { fetch } from 'cross-undici-fetch'

export const getImages = async () => {
  const response = await fetch(
    `https://api2.hackclub.com/v0.1/AssemblePreShow/Images`
  )
  let json = await response.json()
  json = json.map((item) => ({
    Prompt: item['fields']['Prompt'],
    DALLE: item['fields']['DALL-E'].map((x) => x.url),
  }))
  return json
}
