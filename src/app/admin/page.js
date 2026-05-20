'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');

  // City import
  const [cityName, setCityName] = useState('');
  const [stateName, setStateName] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchedBodies, setFetchedBodies] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState('');

  // Stats
  const [stats, setStats] = useState(null);

  const handleAuth = async () => {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      fetchStats();
    } else {
      setAuthError('Wrong password');
    }
  };

  const fetchStats = async () => {
    const { count: wbCount } = await supabase.from('water_bodies').select('*', { count: 'exact', head: true });
    const { count: repCount } = await supabase.from('reports').select('*', { count: 'exact', head: true });
    const { count: evtCount } = await supabase.from('cleanup_events').select('*', { count: 'exact', head: true });
    const { data: cities } = await supabase.from('water_bodies').select('city');
    const uniqueCities = [...new Set((cities || []).map(c => c.city))];
    setStats({
      waterBodies: wbCount || 0,
      reports: repCount || 0,
      events: evtCount || 0,
      cities: uniqueCities,
    });
  };

  const fetchFromOSM = async () => {
    if (!cityName) return;
    setFetching(true);
    setFetchedBodies([]);
    setImportResult('');

    try {
      const res = await fetch('/api/admin/fetch-osm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: cityName, state: stateName, password }),
      });
      const data = await res.json();
      if (data.error) {
        setImportResult(`Error: ${data.error}`);
      } else {
        setFetchedBodies(data.waterBodies || []);
        setImportResult(`Found ${data.waterBodies?.length || 0} water bodies`);
      }
    } catch (err) {
      setImportResult(`Error: ${err.message}`);
    }
    setFetching(false);
  };

  const importToDB = async () => {
    if (fetchedBodies.length === 0) return;
    setImporting(true);

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waterBodies: fetchedBodies, password }),
      });
      const data = await res.json();
      setImportResult(`Imported ${data.count || 0} water bodies into database`);
      setFetchedBodies([]);
      fetchStats();
    } catch (err) {
      setImportResult(`Import error: ${err.message}`);
    }
    setImporting(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="bg-surface-100 border border-surface-300 rounded-xl p-8 w-full max-w-sm">
          <h1 className="font-display text-2xl text-white mb-6 text-center">Admin Access</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            placeholder="Enter admin password"
            className="w-full bg-surface-200 border border-surface-300 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent mb-3"
          />
          {authError && <p className="text-red-400 text-xs mb-3">{authError}</p>}
          <button
            onClick={handleAuth}
            className="w-full py-2.5 rounded-lg bg-accent text-surface-0 font-semibold text-sm"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <header className="bg-surface-50 border-b border-surface-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-white">← Map</Link>
          <h1 className="font-display text-2xl text-white">Admin</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-100 rounded-xl p-4 border border-surface-200 text-center">
              <p className="text-2xl font-bold text-white">{stats.waterBodies}</p>
              <p className="text-xs text-gray-500 mt-1">Water Bodies</p>
            </div>
            <div className="bg-surface-100 rounded-xl p-4 border border-surface-200 text-center">
              <p className="text-2xl font-bold text-white">{stats.reports}</p>
              <p className="text-xs text-gray-500 mt-1">Reports</p>
            </div>
            <div className="bg-surface-100 rounded-xl p-4 border border-surface-200 text-center">
              <p className="text-2xl font-bold text-white">{stats.events}</p>
              <p className="text-xs text-gray-500 mt-1">Events</p>
            </div>
          </div>
        )}

        {stats?.cities && (
          <div className="bg-surface-100 rounded-xl p-4 border border-surface-200">
            <h3 className="text-sm font-semibold text-white mb-2">Active Cities</h3>
            <div className="flex flex-wrap gap-2">
              {stats.cities.map(c => (
                <span key={c} className="text-xs bg-surface-200 text-gray-300 px-2.5 py-1 rounded-full border border-surface-300">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add City */}
        <div className="bg-surface-100 rounded-xl p-5 border border-surface-300">
          <h2 className="font-display text-xl text-white mb-4">Add New City</h2>
          <p className="text-sm text-gray-400 mb-4">
            Fetch water bodies from OpenStreetMap for any Indian city. This queries OSM's Overpass API for lakes, ponds, rivers, canals, and reservoirs within the city.
          </p>

          <div className="flex gap-2 mb-3">
            <input
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="City name (e.g. Mumbai)"
              className="flex-1 bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-accent"
            />
            <input
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="State (e.g. Maharashtra)"
              className="flex-1 bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-accent"
            />
          </div>

          <button
            onClick={fetchFromOSM}
            disabled={fetching || !cityName}
            className="w-full py-2.5 rounded-lg bg-surface-300 text-white font-semibold text-sm mb-3 disabled:opacity-40 hover:bg-surface-400 transition-colors"
          >
            {fetching ? 'Fetching from OSM...' : '🔍 Fetch Water Bodies'}
          </button>

          {importResult && (
            <p className={`text-sm mb-3 ${importResult.startsWith('Error') ? 'text-red-400' : 'text-accent'}`}>
              {importResult}
            </p>
          )}

          {fetchedBodies.length > 0 && (
            <>
              <div className="max-h-64 overflow-y-auto bg-surface-200 rounded-lg p-3 mb-3 border border-surface-300">
                {fetchedBodies.map((wb, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-surface-300 last:border-0">
                    <div>
                      <span className="text-sm text-white">{wb.name || 'Unnamed'}</span>
                      <span className="text-xs text-gray-500 ml-2">{wb.type}</span>
                    </div>
                    <span className="text-xs text-gray-500">{wb.latitude.toFixed(4)}, {wb.longitude.toFixed(4)}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={importToDB}
                disabled={importing}
                className="w-full py-2.5 rounded-lg bg-accent text-surface-0 font-semibold text-sm disabled:opacity-40"
              >
                {importing ? 'Importing...' : `Import ${fetchedBodies.length} Water Bodies`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
