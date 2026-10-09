'use client';
import { useEffect, useState } from 'react';
import { api, Place } from '@/lib/api';

export default function LocationFinder() {
  const [divs, setDivs] = useState<Place[]>([]);
  const [dists, setDists] = useState<Place[]>([]);
  const [upas, setUpas] = useState<Place[]>([]);
  const [d, setD] = useState('');
  const [di, setDi] = useState('');
  const [u, setU] = useState('');

  useEffect(() => { api<Place[]>('/divisions').then(setDivs).catch(() => setDivs([])); }, []);
  useEffect(() => {
    setDi(''); setU(''); setUpas([]);
    setDists([]);
    if (d) api<Place[]>(`/divisions/${d}/districts`).then(setDists);
  }, [d]);
  useEffect(() => {
    setU(''); setUpas([]);
    if (di) api<Place[]>(`/districts/${di}/upazilas`).then(setUpas);
  }, [di]);

  const sel = 'w-full border border-black/15 bg-ivory p-3 disabled:opacity-40';
  return (
    <div className="mx-auto -mt-20 max-w-5xl border border-black/10 bg-white p-6">
      <h2 className="mb-4 font-display text-3xl">Where do you want to go?</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <select className={sel} value={d} onChange={(e) => setD(e.target.value)} aria-label="Division">
          <option value="">Division</option>
          {divs.map((x) => <option key={x.id} value={x.id}>{x.nameEn}</option>)}
        </select>
        <select className={sel} value={di} disabled={!d} onChange={(e) => setDi(e.target.value)} aria-label="District">
          <option value="">District</option>
          {dists.map((x) => <option key={x.id} value={x.id}>{x.nameEn}</option>)}
        </select>
        <select className={sel} value={u} disabled={!di} onChange={(e) => setU(e.target.value)} aria-label="Upazila">
          <option value="">Upazila</option>
          {upas.map((x) => <option key={x.id} value={x.id}>{x.nameEn}</option>)}
        </select>
      </div>
    </div>
  );
}
