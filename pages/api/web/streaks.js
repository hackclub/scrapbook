export default async (req, res) => {
  await fetch("https://scrappy.hackclub.com/api/streakResetter")
  return res.send("Success!")
}
