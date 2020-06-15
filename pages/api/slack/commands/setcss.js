import cheerio from 'cheerio'

import {
  sendCommandResponse,
  accountsTable,
  getUserRecord
} from '../../../../lib/api-utils'

export default async (req, res) => {
  await res.status(200).end()
  const command = req.body
  let url = command.text

  if (url === '') {
    sendCommandResponse(
      command.response_url,
      'You must give a URL to a GitHub Gist or CSS file somewhere on the web.'
    )
  } else if (url.includes('gist.github.com')) {
    url = await fetch(url)
      .then(r => r.text())
      .then(async html => {
        console.log(html)
        const $ = cheerio.load(html)
        let raw = $('.file .file-actions a').attr('href')
        if (Array.isArray(raw)) raw = raw[0]
        console.log(raw)
        if (raw.endsWith('.css')) {
          const user = await getUserRecord(command.user_id)
          const githubUrl = 'https://gist.githubusercontent.com' + raw
          await accountsTable.update(user.id, {
            'CSS URL': githubUrl
          })
          sendCommandResponse(
            command.response_url,
            `Your CSS file, ${githubUrl} has been linked to your profile!`
          )
        } else {
          sendCommandResponse(
            command.response_url,
            'You linked a Gist, but there isn’t a .css file on your Gist. Try again with the raw URL to the CSS.'
          )
        }
      })
  } else {
    const user = await getUserRecord(command.user_id)
    if (!url.includes('http')) {
      url = 'https://' + url
    }
    await accountsTable.update(user.id, {
      'CSS URL': url
    })
    sendCommandResponse(
      command.response_url,
      `Your CSS file, ${url} has been linked to your profile!`
    )
  }
}
