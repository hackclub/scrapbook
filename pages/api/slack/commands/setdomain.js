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
    sendCommandResponse(command.response_url, 'Custom domain `' + command.text + '` set!')
  }
}