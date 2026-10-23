import metrics from '../../metrics'

export default async function pushMetrics(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }
  const { time, metricKey } = req.body || {}
  if (
    typeof metricKey !== 'string' ||
    !/^[a-zA-Z0-9_.-]{1,100}$/.test(metricKey) ||
    (time != null &&
      (typeof time !== 'number' ||
        !Number.isFinite(time) ||
        time < 0 ||
        time > 60000))
  )
    return res.status(400).json({ error: true })

  if (time) {
    metrics.timing(metricKey, time)
    return res.json({ success: true })
  }

  metrics.increment(metricKey, 1)
  return res.json({ success: true })
}
