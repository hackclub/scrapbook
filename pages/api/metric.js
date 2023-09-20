import metrics from "../../metrics";

export default async function pushMetrics(req, res) {
  const { time, metricKey } = req.body;
  console.log("sending metric ", metricKey, time);

  metrics.timing(metricKey, time);
  metrics.increment(metricKey, 1);
  return res.json({ success: true });
}
