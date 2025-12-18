import { NextResponse } from 'next/server';

export const runtime = 'edge';

export default function GET(req) {
    const base = process.env.IDENTITY_URL;
    const url = new URL(`${base}oauth/authorize`);

    url.searchParams.append('redirect_uri', process.env.IDENTITY_REDIRECT_URI);
    url.searchParams.append('client_id', process.env.IDENTITY_CLIENT_ID);
    url.searchParams.append('response_type', 'code');

    const responseStr = url.toString() + "&scope=email+openid+profile+name+slack_id+verification_status";
    return new NextResponse(responseStr);
}