export default async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    fetch('https://misguided.enterprises/clubscraps/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    })

    res.send(200)
  } catch (err) {
    console.log(err)

    res.send(500)
  }
}
