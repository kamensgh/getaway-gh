import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { NATIONAL_FESTIVALS } from '../data/festivals'
import { properties } from '../data/properties'

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const REGION_COLORS = {
  'Greater Accra': 'bg-blue-700',
  'Central':       'bg-green-700',
  'Western':       'bg-red-700',
  'Eastern':       'bg-amber-700',
  'Volta':         'bg-teal-600',
  'Ashanti':       'bg-yellow-600',
  'Northern':      'bg-orange-700',
  'Upper East':    'bg-purple-700',
  'Upper West':    'bg-indigo-700',
}

function NearbyStays({ region }) {
  const spots = useMemo(() =>
    properties
      .filter(p => p.region === region && p.vibeScore)
      .sort((a, b) => b.vibeScore - a.vibeScore)
      .slice(0, 3),
    [region]
  )
  if (!spots.length) return null
  return (
    <div className="mt-4">
      <p className="font-body font-extrabold text-xs text-white/60 uppercase tracking-wider mb-2">Nearby stays</p>
      <div className="flex flex-col gap-2">
        {spots.map(p => (
          <Link key={p.id} to={`/property/${p.id}`}
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition-colors group">
            {(p.image || p.images?.[0]) && (
              <img src={p.image || p.images[0]} alt={p.name}
                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/20" />
            )}
            <div className="min-w-0">
              <p className="font-display text-xs text-white uppercase leading-tight truncate group-hover:text-vibe-yellow transition-colors">{p.name}</p>
              <p className="font-body text-[10px] text-white/60">{p.city || p.district} · GHS {p.priceGHS?.toLocaleString()}/night</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function Festivals() {
  const [activeRegion, setActiveRegion] = useState('')

  const today = new Date()
  const sorted = useMemo(() => {
    const list = activeRegion
      ? NATIONAL_FESTIVALS.filter(f => f.region === activeRegion)
      : NATIONAL_FESTIVALS
    return [...list].sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [activeRegion])

  // Group by month label for display
  const byMonth = useMemo(() => {
    const groups = {}
    sorted.forEach(f => {
      const key = `${MONTH_NAMES[f.month]} ${new Date(f.date).getFullYear()}`
      if (!groups[key]) groups[key] = []
      groups[key].push(f)
    })
    return groups
  }, [sorted])

  const regions = [...new Set(NATIONAL_FESTIVALS.map(f => f.region))].sort()

  return (
    <div className="min-h-screen bg-vibe-navy">
      {/* Header */}
      <section className="pt-28 pb-10 px-4 bg-vibe-red relative overflow-hidden">
        <div className="absolute top-20 left-6 text-white/20 text-5xl select-none pointer-events-none">✦</div>
        <div className="absolute bottom-4 right-8 text-white/10 text-7xl select-none pointer-events-none">✦</div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p className="font-cursive text-vibe-yellow text-2xl mb-2">mark your calendar</p>
          <h1 className="font-display text-5xl sm:text-7xl text-white uppercase leading-tight mb-4">
            GHANA<br />FESTIVAL<br />CALENDAR
          </h1>
          <p className="font-body font-bold text-white/80 text-base max-w-lg mx-auto">
            From Homowo in Accra to Hogbetsotso in Anloga — plan your trip around the country's greatest cultural moments.
          </p>
        </div>
      </section>

      {/* Region filter */}
      <section className="px-4 py-5 bg-vibe-navy border-b-2 border-white/10 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-2 justify-center">
          <button onClick={() => setActiveRegion('')}
            className={`font-body font-extrabold text-xs px-4 py-2 rounded-full border-2 border-white/30 transition-colors ${!activeRegion ? 'bg-vibe-yellow text-vibe-navy border-vibe-yellow' : 'text-white/70 hover:text-white'}`}>
            All regions
          </button>
          {regions.map(r => (
            <button key={r} onClick={() => setActiveRegion(r === activeRegion ? '' : r)}
              className={`font-body font-extrabold text-xs px-4 py-2 rounded-full border-2 transition-colors ${activeRegion === r ? 'bg-vibe-yellow text-vibe-navy border-vibe-yellow' : 'text-white/70 border-white/30 hover:text-white'}`}>
              {r}
            </button>
          ))}
        </div>
      </section>

      {/* Festival timeline */}
      <section className="px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {sorted.length === 0 ? (
            <p className="text-center font-body text-white/50 py-20">No festivals for this region.</p>
          ) : (
            Object.entries(byMonth).map(([month, fests]) => (
              <div key={month} className="mb-12">
                <h2 className="font-display text-2xl text-vibe-yellow uppercase mb-6 flex items-center gap-3">
                  <span>{month}</span>
                  <span className="flex-1 h-px bg-white/10" />
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fests.map(f => {
                    const isPast = new Date(f.date) < today
                    const regionColor = REGION_COLORS[f.region] || 'bg-gray-700'
                    return (
                      <div key={f.id}
                        className={`${regionColor} rounded-2xl border-2 border-vibe-navy shadow-card p-5 relative ${isPast ? 'opacity-60' : ''}`}>
                        {isPast && (
                          <span className="absolute top-3 right-3 font-body font-extrabold text-[10px] bg-black/30 text-white/70 px-2 py-0.5 rounded-full">
                            Past
                          </span>
                        )}
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-3xl">{f.emoji}</span>
                          <div>
                            <h3 className="font-display text-lg text-white uppercase leading-tight">{f.name}</h3>
                            <p className="font-cursive text-white/70 text-sm">{f.tagline}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="font-body font-extrabold text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full">
                            📍 {f.location}
                          </span>
                          <span className="font-body font-extrabold text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full">
                            📅 {f.displayDate}
                          </span>
                        </div>

                        <p className="font-body text-sm text-white/85 leading-relaxed mb-3">{f.description}</p>

                        {f.tips && (
                          <ul className="space-y-1 mb-1">
                            {f.tips.map((tip, i) => (
                              <li key={i} className="font-body text-xs text-white/70 flex items-start gap-2">
                                <span className="text-white/40 shrink-0 mt-0.5">—</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        )}

                        <NearbyStays region={f.region} />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="bg-vibe-navy py-6 text-center border-t border-white/10">
        <p className="font-body font-bold text-white/40 text-sm">Getaway.gh — Discover Ghana © 2025</p>
      </footer>
    </div>
  )
}
