import { NextResponse, NextRequest } from "next/server";
import { Buffer } from "node:buffer";

export async function middleware(req: NextRequest) {
  // just lazing...
  console.log(req.url, req.method, req.body);
  /*
  const rawBody = await req.body?.getReader().read();
  const body = JSON.parse(Buffer.from(rawBody?.value).toString("utf8"));
  const reqHeaders = Object.fromEntries(req.headers.entries());

  console.log(req.url, body, req.method, reqHeaders);
  try {
    const response = await fetch(req.url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log(req.url, "from middleware");
    return NextResponse.json({ ...data, status: response.status });
  } catch (err) {
    return NextResponse.json({ msg: "Failed", reason: err });
  }

  */
}

export const config = {
  matcher: '/api/:function*'
}