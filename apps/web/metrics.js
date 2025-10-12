import StatsD from "node-statsd";

const environment = process.env.NODE_ENV || "development";
const graphite = process.env.GRAPHITE_HOST;

// Provide a no-op metrics client when Graphite is not configured,
// so builds and local dev do not fail.
const noopMetrics = {
  timing: () => {},
  increment: () => {}
};

let metricsClient;
if (graphite && graphite.length > 0) {
  metricsClient = new StatsD({
    host: graphite,
    port: 8125,
    prefix: `${environment}.scrapbook.`
  });
} else {
  metricsClient = noopMetrics;
}

export default metricsClient;
