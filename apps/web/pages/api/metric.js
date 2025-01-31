import metrics from "../../metrics";

export default async function pushMetrics(req, res) {
  const { time, metricKey } = req.body;

  if (time) {
    metrics.timing(metricKey, time);
    return res.json({ success: true });
  }

  metrics.increment(metricKey, 1);
  return res.json({ success: true });
}
