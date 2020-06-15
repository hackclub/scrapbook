import { sendCommandResponse, accountsTable, getUserRecord } from '../../../../lib/api-utils'

export default async (req, res) => {
  await res.status(200).end()

  const command = req.body
  if (command.text === '') {
    sendCommandResponse(command.response_url, 'You must specify a domain to link to! e.g. `/setdomain scrap.hackhappyvalley.com`')
  } else {
    const user = await getUserRecord(command.user_id)
    await accountsTable.update(user.id, {
      'Custom Domain': command.text
    })
    await fetch(`https://api.vercel.com/v1/QmdYCqhZxcLiKpZcQw7dpcqu5B7rmt2k7BbKmdaq6ojwoS/alias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VC_SCRAPBOOK_TOKEN}`
      },
      body: JSON.stringify({
        domain: command.text
      })
    })
    sendCommandResponse(command.response_url, 'Custom domain `' + command.text + '` set!')
  }
}