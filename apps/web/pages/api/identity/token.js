import prisma from '../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';

export async function POST(req) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Strip any path from IDENTITY_URL to get base URL only
    const identityBaseUrl = process.env.IDENTITY_URL?.replace(/\/oauth\/.*$/, '') || 'https://identity.hackclub.com';
    
    // ID Service Parameters
    const params = new URLSearchParams({
      code,
      client_id: process.env.IDENTITY_CLIENT_ID || '',
      client_secret: process.env.IDENTITY_CLIENT_SECRET || '',
      redirect_uri: `${process.env.NEXTAUTH_URL}/identity`,
      grant_type: "authorization_code",
    });

    // Exchange code (from url params) for token
    console.log('Exchanging code for token with params:', { code, client_id: process.env.IDENTITY_CLIENT_ID, client_secret: '***', redirect_uri: `${process.env.NEXTAUTH_URL}/identity`, grant_type: 'authorization_code' });
    const tokenUrl = `${identityBaseUrl}/oauth/token`;
    console.log('Token URL:', tokenUrl);
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const responseText = await response.text();
    console.log('Identity OAuth raw response:', response.status, responseText.substring(0, 500));
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Identity OAuth response as JSON:', parseError);
      return NextResponse.json({ 
        error: 'Invalid response from identity service', 
        details: `Status ${response.status}: ${responseText.substring(0, 200)}` 
      }, { status: 500 });
    }
    console.log('Identity OAuth response:', response.status, data);
    
    if (!response.ok) {
      console.error('Identity OAuth error:', data);
      return NextResponse.json({ error: 'Failed to exchange code', details: data }, { status: response.status });
    }
    
    if (!data.access_token) {
      console.error('No access_token in response:', data);
      return NextResponse.json({ error: 'No access token received' }, { status: 500 });
    }
    
    // Update user with token
    await prisma.user.update({
      where: {
        id: session?.user?.id,
      },
      data: {
        identityToken: data.access_token,
      },
    });

    console.log("Successfully stored identity token for user:", session.user.id);
    // Never expose tokens to the client - return success message only
    return NextResponse.json({ success: true, message: 'Identity verification completed' });
  } catch (error) {
    console.error('Identity token exchange error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 