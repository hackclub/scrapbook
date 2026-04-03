import { NextResponse } from "next/server";

export async function proxy() {
  // Pass requests through without proxying. The previous implementation
  // refetched API routes via APP_URL, which can recurse and exhaust memory.
  return NextResponse.next();
}

/*
Legacy proxy implementation kept for reference.
We no longer intercept/re-route API requests here now that this path
is not used for log capture.

const createTimeoutPromise = (timeout) => new Promise((resolve) => {
  setTimeout(resolve, timeout);
});

async function sendMetric(hostName, metricKey) {
  fetch(`${hostName}/api/metric`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metricKey }),
  });
}

async function sendTimerMetric(hostName, metricKey, time) {
  fetch(`${hostName}/api/metric`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time, metricKey }),
  });
}

export async function proxy(req) {
  const url = new URL(decodeURIComponent(req.url));
  const HOST_NAME = process.env.APP_URL;

  let _metricName = url.pathname.slice(1).split("/").join("_");
  if (_metricName.includes("users") || _metricName.includes("profiles")) {
    _metricName = _metricName.split("_").slice(0, -1).join("_");
  }

  if (req.url.includes("metric")) return NextResponse.json({ success: true });

  const startTime = new Date().getTime();
  const hasFormData = req.headers.get("Content-Type")?.includes("multipart/form-data");

  const response = await fetch(HOST_NAME + url.pathname, {
    method: req.method,
    headers: req.headers,
    body: hasFormData ? await req.formData() : req.body
  });

  const time = (new Date().getTime()) - startTime;

  Promise.any([
    createTimeoutPromise(150),
    sendTimerMetric(HOST_NAME, _metricName, time),
  ]);

  return new NextResponse(
    hasFormData ? await response.formData() : await response.text(),
    { headers: response.headers, status: response.status }
  );
}
*/

export const config = {
  matcher: [
    '/(api\\/(?!auth|web/profile/edit).*)'
  ]
}
