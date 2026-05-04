import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import ActivityFilter from '../components/ActivityFilter'
import { properties, REGIONS, TYPES, GROUP_SIZES, DURATIONS, EDITORIAL_PICKS } from '../data/properties'

const TAGLINES = [
  'Where in Ghana are you escaping to?',
  "Oya let's go — your next getaway awaits 🔥",
  'Every great trip starts with the right spot.',
  'From Accra to Ada. From Boti to Busua.',
  "The weekend is calling. Who's answering?",
]


export default function VibeHome() {
  const [taglineIdx, setTaglineIdx] = useState(0)
  const [taglineKey, setTaglineKey] = useState(0)
  const [selectedActivities, setSelectedActivities] = useState([])
  const [priceMax, setPriceMax] = useState(2000)
  const [groupSize, setGroupSize] = useState('')
  const [region, setRegion] = useState('')
  const [type, setType] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [duration, setDuration] = useState('')

  useEffect(() => {
    const id = setInterval(() => {
      setTaglineIdx(i => (i + 1) % TAGLINES.length)
      setTaglineKey(k => k + 1)
    }, 3200)
    return () => clearInterval(id)
  }, [])

  const toggleActivity = (id) =>
    setSelectedActivities(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

  const editorialProps = useMemo(() => properties.filter(p => EDITORIAL_PICKS.includes(p.id)), [])

  const filtered = useMemo(() => properties.filter(p => {
    if (selectedActivities.length > 0 && !selectedActivities.some(a => p.activities.includes(a))) return false
    if (p.priceGHS > priceMax) return false
    if (groupSize && !p.groups.includes(groupSize)) return false
    if (region && p.region !== region) return false
    if (type && p.type !== type) return false
    if (duration === '1' && p.minStay > 1) return false
    if (duration === '2' && (p.minStay > 2 || p.minStay < 2)) return false
    if (duration === '3' && p.minStay < 3) return false
    return true
  }), [selectedActivities, priceMax, groupSize, region, type, duration])

  return (
    <div className="min-h-screen bg-vibe-red">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-28 pb-12 px-4 overflow-hidden">
        <div className="absolute top-28 left-6 text-white text-4xl opacity-80 animate-float select-none pointer-events-none">✦</div>
        <div className="absolute top-44 right-10 text-white text-2xl opacity-50 animate-float select-none pointer-events-none" style={{ animationDelay: '1.2s' }}>✦</div>

        {/* Blob */}
        <div className="absolute bottom-0 left-4 w-28 h-28 opacity-90 select-none pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <ellipse cx="50" cy="58" rx="28" ry="36" fill="#F9A8D4" stroke="#0E1C40" strokeWidth="3"/>
            <ellipse cx="50" cy="44" rx="18" ry="22" fill="#FBBF24" stroke="#0E1C40" strokeWidth="2.5"/>
          </svg>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p key={taglineKey} className="font-cursive text-2xl sm:text-3xl text-vibe-yellow mb-3 animate-tagline">
            {TAGLINES[taglineIdx]}
          </p>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl text-white uppercase leading-none tracking-tight mb-6">
            YOUR NEXT<br />GETAWAY
          </h1>
          <div className="inline-flex items-center bg-vibe-yellow text-vibe-navy font-body font-extrabold text-base px-6 py-3 rounded-full border-2 border-vibe-navy shadow-btn mb-10">
            Hotels • Eco Lodges • Beach Houses • Airbnb
          </div>
        </div>
      </section>

      {/* ── ACTIVITY FILTER ──────────────────────────────── */}
      <section className="px-4 py-8 bg-vibe-navy">
        <div className="max-w-5xl mx-auto">
          <p className="font-cursive text-vibe-yellow text-xl text-center mb-5">what's your getaway style?</p>
          <ActivityFilter selected={selectedActivities} onToggle={toggleActivity} />
        </div>
      </section>

      {/* ── FILTERS BAR ──────────────────────────────────── */}
      <section className="px-4 pt-8 pb-4 bg-vibe-red">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="font-body font-bold text-white/80 text-sm">
              {filtered.length} spot{filtered.length !== 1 ? 's' : ''} found
              {selectedActivities.length > 0 && (
                <span className="text-vibe-yellow ml-2">· {selectedActivities.length} filter{selectedActivities.length > 1 ? 's' : ''} active</span>
              )}
            </p>
            <button onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-2 font-body font-extrabold text-white text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all">
              ⚙️ {showFilters ? 'Hide' : 'More'} filters
            </button>
          </div>

          {/* Duration pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="font-body font-extrabold text-white/70 text-xs self-center mr-1 uppercase tracking-wide">Stay:</span>
            {DURATIONS.map(d => (
              <button key={d.id} onClick={() => setDuration(d.id === duration ? '' : d.id)}
                className={`font-body font-extrabold text-xs px-4 py-1.5 rounded-full border-2 border-vibe-navy transition-all ${duration === d.id ? 'bg-vibe-navy text-white' : 'bg-white text-vibe-navy hover:bg-vibe-yellow'}`}>
                {d.label}
              </button>
            ))}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-5 bg-white rounded-2xl border-2 border-vibe-navy shadow-card">
              <div>
                <label className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider block mb-2">
                  Max Price: GHS {priceMax.toLocaleString()}
                </label>
                <input type="range" min={180} max={2000} step={50} value={priceMax}
                  onChange={e => setPriceMax(+e.target.value)} className="w-full accent-vibe-blue" />
              </div>
              <div>
                <label className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider block mb-2">Group Size</label>
                <select value={groupSize} onChange={e => setGroupSize(e.target.value)}
                  className="w-full border-2 border-vibe-navy rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-vibe-blue">
                  <option value="">Any size</option>
                  {GROUP_SIZES.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider block mb-2">Region</label>
                <select value={region} onChange={e => setRegion(e.target.value)}
                  className="w-full border-2 border-vibe-navy rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-vibe-blue">
                  <option value="">All regions</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider block mb-2">Type</label>
                <select value={type} onChange={e => setType(e.target.value)}
                  className="w-full border-2 border-vibe-navy rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-vibe-blue">
                  <option value="">All types</option>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── LISTINGS GRID ────────────────────────────────── */}
      <section className="px-4 pb-16 bg-vibe-red">
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-4xl text-white uppercase mb-4">No spots found 😅</p>
              <p className="font-body text-white/70 mb-6">Try removing some filters or pick a different activity.</p>
              <button
                onClick={() => { setSelectedActivities([]); setGroupSize(''); setRegion(''); setType(''); setPriceMax(2000); setDuration('') }}
                className="vibe-btn bg-vibe-yellow text-vibe-navy font-display px-6 py-3 rounded-full border-2 border-vibe-navy">
                RESET ALL FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(p => <PropertyCard key={p.id} property={p} />)}
              {/* Explore CTA */}
              <div className="bg-vibe-yellow rounded-xl2 border-2 border-vibe-navy shadow-card p-8 flex flex-col items-center justify-center text-center min-h-[300px] region-card">
                <p className="font-cursive text-vibe-navy text-xl mb-2">need more options?</p>
                <h3 className="font-display text-3xl text-vibe-navy uppercase leading-tight mb-6">
                  EXPLORE<br />ALL 150+<br />LOCATIONS
                </h3>
                <Link to="/explore" className="vibe-btn bg-white text-vibe-navy font-display text-sm px-6 py-3 rounded-full border-2 border-vibe-navy">
                  VIEW MAP
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── EDITORIAL PICKS ──────────────────────────────── */}
      <section className="px-4 py-12 bg-vibe-navy relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none select-none">
          <svg viewBox="0 0 200 200" className="w-full h-full fill-white"><circle cx="100" cy="100" r="100"/></svg>
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-cursive text-vibe-yellow text-xl mb-1">curated just for you</p>
              <h2 className="font-display text-4xl sm:text-5xl text-white uppercase leading-tight">
                GETAWAY.GH<br />PICKS THIS WEEK
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-vibe-yellow text-vibe-navy font-display text-sm px-4 py-2 rounded-full border-2 border-white shrink-0">
              ✦ EDITOR'S CHOICE
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {editorialProps.map((p, i) => (
              <div key={p.id} className="relative">
                {i === 0 && (
                  <div className="absolute -top-3 -right-3 z-20 w-14 h-14 bg-vibe-yellow border-2 border-vibe-navy rounded-full flex items-center justify-center shadow-btn rotate-12">
                    <span className="font-display text-vibe-navy text-xs leading-tight text-center">#1<br/>PICK</span>
                  </div>
                )}
                <PropertyCard property={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCRAPBOOK CTA ────────────────────────────────── */}
      <section className="px-4 py-14 bg-vibe-blue polka-bg relative overflow-hidden">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex items-start gap-2 pointer-events-none">
          {[
            { rotate: '-8deg', bg: 'bg-white', label: 'GETAWAY: 10/10', seed: 'polar1' },
            { rotate: '4deg',  bg: 'bg-vibe-yellow', label: '', seed: 'polar2' },
            { rotate: '13deg', bg: 'bg-white', label: '', seed: 'polar3' },
          ].map((p, i) => (
            <div key={i} className={`${p.bg} w-28 h-36 rounded border-2 border-vibe-navy shadow-card flex flex-col`}
              style={{ transform: `rotate(${p.rotate})`, marginTop: i * 8 }}>
              <div className="flex-1 bg-gray-100 m-2 rounded-sm overflow-hidden">
                <img src={`https://picsum.photos/seed/${p.seed}/200/150`} alt="" className="w-full h-full object-cover" />
              </div>
              {p.label && <p className="font-cursive text-vibe-navy text-xs text-center pb-2">{p.label}</p>}
            </div>
          ))}
        </div>

        <div className="max-w-lg relative z-10">
          <p className="font-cursive text-vibe-yellow text-2xl mb-2">save your favourite spots</p>
          <h2 className="font-display text-5xl sm:text-6xl text-white uppercase leading-tight mb-4">
            ADD TO THE<br />SCRAPBOOK
          </h2>
          <p className="font-body font-bold text-white/90 text-base mb-8 max-w-sm leading-relaxed">
            Found a hidden gem in Ghana? Save it to your trip board and share it with friends planning their next getaway.
          </p>
          <Link to="/board" className="vibe-btn inline-flex items-center gap-2 bg-vibe-yellow text-vibe-navy font-display text-base px-8 py-4 rounded-full border-2 border-vibe-navy">
            UPLOAD PHOTOS 📸
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-vibe-navy py-6 text-center">
        <p className="font-body font-bold text-white/60 text-sm">Getaway.gh — Discover Ghana © 2025</p>
      </footer>
    </div>
  )
}
