const share = async (data) => {
  try {
    await fetch("https://misguided.enterprises/clubscraps/submit", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    return {ok: true}
  } catch (err) {
    console.log(err)

    return {ok: false, err}
  }
}

export default async (req, res) => {
  // TODO: ensure this is a POST or OPTIONS request
  res.setHeader("Access-Control-Allow-Origin", "*");

  const data = req.body
  res.json(await share(data))
}
