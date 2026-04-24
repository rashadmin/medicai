import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, radius = 5000 } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing latitude or longitude' },
        { status: 400 }
      );
    }

    console.log('[v0] Fetching hospitals with radius:', { lat, lng, radius });

    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        way["amenity"="hospital"](around:${radius},${lat},${lng});
        relation["amenity"="hospital"](around:${radius},${lat},${lng});
        node["amenity"="clinic"](around:${radius},${lat},${lng});
        way["amenity"="clinic"](around:${radius},${lat},${lng});
        relation["amenity"="clinic"](around:${radius},${lat},${lng});
        node["amenity"="pharmacy"](around:${radius},${lat},${lng});
        way["amenity"="pharmacy"](around:${radius},${lat},${lng});
        node["healthcare"="hospital"](around:${radius},${lat},${lng});
        way["healthcare"="hospital"](around:${radius},${lat},${lng});
        node["healthcare"="clinic"](around:${radius},${lat},${lng});
        way["healthcare"="clinic"](around:${radius},${lat},${lng});
        node["healthcare"="centre"](around:${radius},${lat},${lng});
        way["healthcare"="centre"](around:${radius},${lat},${lng});
        node["healthcare"="laboratory"](around:${radius},${lat},${lng});
        way["healthcare"="laboratory"](around:${radius},${lat},${lng});
        node["healthcare"="diagnostic_centre"](around:${radius},${lat},${lng});
        way["healthcare"="diagnostic_centre"](around:${radius},${lat},${lng});
        node["emergency"="yes"](around:${radius},${lat},${lng});
        way["emergency"="yes"](around:${radius},${lat},${lng});
        node["healthcare:speciality"](around:${radius},${lat},${lng});
        way["healthcare:speciality"](around:${radius},${lat},${lng});
      );
      out center meta;
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[v0] Overpass API timeout');
      controller.abort();
    }, 25000); // 25 second timeout

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: new URLSearchParams({ data: overpassQuery }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MedicAI/1.0 (Medical Emergency Response App; +https://medicai.app)',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log('[v0] Overpass API error:', response.status);
        return NextResponse.json(
          { error: `Overpass API returned ${response.status}`, elements: [] },
          { status: 200 } // Return 200 with fallback data
        );
      }

      const data = await response.json();
      console.log('[v0] Got hospitals from Overpass:', data.elements?.length || 0);
      return NextResponse.json(data);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('[v0] Overpass API fetch error:', error.message);

      // Return empty array so client can use mock data
      return NextResponse.json(
        { error: error.message, elements: [] },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[v0] Hospital API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospitals', elements: [] },
      { status: 500 }
    );
  }
}
