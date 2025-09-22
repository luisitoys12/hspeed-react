import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const hotel = searchParams.get('hotel') || 'es';

  const apiUrl = `https://puhekupla.com/api/v1/campaigns?hotel=${hotel}`;

  try {
    const response = await fetch(apiUrl, {
       headers: {
        'X-Puhekupla-APIKey': 'demo-habbospeed'
       },
       next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from Puhekupla API' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in /api/campaigns proxy route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
