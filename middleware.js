import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

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

  const cookie = req.headers.get("Cookie");
  const HOST_NAME = "http://" + url.host;

  let _metricName = url.pathname.slice(1).split("/").join("_");

  // skip the /api/metric api endpoint
  if (req.url.includes("metric")) return NextResponse.json({ success: true });

  try {
    let response;
    let time;
    if (req.body) {
      const rawBody = await req.body.getReader().read();
      const body = JSON.parse(Buffer.from(rawBody?.value).toString("utf8"));

      const startTime = new Date().getTime();
      response = await fetch(url.href, {
        method: req.method,
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookie
        },
        body: JSON.stringify(body)
      });
      time = (new Date().getTime()) - startTime;

    } else {
      const startTime = new Date().getTime();
      response = await fetch(url.href, {
        headers: {
          "Cookie": cookie
        }
      });
      time = (new Date().getTime()) - startTime;
    }

    const contentType = response.headers.get("content-type")

    let data;
    if (contentType === "application/json") {
      data = await response.json();
    } else {
      data = await response.arrayBuffer();
    }

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
      sendMetric(HOST_NAME, `${response.status}.${_metricName}`),
      sendTimerMetric(HOST_NAME, _metricName, time), // send timing metric
    ])

    return contentType === "application/json" ? NextResponse.json(data) : new NextResponse(data, { headers: { ...response.headers } });
  } catch (err) {
    return NextResponse.json({ msg: "Failed", reason: err });
  }
}

export const config = {
  matcher: [
    '/(api\/(?!auth).*)'
  ]
}
