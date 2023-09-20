import metrics from "../../metrics";

export default async function pushMetrics(req, res) {
  const { time, metricKey } = req.body;
  console.log("sending metric ", metricKey, time);

  metrics.timing(metricKey.split(".")[1], time);
  metrics.increment(metricKey, 1);
  return res.json({ success: true });
}
