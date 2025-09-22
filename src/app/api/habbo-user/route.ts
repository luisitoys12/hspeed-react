import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    // First, get user data to find the uniqueId
    const userResponse = await fetch(`https://www.habbo.es/api/public/users?name=${username}`, {
        next: { revalidate: 600 } // cache for 10 minutes
    });

    if (!userResponse.ok) {
        return NextResponse.json({ error: 'Habbo user not found' }, { status: 404 });
    }
    const userData = await userResponse.json();
    if (!userData.uniqueId) {
        return NextResponse.json({ error: 'Habbo user not found' }, { status: 404 });
    }

    // Then, get profile data using the uniqueId
    const profileResponse = await fetch(`https://www.habbo.es/api/public/users/${userData.uniqueId}/profile`, {
        next: { revalidate: 600 } // cache for 10 minutes
    });

    if (!profileResponse.ok) {
        return NextResponse.json({ error: 'Could not load Habbo user profile' }, { status: 500 });
    }
    const profileData = await profileResponse.json();

    const responseData = {
        user: userData,
        profile: profileData,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in /api/habbo-user proxy route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
