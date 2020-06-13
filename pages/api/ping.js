export default async (req, res) => {
  fetch('https://f181381699b5.ngrok.io/test.txt').then(r => r.json())
}