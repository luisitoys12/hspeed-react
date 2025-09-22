import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const hotel = searchParams.get('hotel') || 'es';
  const limit = searchParams.get('limit') || '20';

  const apiUrl = `https://habboassets.com/api/v1/badges?hotel=${hotel}&limit=${limit}`;

  try {
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from HabboAssets API' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in /api/badges proxy route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
