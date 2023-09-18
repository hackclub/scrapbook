import metrics from "../../metrics";

export default async function pushMetrics(req, res) {
  const { metricKey } = req.body;
  console.log("sending metric ", metricKey);

  metrics.increment(metricKey, 1);
  return res.json({ success: true });
}
