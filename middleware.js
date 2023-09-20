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
    if (req.body) {
      const rawBody = await req.body.getReader().read();
      const body = JSON.parse(Buffer.from(rawBody?.value).toString("utf8"));
      // const reqHeaders = Object.fromEntries(req.headers.entries());

      response = await fetch(req.url, {
        method: req.method,
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookie
        },
        body: JSON.stringify(body)
      });

    } else {
      response = await fetch(req.url, {
        headers: {
          "Cookie": cookie
        }
      });
    }

    const data = await response.json();

    // attempt to send metric
    // will timeout after 150ms
    Promise.any([createTimeoutPromise(150), sendMetric(HOST_NAME, `${response.status}.${_metricName}`)])

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
