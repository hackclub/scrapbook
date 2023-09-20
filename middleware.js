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
  const cookie = req.headers.get("Cookie");
  const split_url = req.url.split("/");
  const HOST_NAME = split_url.slice(0, 3).join("/");
  let _metricName;
  if (req.url.includes("profile")) {
    _metricName = split_url.slice(3, -1).join("_");
  } else _metricName = split_url.slice(3).join("_");

  // console.log(HOST_NAME, _metricName);

  // skip the /api/metric api endpoint
  if (req.url.includes("metric")) return NextResponse.json({ success: true });

  try {
    let response;
    let time;
    if (req.body) {
      const rawBody = await req.body.getReader().read();
      const body = JSON.parse(Buffer.from(rawBody?.value).toString("utf8"));
      // const reqHeaders = Object.fromEntries(req.headers.entries());

      const startTime = new Date().getTime();
      response = await fetch(req.url, {
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
      response = await fetch(req.url, {
        headers: {
          "Cookie": cookie
        }
      });
      time = (new Date().getTime()) - startTime;
    }

    const data = await response.json();

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

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ msg: "Failed", reason: err });
  }
}

export const config = {
  matcher: [
    '/(api\/(?!auth).*)'
  ]
}
