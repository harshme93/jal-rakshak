-- ============================================
-- JalRakshak Database Schema
-- Run this in Supabase SQL Editor (SQL tab in sidebar)
-- ============================================

-- 1. Water Bodies table
CREATE TABLE water_bodies (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  type TEXT DEFAULT 'water', -- lake, pond, river, canal, drain, reservoir
  locality TEXT,
  city TEXT NOT NULL DEFAULT 'Delhi',
  state TEXT NOT NULL DEFAULT 'Delhi',
  osm_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Reports table
CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  water_body_id BIGINT REFERENCES water_bodies(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('clean', 'dirty')),
  photos TEXT[] DEFAULT '{}', -- array of storage URLs
  notes TEXT,
  reporter_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cleanup Events table
CREATE TABLE cleanup_events (
  id BIGSERIAL PRIMARY KEY,
  water_body_id BIGINT REFERENCES water_bodies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  duration_hours NUMERIC DEFAULT 2,
  organizer_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  what_to_bring TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for performance
CREATE INDEX idx_water_bodies_city ON water_bodies(city);
CREATE INDEX idx_water_bodies_coords ON water_bodies(latitude, longitude);
CREATE INDEX idx_reports_water_body ON reports(water_body_id);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_events_water_body ON cleanup_events(water_body_id);
CREATE INDEX idx_events_date ON cleanup_events(event_date);

-- 5. Enable Row Level Security
ALTER TABLE water_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleanup_events ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies - public read, public insert, no update/delete
CREATE POLICY "Anyone can read water bodies" ON water_bodies FOR SELECT USING (true);
CREATE POLICY "Anyone can insert water bodies" ON water_bodies FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Anyone can submit reports" ON reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read events" ON cleanup_events FOR SELECT USING (true);
CREATE POLICY "Anyone can create events" ON cleanup_events FOR INSERT WITH CHECK (true);

-- 7. View for water body status (derived from recent reports)
CREATE OR REPLACE VIEW water_body_status AS
SELECT
  wb.id,
  wb.name,
  wb.latitude,
  wb.longitude,
  wb.type,
  wb.locality,
  wb.city,
  wb.state,
  wb.osm_id,
  COALESCE(
    (SELECT r.status
     FROM reports r
     WHERE r.water_body_id = wb.id
       AND r.created_at > NOW() - INTERVAL '30 days'
     GROUP BY r.status
     ORDER BY COUNT(*) DESC
     LIMIT 1),
    'unknown'
  ) AS current_status,
  (SELECT COUNT(*)
   FROM reports r
   WHERE r.water_body_id = wb.id
     AND r.created_at > NOW() - INTERVAL '30 days') AS recent_report_count,
  (SELECT r.photos[1]
   FROM reports r
   WHERE r.water_body_id = wb.id
     AND r.photos IS NOT NULL
     AND array_length(r.photos, 1) > 0
   ORDER BY r.created_at DESC
   LIMIT 1) AS latest_photo
FROM water_bodies wb;
