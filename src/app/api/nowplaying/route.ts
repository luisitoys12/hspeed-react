import { NextResponse } from 'next/server';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

// Helper function to get config from Firebase
async function getRadioConfig() {
  return new Promise<any>((resolve, reject) => {
    const configRef = ref(db, 'config');
    onValue(configRef, (snapshot) => {
      resolve(snapshot.val());
    }, {
      onlyOnce: true
    }, (error) => {
      reject(error);
    });
  });
}

export async function GET(request: Request) {
  try {
    const config = await getRadioConfig();
    
    if (!config || !config.apiUrl) {
      return NextResponse.json({ error: 'Radio API URL not configured in Firebase' }, { status: 500 });
    }

    // Append a timestamp to prevent caching issues
    const url = `${config.apiUrl}?_=${new Date().getTime()}`;
    
    const response = await fetch(url, {
      next: { revalidate: 10 } // Cache for 10 seconds
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from radio API' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in /api/nowplaying proxy route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
