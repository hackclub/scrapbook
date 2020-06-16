import {
  sendCommandResponse,
  accountsTable,
  getUserRecord
} from '../../../../lib/api-utils'

export default async (req, res) => {
  await res.status(200).end()

  const command = req.body
  if (command.text === '') {
    sendCommandResponse(
      command.response_url,
      'You must specify a domain to link to! e.g. `/setdomain scrap.hackhappyvalley.com`'
    )
  } else {
    const user = await getUserRecord(command.user_id)
    await accountsTable.update(user.id, {
      'Custom Domain': command.text
    })

    const domainCount = await accountsTable.read({
      filterByFormula: `{Custom Domain} != ''`
    }).length

    await fetch(
      `https://api.vercel.com/v1/QmdYCqhZxcLiKpZcQw7dpcqu5B7rmt2k7BbKmdaq6ojwoS/alias`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${VC_SCRAPBOOK_TOKEN}`
        },
        body: JSON.stringify({
          domain: command.text
        })
      }
    ).catch(err => {
      console.log(err)
      if (domainCount > 50) {
        sendCommandResponse(
          command.response_url,
          `Couldn't set your domain. Only 50 custom domains can be added to a project, and 50 people have already added their custom domains. :/`
        )
      }
      sendCommandResponse(
        command.response_url,
        `Sorry, something went wrong setting your domain. Unfortunately you can’t use custom domains if Vercel manages your DNS. Try again with a different domain.`
      )
    })
    sendCommandResponse(
      command.response_url,
      `Custom domain \`${command.text}\` set! You’re one of 50 people who can add a custom domain—there are *${domainCount}* domains spots left.

*Your next step*: create a CNAME record in your DNS provider for your domain and point it to \`cname.vercel-dns.com\`.`
    )
  }
}
