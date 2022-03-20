import { App, ExpressReceiver } from '@slack/bolt'
import { Readable } from 'stream'
const share = async req => {
  const data = JSON.parse(req.body)
  const official = new URL(
    await fetch('https://hack.af/share').then(res => res.url)
  ).origin

  const channel = req.headers.origin === official ? 'C01504DCLVD' : 'C0P5NE354'

  /* okay sweet, let's post the request body in slack */
  const { email, name, link, image, description } = data
  console.log(email, name, link, description, channel)

  const receiver = new ExpressReceiver({
    signingSecret: process.env.CLUBSCRAPS_SIGNING_SECRET
  })

  const app = new App({ token: process.env.CLUBSCRAPS_BOT_TOKEN, receiver })

  const { ok, error } = await app.client.files.upload({
    channels: channel,
    file: Readable.from(Buffer.from(image.split(',')[1] ?? '', 'base64')),
    tile: 'Image',
    filename: 'image.png',
    filetype: 'png',
    initial_comment:
      `${name} wants to share their project with the community!` +
      '\n\n' +
      description +
      '\n\n' +
      link
  })

  return { ok, error }
}

export default async (req, res) => {
  // TODO: ensure this is a POST or OPTIONS request
  res.setHeader('Access-Control-Allow-Origin', '*')

  res.json(await share(req))
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb'
    }
  }
}
