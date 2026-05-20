'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const STATUS_COLORS = {
  clean: '#22c55e',
  dirty: '#ef4444',
  unknown: '#6b7280',
};

const STATUS_LABELS = {
  clean: 'Clean',
  dirty: 'Needs Cleanup',
  unknown: 'Unknown',
};

const TYPE_ICONS = {
  lake: '💧',
  pond: '🪷',
  river: '🏞️',
  canal: '🚿',
  drain: '🕳️',
  reservoir: '💦',
  wetland: '🌿',
  stepwell: '🏛️',
  water: '💧',
};

export default function HomePage() {
  const [waterBodies, setWaterBodies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [cities, setCities] = useState(['Delhi']);
  const [filter, setFilter] = useState('all'); // all, clean, dirty, unknown
  const [showReport, setShowReport] = useState(null);
  const [showEvent, setShowEvent] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Fetch water bodies
  const fetchWaterBodies = useCallback(async () => {
    setLoading(true);

    // Fetch cities
    const { data: cityData } = await supabase
      .from('water_bodies')
      .select('city')
      .order('city');
    
    if (cityData) {
      const uniqueCities = [...new Set(cityData.map(d => d.city))];
      setCities(uniqueCities);
    }

    // Fetch water bodies with status
    const { data, error } = await supabase
      .from('water_body_status')
      .select('*')
      .eq('city', selectedCity);

    if (data) {
      setWaterBodies(data);
    }
    setLoading(false);
  }, [selectedCity]);

  useEffect(() => {
    fetchWaterBodies();
  }, [fetchWaterBodies]);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([28.6139, 77.2090], 11);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      
      // Clear existing markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      const filtered = filter === 'all' 
        ? waterBodies 
        : waterBodies.filter(wb => wb.current_status === filter);

      filtered.forEach(wb => {
        const color = STATUS_COLORS[wb.current_status] || STATUS_COLORS.unknown;
        const icon = L.divIcon({
          className: `marker-${wb.current_status}`,
          html: `<div style="
            width: 14px;
            height: 14px;
            background: ${color};
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.3);
            cursor: pointer;
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([wb.latitude, wb.longitude], { icon })
          .addTo(mapInstanceRef.current);

        const typeIcon = TYPE_ICONS[wb.type] || '💧';

        marker.bindPopup(`
          <div style="min-width: 200px; padding: 4px;">
            <div style="font-size: 13px; color: #9ca3af; margin-bottom: 2px;">${typeIcon} ${wb.type}</div>
            <div style="font-family: 'Instrument Serif', serif; font-size: 20px; margin-bottom: 4px; color: #fff;">${wb.name}</div>
            <div style="font-size: 13px; color: #9ca3af; margin-bottom: 8px;">${wb.locality || ''}</div>
            <div style="
              display: inline-block;
              padding: 3px 10px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              background: ${color}22;
              color: ${color};
              border: 1px solid ${color}44;
              margin-bottom: 10px;
            ">${STATUS_LABELS[wb.current_status]}</div>
            ${wb.recent_report_count > 0 ? `<div style="font-size: 11px; color: #6b7280; margin-bottom: 8px;">${wb.recent_report_count} reports in last 30 days</div>` : ''}
            <div style="display: flex; gap: 6px; margin-top: 4px;">
              <a href="/water-body/${wb.id}" style="
                flex: 1;
                text-align: center;
                padding: 6px 0;
                background: #00e09e;
                color: #0a0f0d;
                border-radius: 6px;
                text-decoration: none;
                font-size: 12px;
                font-weight: 600;
              ">View Details</a>
            </div>
          </div>
        `, { maxWidth: 280 });

        markersRef.current.push(marker);
      });

      // Fit bounds if we have markers
      if (filtered.length > 0) {
        const bounds = L.latLngBounds(filtered.map(wb => [wb.latitude, wb.longitude]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    };

    updateMarkers();
  }, [waterBodies, filter]);

  const stats = {
    total: waterBodies.length,
    clean: waterBodies.filter(wb => wb.current_status === 'clean').length,
    dirty: waterBodies.filter(wb => wb.current_status === 'dirty').length,
    unknown: waterBodies.filter(wb => wb.current_status === 'unknown').length,
  };

  return (
    <div className="h-screen flex flex-col relative">
      {/* Header */}
      <header className="bg-surface-50 border-b border-surface-200 px-4 py-3 flex items-center justify-between z-[1000] relative">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl text-white tracking-tight">
            Jal<span className="text-accent">Rakshak</span>
          </h1>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-surface-200 text-sm px-3 py-1.5 rounded-lg border border-surface-300 text-white outline-none"
          >
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/events"
            className="text-sm px-3 py-1.5 rounded-lg bg-surface-200 border border-surface-300 text-white hover:bg-surface-300 transition-colors"
          >
            Events
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-surface-50 px-4 py-2 flex gap-2 overflow-x-auto z-[1000] relative border-b border-surface-200">
        {[
          { key: 'all', label: `All (${stats.total})`, color: '#fff' },
          { key: 'dirty', label: `Dirty (${stats.dirty})`, color: STATUS_COLORS.dirty },
          { key: 'clean', label: `Clean (${stats.clean})`, color: STATUS_COLORS.clean },
          { key: 'unknown', label: `Unknown (${stats.unknown})`, color: STATUS_COLORS.unknown },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-surface-300 border-surface-400'
                : 'bg-surface-100 border-surface-200 opacity-70 hover:opacity-100'
            } border`}
            style={{ color: f.color }}
          >
            {f.key !== 'all' && (
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ background: f.color }}
              />
            )}
            {f.label}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0" />
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-0/80 z-[999]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Loading water bodies...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="bg-surface-50 border-t border-surface-200 px-4 py-3 flex items-center justify-between z-[1000] relative">
        <p className="text-xs text-gray-500">
          {stats.total} water bodies mapped
        </p>
        <div className="flex gap-2">
          <Link
            href="/events"
            className="text-xs px-4 py-2 rounded-lg bg-surface-200 border border-surface-300 text-white font-medium hover:bg-surface-300 transition-colors"
          >
            🗓 Cleanup Drives
          </Link>
        </div>
      </div>
    </div>
  );
}
