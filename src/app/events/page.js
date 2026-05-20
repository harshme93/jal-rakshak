'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('cleanup_events')
        .select('*, water_bodies(name, locality, city)')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (data) setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-surface-0">
      <header className="bg-surface-50 border-b border-surface-200 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">← Map</Link>
        <h1 className="font-display text-2xl text-white">Upcoming Cleanups</h1>
      </header>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-4">🗓</p>
            <p className="text-lg mb-2">No upcoming cleanups</p>
            <p className="text-sm">Go to any water body on the map and organize one!</p>
            <Link href="/" className="inline-block mt-4 px-4 py-2 rounded-lg bg-accent text-surface-0 text-sm font-semibold">
              Open Map
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(e => {
              const eventDate = new Date(e.event_date);
              const wb = e.water_bodies;
              const pageUrl = typeof window !== 'undefined'
                ? `${window.location.origin}/water-body/${e.water_body_id}`
                : '';
              const shareText = `🧹 Cleanup drive at ${wb?.name || 'Water Body'}\n📅 ${eventDate.toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}, ${eventDate.toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit'
              })}\n🧤 Bring: ${e.what_to_bring || 'Gloves & trash bags'}\n\nDetails → ${pageUrl}`;

              return (
                <div key={e.id} className="bg-surface-100 rounded-xl p-5 border border-surface-200 animate-fade-up">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{e.title}</h3>
                      <Link
                        href={`/water-body/${e.water_body_id}`}
                        className="text-sm text-accent hover:underline"
                      >
                        {wb?.name || 'View water body'} · {wb?.locality}
                      </Link>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-display text-white">{eventDate.getDate()}</p>
                      <p className="text-xs text-gray-400 uppercase">
                        {eventDate.toLocaleDateString('en-IN', { month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 mb-4 mt-3">
                    <p className="text-sm text-gray-400">
                      🕐 {eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-gray-400">👤 {e.organizer_name}</p>
                    {e.what_to_bring && (
                      <p className="text-sm text-gray-400">🧤 {e.what_to_bring}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/91${e.whatsapp_number}?text=${encodeURIComponent(`Hi! I'd like to join the cleanup at ${wb?.name}`)}`}
                      target="_blank"
                      rel="noopener"
                      className="flex-1 text-center py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      💬 Join on WhatsApp
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noopener"
                      className="flex-1 text-center py-2.5 rounded-lg bg-surface-200 text-white text-sm font-semibold border border-surface-300 hover:bg-surface-300 transition-colors"
                    >
                      📤 Share
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
