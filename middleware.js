import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

export async function middleware(req) {
  // just lazing...
  const cookie = req.headers.get("Cookie");
  console.log(req.url, req.method);
  if (req.body) {
    const rawBody = await req.body.getReader().read();
    const body = JSON.parse(Buffer.from(rawBody?.value).toString("utf8"));
    // const reqHeaders = Object.fromEntries(req.headers.entries());

    try {
      const response = await fetch(req.url, {
        method: req.method,
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookie
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      console.log(req.url, "from middleware");
      return NextResponse.json({ ...data, status: response.status });
    } catch (err) {
      return NextResponse.json({ msg: "Failed", reason: err });
    }
  } else {
    try {
      const response = await fetch(req.url, { headers: {
        "Cookie": cookie
      }});
      const data = await response.json();

      console.log(req.url, "from middleware");

      return NextResponse.json({ ...data, status: response.status });
    } catch (err) {
      return NextResponse.json({ msg: "Failed", reason: err });
    }
  }

  /*
    
  */
}

export const config = {
  matcher: '/api/:function*'
}
