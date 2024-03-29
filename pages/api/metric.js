import metrics from "../../metrics";

export default async function pushMetrics(req, res) {
  const { time, metricKey } = req.body;

  if (time) {
    metrics.timing(metricKey, time);
    console.log(metricKey, time);
    return res.json({ success: true });
  }

  console.log("sending metric ", metricKey);
  metrics.increment(metricKey, 1);
  return res.json({ success: true });
}
