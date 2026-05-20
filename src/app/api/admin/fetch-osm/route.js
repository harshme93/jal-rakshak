import { NextResponse } from 'next/server';

const CITY_BOUNDS = {
  'delhi': { s: 28.4, w: 76.8, n: 28.9, e: 77.4 },
  'mumbai': { s: 18.85, w: 72.75, n: 19.35, e: 73.05 },
  'bangalore': { s: 12.8, w: 77.45, n: 13.15, e: 77.8 },
  'bengaluru': { s: 12.8, w: 77.45, n: 13.15, e: 77.8 },
  'chennai': { s: 12.85, w: 80.1, n: 13.25, e: 80.35 },
  'hyderabad': { s: 17.25, w: 78.25, n: 17.55, e: 78.65 },
  'pune': { s: 18.4, w: 73.7, n: 18.65, e: 74.0 },
  'kolkata': { s: 22.4, w: 88.2, n: 22.7, e: 88.5 },
  'ahmedabad': { s: 22.9, w: 72.45, n: 23.15, e: 72.7 },
  'jaipur': { s: 26.75, w: 75.65, n: 27.0, e: 75.95 },
  'lucknow': { s: 26.75, w: 80.85, n: 27.0, e: 81.1 },
  'chandigarh': { s: 30.65, w: 76.7, n: 30.8, e: 76.85 },
  'bhopal': { s: 23.15, w: 77.3, n: 23.35, e: 77.55 },
  'patna': { s: 25.55, w: 84.95, n: 25.7, e: 85.25 },
  'indore': { s: 22.6, w: 75.75, n: 22.85, e: 76.0 },
  'nagpur': { s: 21.05, w: 79.0, n: 21.25, e: 79.2 },
  'varanasi': { s: 25.25, w: 82.9, n: 25.4, e: 83.1 },
  'gurgaon': { s: 28.35, w: 76.95, n: 28.55, e: 77.15 },
  'gurugram': { s: 28.35, w: 76.95, n: 28.55, e: 77.15 },
  'noida': { s: 28.45, w: 77.3, n: 28.65, e: 77.55 },
  'faridabad': { s: 28.35, w: 77.25, n: 28.55, e: 77.45 },
  'ghaziabad': { s: 28.6, w: 77.35, n: 28.75, e: 77.55 },
  'kochi': { s: 9.9, w: 76.2, n: 10.1, e: 76.4 },
  'thiruvananthapuram': { s: 8.4, w: 76.85, n: 8.6, e: 77.05 },
  'coimbatore': { s: 10.9, w: 76.9, n: 11.1, e: 77.1 },
  'visakhapatnam': { s: 17.65, w: 83.15, n: 17.85, e: 83.45 },
  'surat': { s: 21.1, w: 72.7, n: 21.3, e: 72.95 },
  'vadodara': { s: 22.2, w: 73.1, n: 22.4, e: 73.3 },
  'dehradun': { s: 30.25, w: 77.95, n: 30.45, e: 78.15 },
};

async function geocodeCity(city) {
  const key = city.toLowerCase().trim();
  if (CITY_BOUNDS[key]) return CITY_BOUNDS[key];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', India')}&format=json&limit=1&bounded=0`,
      { headers: { 'User-Agent': 'JalRakshak/1.0' } }
    );
    const data = await res.json();
    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      return { s: lat - 0.15, w: lon - 0.2, n: lat + 0.15, e: lon + 0.2 };
    }
  } catch (e) {
    console.error('Geocode failed:', e);
  }
  return null;
}

export async function POST(req) {
  const { city, state, password } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!city) {
