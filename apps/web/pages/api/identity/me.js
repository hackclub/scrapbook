import { NextResponse } from 'next/server';

import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import prisma from '../../../lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only fetch the minimal fields needed - identityToken for auth and isAdmin for bypass logic
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        select: {
            identityToken: true,
        },
    });

    // Check if user has a valid identity token
    if (!user?.identityToken) {
        // Allow admins to bypass identity verification
        if (user?.isAdmin) {
            console.log('Admin user without identity token, returning empty identity data:', session.user.id);
            return NextResponse.json({ 
                verified: false, 
                admin_bypass: true,
                message: 'Admin user - identity verification not required' 
            });
        }
        
        console.log('No identity token found for user:', session.user.id);
        return NextResponse.json({ error: 'Identity token not found. Please complete identity verification.' }, { status: 404 });
    }

    // Strip any path from IDENTITY_URL to get base URL only
    const identityBaseUrl = process.env.IDENTITY_URL?.replace(/\/oauth\/.*$/, '') || 'https://identity.hackclub.com';
    
    const response = await fetch(`${identityBaseUrl}/api/v1/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.identityToken}`,
        },
    });

    if (!response.ok) {
        console.error('Identity service responded with error:', response.status, response.statusText);
        return NextResponse.json({ error: 'Identity service unavailable' }, { status: response.status });
    }

    const data = await response.json();
    
    // Handle undefined identity data
    if (!data.identity) {
        console.error('Identity data is undefined:', data);
        return NextResponse.json({ error: 'Identity data not found' }, { status: 404 });
    }

    try {
        return NextResponse.json(data.identity);
    } catch (error) {
        console.error('JSON serialization error in identity/me:', error);
        console.error('Data causing error:', data.identity);
        
        // Fallback: sanitize the data by removing non-serializable values
        try {
            const sanitizedData = JSON.parse(JSON.stringify(data.identity, (key, value) => {
                // Handle BigInt
                if (typeof value === 'bigint') {
                    return value.toString();
                }
                // Handle Date objects
                if (value instanceof Date) {
                    return value.toISOString();
                }
                // Handle functions
                if (typeof value === 'function') {
                    return undefined;
                }
                return value;
            }));
            
            return NextResponse.json(sanitizedData);
        } catch (fallbackError) {
            console.error('Fallback serialization also failed:', fallbackError);
            return NextResponse.json({ error: 'Unable to serialize identity data' }, { status: 500 });
        }
    }
}