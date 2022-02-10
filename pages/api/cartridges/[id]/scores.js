const getScoreboard = async ({id}) => {
  // placeholder values while testing
  const data = {
    "U891739": { "user": "n9k", "score": 29 },
    "U6383G7": { "user": "ced", "score": 5 },
  }
  // const url = `https://misguided.enterprises/gamelabscores/${id}`
  // const data = await fetch(url).then(r => r.json())
  const scores = Object.entries(data)
  const sortedScores = scores.sort(([ , a], [ , b]) => b.score - a.score)
  const topScores = sortedScores.splice(0, 3)
  return topScores
}

export default async (req, res) => {
  const scores = await getScoreboard(req.query.id)
  res.json({ scores })
}