// Slack expects a very quick response to all webhooks it sends out. This
// function returns quickly back to Slack with status OK and then passes off
// the data sent to us to another serverless function for longer processing.
export default async (req, res) => {
  const { challenge, event } = req.body

  // pass URL setup challenge Slack sends us
  if (challenge) {
    return await res.json({ challenge })
  }

  // respond immediately for slack
  res.json({ ok: true })

  // queue this to start. we don't expect it to finish by the time this
  // function is cancelled
  await fetch(req.headers['x-forwarded-proto'] + '://' + req.headers.host + '/api/slack/processMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Passthrough': 'TRUE - Working around slack, see message.js for source'
    },
    body: JSON.stringify(req.body)
  })
}
