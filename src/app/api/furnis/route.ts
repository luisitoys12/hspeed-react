import { NextResponse } from 'next/server';

// This route acts as a proxy to the habbofurni.com API to avoid CORS issues.
export async function GET() {
  try {
    // We fetch the data on the server side
    const response = await fetch('https://habbofurni.com/api/furni?limit=10', {
      next: { revalidate: 3600 } // Cache the response for 1 hour
    });

    if (!response.ok) {
      // If the external API fails, we return an error response
      return NextResponse.json(
        { error: 'Failed to fetch data from HabboFurni API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // We return the successful response to our client
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in /api/furnis proxy route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
