'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const STATUS_COLORS = {
  clean: '#22c55e',
  dirty: '#ef4444',
  unknown: '#6b7280',
};

export default function WaterBodyPage() {
  const params = useParams();
  const id = params.id;
  const [waterBody, setWaterBody] = useState(null);
  const [reports, setReports] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reports');
  const [showReportForm, setShowReportForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: wb } = await supabase
      .from('water_body_status')
      .select('*')
      .eq('id', id)
      .single();

    if (wb) setWaterBody(wb);

    const { data: reps } = await supabase
      .from('reports')
      .select('*')
      .eq('water_body_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (reps) setReports(reps);

    const { data: evts } = await supabase
      .from('cleanup_events')
      .select('*')
      .eq('water_body_id', id)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (evts) setEvents(evts);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mini map
  useEffect(() => {
    if (!waterBody || typeof window === 'undefined' || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstanceRef.current) mapInstanceRef.current.remove();

      const map = L.map(mapRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        attributionControl: false,
      }).setView([waterBody.latitude, waterBody.longitude], 15);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      const color = STATUS_COLORS[waterBody.current_status] || STATUS_COLORS.unknown;
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;background:${color};border-radius:50%;border:3px solid rgba(255,255,255,0.4);box-shadow:0 0 12px ${color}66;"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([waterBody.latitude, waterBody.longitude], { icon }).addTo(map);
      mapInstanceRef.current = map;
    };

    initMap();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [waterBody]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!waterBody) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Water body not found.</p>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[waterBody.current_status] || STATUS_COLORS.unknown;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Mini Map */}
      <div className="relative h-48">
        <div ref={mapRef} className="absolute inset-0" />
        <Link
          href="/"
          className="absolute top-4 left-4 z-[1000] bg-surface-100/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm text-white border border-surface-300"
        >
          ← Map
        </Link>
      </div>

      {/* Info */}
      <div className="px-4 py-5 animate-fade-up">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-sm text-gray-500 mb-1">{waterBody.type} · {waterBody.locality}</p>
            <h1 className="font-display text-3xl text-white">{waterBody.name}</h1>
          </div>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full mt-1"
            style={{
              background: `${statusColor}18`,
              color: statusColor,
              border: `1px solid ${statusColor}33`,
            }}
          >
            {waterBody.current_status === 'clean' ? '✓ Clean' : waterBody.current_status === 'dirty' ? '✕ Dirty' : '? Unknown'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {waterBody.recent_report_count || 0} reports in last 30 days · {waterBody.city}, {waterBody.state}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { setShowReportForm(true); setShowEventForm(false); }}
            className="flex-1 bg-accent text-surface-0 font-semibold text-sm py-2.5 rounded-lg hover:bg-accent-dim transition-colors"
          >
            📸 Report Status
          </button>
          <button
            onClick={() => { setShowEventForm(true); setShowReportForm(false); }}
            className="flex-1 bg-surface-200 text-white font-semibold text-sm py-2.5 rounded-lg border border-surface-300 hover:bg-surface-300 transition-colors"
          >
            🗓 Organize Cleanup
          </button>
        </div>
      </div>

      {/* Report Form */}
      {showReportForm && (
        <ReportForm
          waterBodyId={waterBody.id}
          supabaseUrl={SUPABASE_URL}
          onClose={() => setShowReportForm(false)}
          onSubmit={() => { setShowReportForm(false); fetchData(); }}
        />
      )}

      {/* Event Form */}
      {showEventForm && (
        <EventForm
          waterBodyId={waterBody.id}
          waterBodyName={waterBody.name}
          onClose={() => setShowEventForm(false)}
          onSubmit={() => { setShowEventForm(false); fetchData(); }}
        />
      )}

      {/* Tabs */}
      <div className="px-4 border-b border-surface-200 flex gap-4 mt-2">
        {['reports', 'events'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm pb-3 border-b-2 transition-colors capitalize ${
              tab === t
                ? 'border-accent text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'reports' ? `Reports (${reports.length})` : `Events (${events.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {tab === 'reports' && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">📷</p>
                <p className="text-sm">No reports yet. Be the first to report!</p>
              </div>
            ) : (
              reports.map(r => (
                <div key={r.id} className="bg-surface-100 rounded-xl p-4 border border-surface-200">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{
                        background: `${STATUS_COLORS[r.status]}18`,
                        color: STATUS_COLORS[r.status],
                        border: `1px solid ${STATUS_COLORS[r.status]}33`,
                      }}
                    >
                      {r.status === 'clean' ? '✓ Clean' : '✕ Dirty'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(r.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                  {r.reporter_name && (
                    <p className="text-xs text-gray-400 mb-2">by {r.reporter_name}</p>
                  )}
                  {r.notes && <p className="text-sm text-gray-300 mb-3">{r.notes}</p>}
                  {r.photos && r.photos.length > 0 && (
                    <div className="photo-grid">
                      {r.photos.map((url, i) => (
                        <img
                          key={i}
                          src={`${SUPABASE_URL}/storage/v1/object/public/Photos/${url}`}
                          alt={`Report photo ${i + 1}`}
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'events' && (
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">🗓</p>
                <p className="text-sm">No upcoming cleanups. Organize one!</p>
              </div>
            ) : (
              events.map(e => (
                <EventCard key={e.id} event={e} waterBodyName={waterBody.name} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Report Form Component ----
function ReportForm({ waterBodyId, supabaseUrl, onClose, onSubmit }) {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const handlePhotos = async (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const imageCompression = (await import('browser-image-compression')).default;

    const compressed = [];
    const prevs = [];

    for (const file of files) {
      const c = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });
      compressed.push(c);
      prevs.push(URL.createObjectURL(c));
    }

    setPhotos(compressed);
    setPreviews(prevs);
  };

  const handleSubmit = async () => {
    if (!status) return;
    setSubmitting(true);

    try {
      // Upload photos
      const photoUrls = [];
      for (const photo of photos) {
        const fileName = `${waterBodyId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const { data, error } = await supabase.storage
          .from('Photos')
          .upload(fileName, photo, { contentType: 'image/jpeg' });

        if (data) photoUrls.push(data.path);
      }

      // Insert report
      await supabase.from('reports').insert({
        water_body_id: waterBodyId,
        status,
        notes: notes || null,
        reporter_name: name || null,
        photos: photoUrls,
      });

      onSubmit();
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="px-4 py-4 bg-surface-100 mx-4 rounded-xl border border-surface-300 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl text-white">Report Status</h3>
        <button onClick={onClose} className="text-gray-500 text-xl">×</button>
      </div>

      {/* Status pick */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setStatus('clean')}
          className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
            status === 'clean'
              ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
              : 'bg-surface-200 text-gray-400 border-2 border-transparent'
          }`}
        >
          ✓ Clean
        </button>
        <button
          onClick={() => setStatus('dirty')}
          className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
            status === 'dirty'
              ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
              : 'bg-surface-200 text-gray-400 border-2 border-transparent'
          }`}
        >
          ✕ Dirty
        </button>
      </div>

      {/* Photos */}
      <div className="mb-4">
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-3 rounded-lg border-2 border-dashed border-surface-300 text-gray-400 text-sm hover:border-accent hover:text-accent transition-colors"
        >
          📸 Add Photos (max 3)
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handlePhotos}
          className="hidden"
        />
        {previews.length > 0 && (
          <div className="photo-grid mt-2">
            {previews.map((p, i) => (
              <img key={i} src={p} alt={`Preview ${i + 1}`} />
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value.slice(0, 200))}
        placeholder="Any notes? (optional, 200 chars)"
        rows={2}
        className="w-full bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-accent mb-3 resize-none"
      />

      {/* Name */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (optional)"
        className="w-full bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-accent mb-4"
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!status || submitting}
        className="w-full py-3 rounded-lg bg-accent text-surface-0 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-dim transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Report'}
      </button>
    </div>
  );
}

// ---- Event Form Component ----
function EventForm({ waterBodyId, waterBodyName, onClose, onSubmit }) {
  const [title, setTitle] = useState(`Cleanup at ${waterBodyName}`);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('07:00');
  const [orgName, setOrgName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatToBring, setWhatToBring] = useState('Gloves, trash bags');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!date || !orgName || !whatsapp) return;
    setSubmitting(true);

    try {
      const eventDate = new Date(`${date}T${time}:00`);

      await supabase.from('cleanup_events').insert({
        water_body_id: waterBodyId,
        title,
        event_date: eventDate.toISOString(),
        organizer_name: orgName,
        whatsapp_number: whatsapp,
        what_to_bring: whatToBring || null,
      });

      onSubmit();
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="px-4 py-4 bg-surface-100 mx-4 rounded-xl border border-surface-300 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl text-white">Organize Cleanup</h3>
        <button onClick={onClose} className="text-gray-500 text-xl">×</button>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event title"
        className="w-full bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-accent mb-3"
      />

      <div className="flex gap-2 mb-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="flex-1 bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-28 bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent"
        />
      </div>

      <input
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
        placeholder="Your name *"
        className="w-full bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-accent mb-3"
      />

      <input
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        placeholder="WhatsApp number * (e.g. 9876543210)"
        type="tel"
        className="w-full bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-accent mb-3"
      />

      <input
        value={whatToBring}
        onChange={(e) => setWhatToBring(e.target.value)}
        placeholder="What to bring (optional)"
        className="w-full bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-accent mb-4"
      />

      <button
        onClick={handleSubmit}
        disabled={!date || !orgName || !whatsapp || submitting}
        className="w-full py-3 rounded-lg bg-accent text-surface-0 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-dim transition-colors"
      >
        {submitting ? 'Creating...' : 'Create Event'}
      </button>
    </div>
  );
}

// ---- Event Card Component ----
function EventCard({ event, waterBodyName }) {
  const eventDate = new Date(event.event_date);
  const shareText = `🧹 Cleanup drive at ${waterBodyName}\n📅 ${eventDate.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  })}, ${eventDate.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  })}\n🧤 Bring: ${event.what_to_bring || 'Gloves & trash bags'}\n\nJoin us → ${typeof window !== 'undefined' ? window.location.href : ''}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const joinUrl = `https://wa.me/91${event.whatsapp_number}?text=${encodeURIComponent(`Hi! I'd like to join the cleanup at ${waterBodyName}`)}`;

  return (
    <div className="bg-surface-100 rounded-xl p-4 border border-surface-200">
      <h4 className="font-semibold text-white mb-2">{event.title}</h4>
      <div className="space-y-1 mb-3">
        <p className="text-sm text-gray-400">
          📅 {eventDate.toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })} at {eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-sm text-gray-400">👤 {event.organizer_name}</p>
        {event.what_to_bring && (
          <p className="text-sm text-gray-400">🧤 {event.what_to_bring}</p>
        )}
      </div>
      <div className="flex gap-2">
        <a
          href={joinUrl}
          target="_blank"
          rel="noopener"
          className="flex-1 text-center py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          💬 Join on WhatsApp
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener"
          className="flex-1 text-center py-2 rounded-lg bg-surface-200 text-white text-sm font-semibold border border-surface-300 hover:bg-surface-300 transition-colors"
        >
          📤 Share
        </a>
      </div>
    </div>
  );
}
