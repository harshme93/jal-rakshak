import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const { waterBodies, password } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!waterBodies || waterBodies.length === 0) {
    return NextResponse.json({ error: 'No water bodies to import' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Check for duplicates by osm_id
  const osmIds = waterBodies.filter(wb => wb.osm_id).map(wb => wb.osm_id);
  let existingOsmIds = new Set();

  if (osmIds.length > 0) {
    const { data: existing } = await supabase
      .from('water_bodies')
      .select('osm_id')
      .in('osm_id', osmIds);

    if (existing) {
      existingOsmIds = new Set(existing.map(e => e.osm_id));
    }
  }

  // Filter out duplicates
  const newBodies = waterBodies.filter(wb => !wb.osm_id || !existingOsmIds.has(wb.osm_id));

  if (newBodies.length === 0) {
    return NextResponse.json({ count: 0, message: 'All water bodies already exist' });
  }

  // Insert in batches of 50
  let totalInserted = 0;
  for (let i = 0; i < newBodies.length; i += 50) {
    const batch = newBodies.slice(i, i + 50).map(wb => ({
      name: wb.name,
      latitude: wb.latitude,
      longitude: wb.longitude,
      type: wb.type,
      locality: wb.locality || null,
      city: wb.city,
      state: wb.state || null,
      osm_id: wb.osm_id || null,
    }));

    const { data, error } = await supabase.from('water_bodies').insert(batch).select('id');

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: error.message, inserted_so_far: totalInserted }, { status: 500 });
    }

    totalInserted += data.length;
  }

  return NextResponse.json({ count: totalInserted });
}
