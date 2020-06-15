// wait specified ms
function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

// Slack expects a very quick response to all webhooks it sends out. This
// function returns quickly back to Slack with status OK and then passes off
// the data sent to us to another serverless function for longer processing.
export default async (req, res) => {
  const { command } = req.body

  //                v- should be http or https, fallback to http just in case
  const protocol = (req.headers['x-forwarded-proto'] || 'http') + '://'
  const backendUrl = protocol + req.headers.host + `/api/slack/${command.text}`

  // queue this to start. we don't expect it to finish by the time this
  // function is cancelled
  const backendReq = fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Passthrough': 'TRUE - Working around slack, see message.js for source'
    },
    body: JSON.stringify(req.body)
  })

  // give the above function a little time to get going
  await wait(500)

  // respond for slack
  res.json({ ok: true })

  // wait for function to finish
  await backendReq
}
