import { NextResponse } from "next/server";

const createTimeoutPromise = (timeout) => new Promise((resolve) => {
  setTimeout(resolve, timeout);
});

async function sendMetric(hostName, metricKey) {
  fetch(`${hostName}/api/metric`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ metricKey }),
  });
}

async function sendTimerMetric(hostName, metricKey, time) {
  fetch(`${hostName}/api/metric`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ time, metricKey }),
  });
}

export async function middleware(req) {
  const url = new URL(decodeURIComponent(req.url));

  const HOST_NAME = "http://" + url.host;

  let _metricName = url.pathname.slice(1).split("/").join("_");

  if (_metricName.includes("users") || _metricName.includes("profiles")) {
    // strip away specific user/profile names in the metric key
    _metricName = _metricName.split("_").slice(0, -1).join("_");
  }

  // skip the /api/metric api endpoint
  if (req.url.includes("metric")) return NextResponse.json({ success: true });

  const startTime = new Date().getTime();
  const hasFormData = req.headers.get("Content-Type")?.includes("multipart/form-data");

  const response = await fetch(req.url, {
    method: req.method,
    headers: req.headers,
    body: hasFormData ? await req.formData() : req.body
  });

  const time = (new Date().getTime()) - startTime;

  // attempt to send metric counter
  // and timer metric
  // ...will timeout after 150ms
  //
  /* sending metrics is dispatched to /api/metrics because next.js middleware
  * is based off edge-runtime which has limited support for node APIs (see: https://nextjs.org/docs/app/api-reference/edge),
  * including UDP which node-statsd requires
  */
  Promise.any([
    createTimeoutPromise(150),
    // sendMetric(HOST_NAME, `${response.status}.${_metricName}`),
    sendTimerMetric(HOST_NAME, _metricName, time), // send timing metric
  ])

  return new NextResponse(hasFormData ? await response.formData() : await response.text(), { headers: response.headers, status: response.status });
}

export const config = {
  matcher: [
    '/(api\/(?!auth|web/profile/edit).*)'
  ]
}