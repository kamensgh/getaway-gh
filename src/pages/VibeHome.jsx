import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import ActivityFilter from '../components/ActivityFilter'
import { properties, REGIONS, TYPES, EDITORIAL_PICKS } from '../data/properties'
import { DEPARTURE_CITIES } from '../utils/driveTime'
import { getUpcomingFestivals } from '../data/festivals'
import socialFeed from '../data/social-feed.json'

const TAGLINES = [
  'Where in Ghana are you escaping to?',
  "Oya let's go — your next getaway awaits 🔥",
  'Every great trip starts with the right spot.',
  'From Accra to Ada. From Boti to Busua.',
  "The weekend is calling. Who's answering?",
]

const SEARCH_PLACEHOLDERS = [
  'Try "beach escape under GHS 1000"...',
  'Find me something near Kumasi for the family...',
  'Romantic getaway, 2 nights, not too far...',
  'Safari weekend near Mole National Park...',
  'Eco retreat in the Volta region...',
  'Group trip for 8 friends, budget-friendly...',
  'Cool mountain escape with a waterfall...',
]

const QUICK_CHIPS = [
  { label: '🌊 Beach weekend',    query: 'beach weekend' },
  { label: '🦁 Safari & wildlife', query: 'safari wildlife mole' },
  { label: '💑 Romantic escape',  query: 'romantic couple escape' },
  { label: '🎉 Group trip',       query: 'group trip friends' },
  { label: '🌿 Eco retreat',      query: 'eco retreat nature' },
  { label: '❄️ Cool & refreshing', query: 'cool mountain waterfall refreshing' },
  { label: '🏛️ Cultural trip',    query: 'cultural history heritage' },
  { label: '💰 Budget under 500', query: 'budget under GHS 500' },
]

export default function VibeHome() {
  const [taglineIdx, setTaglineIdx] = useState(0)
  const [taglineKey, setTaglineKey] = useState(0)
  const [showFilters, setShowFilters] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery]   = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchWrapperRef = useRef(null)
  const [typedText,   setTypedText]   = useState('')
  const [phraseIdx,   setPhraseIdx]   = useState(0)
  const [isDeleting,  setIsDeleting]  = useState(false)

  const handleSearch = useCallback((q) => {
    const trimmed = (q || searchQuery).trim()
    if (!trimmed) return
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }, [searchQuery, navigate])

  const selectedActivities = useMemo(() => {
    const a = searchParams.get('activities')
    return a ? a.split(',').filter(Boolean) : []
  }, [searchParams])

  const region   = searchParams.get('region') || ''
  const type     = searchParams.get('type')   || ''
  const city     = searchParams.get('city')   || ''
  const fromCity = searchParams.get('from')   || 'Accra'

  const setParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (!value) next.delete(key)
      else next.set(key, value)
      return next
    }, { replace: true })
  }, [setSearchParams])

  const setRegion = (v) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (!v) next.delete('region'); else next.set('region', v)
      next.delete('city') // reset city when region changes
      return next
    }, { replace: true })
  }
  const setType     = (v) => setParam('type', v)
  const setCity     = (v) => setParam('city', v)
  const setFromCity = (v) => setParam('from', v)

  const upcomingFestivals = useMemo(() => getUpcomingFestivals(3), [])

  const cityOptions = useMemo(() => {
    const source = region ? properties.filter(p => p.region === region) : properties
    const counts = {}
    source.forEach(p => { if (p.city) counts[p.city] = (counts[p.city] || 0) + 1 })
    return Object.entries(counts)
      .filter(([, n]) => !region || n >= 1) // show all cities within a region
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([city]) => city)
  }, [region])

  useEffect(() => {
    const id = setInterval(() => {
      setTaglineIdx(i => (i + 1) % TAGLINES.length)
      setTaglineKey(k => k + 1)
    }, 3200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (searchQuery) return  // pause while user is typing
    const phrase = SEARCH_PLACEHOLDERS[phraseIdx]
    let delay
    if (!isDeleting && typedText === phrase) {
      delay = setTimeout(() => setIsDeleting(true), 1800)
    } else if (isDeleting && typedText === '') {
      setIsDeleting(false)
      setPhraseIdx(i => (i + 1) % SEARCH_PLACEHOLDERS.length)
      return
    } else if (isDeleting) {
      delay = setTimeout(() => setTypedText(t => t.slice(0, -1)), 35)
    } else {
      delay = setTimeout(() => setTypedText(phrase.slice(0, typedText.length + 1)), 60)
    }
    return () => clearTimeout(delay)
  }, [typedText, isDeleting, phraseIdx, searchQuery])

  // ── Location suggestions ─────────────────────────────────────────────────
  const allSuggestions = useMemo(() => {
    const cities   = [...new Set(properties.map(p => p.city).filter(Boolean))]
      .map(c => ({ label: c, type: 'city', icon: '📍' }))
    const regions  = REGIONS.map(r => ({ label: r, type: 'region', icon: '🗺️' }))
    const propNames = properties
      .filter(p => p.vibeScore >= 8)
      .map(p => ({ label: p.name, type: 'property', icon: '🏠', id: p.id }))
    return [...regions, ...cities, ...propNames]
  }, [])

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q || q.length < 2) return []
    return allSuggestions
      .filter(s => s.label.toLowerCase().includes(q))
      .slice(0, 6)
  }, [searchQuery, allSuggestions])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const activitySectionRef = useRef(null)
  const cityBtnRefs = useRef({})

  // Scroll selected city pill into view on mobile when fromCity changes
  useEffect(() => {
    if (window.innerWidth >= 1024) return
    const el = cityBtnRefs.current[fromCity]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [fromCity])

  const clearAllActivities = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.delete('activities')
      return next
    }, { replace: true })
  }, [setSearchParams])

  const toggleActivity = useCallback((id) => {
    // Desktop only: scroll so the activity section sits just under the navbar
    if (window.innerWidth >= 1024 && activitySectionRef.current) {
      const top = activitySectionRef.current.getBoundingClientRect().top + window.scrollY - 72
      window.scrollTo({ top, behavior: 'smooth' })
    }
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      const current = (next.get('activities') || '').split(',').filter(Boolean)
      const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
      if (updated.length === 0) next.delete('activities')
      else next.set('activities', updated.join(','))
      return next
    }, { replace: true })
  }, [setSearchParams])

  const editorialProps = useMemo(() => properties.filter(p => EDITORIAL_PICKS.includes(p.id)), [])

  const filtered = useMemo(() => properties.filter(p => {
    if (selectedActivities.length > 0 && !selectedActivities.some(a => p.activities.includes(a))) return false
    if (region && p.region !== region) return false
    if (type && p.type !== type) return false
    if (city && p.city !== city) return false
    return true
  }), [selectedActivities, region, type, city])

  return (
    <div className="min-h-screen bg-vibe-red">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-28 pb-10 px-4 overflow-hidden">
        <div className="absolute top-28 left-6 text-white text-4xl opacity-80 animate-float select-none pointer-events-none">✦</div>
        <div className="absolute top-44 right-10 text-white text-2xl opacity-50 animate-float select-none pointer-events-none" style={{ animationDelay: '1.2s' }}>✦</div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p key={taglineKey} className="font-cursive text-2xl sm:text-3xl text-vibe-yellow mb-3 animate-tagline">
            {TAGLINES[taglineIdx]}
          </p>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl text-white uppercase leading-none tracking-tight mb-6">
            YOUR NEXT<br />GETAWAY
          </h1>
          {/* AI Search bar */}
          <div ref={searchWrapperRef} className="relative max-w-xl mx-auto mb-6">
            <div className={`flex items-center bg-white border-2 border-vibe-navy shadow-btn overflow-hidden pr-1.5 pl-5 py-1.5 transition-colors focus-within:border-vibe-yellow ${showSuggestions && suggestions.length > 0 ? 'rounded-t-3xl rounded-b-none border-b-0' : 'rounded-full'}`}>
              <span className="text-xl mr-3 shrink-0">✨</span>
              <div className="relative flex-1 flex items-center h-8">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true) }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { setShowSuggestions(false); handleSearch() }
                    if (e.key === 'Escape') setShowSuggestions(false)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full font-body text-sm text-vibe-navy bg-transparent outline-none"
                />
                {!searchQuery && (
                  <span className="absolute inset-0 flex items-center pointer-events-none font-body text-sm italic text-gray-400 whitespace-nowrap overflow-hidden">
                    {typedText}<span className="animate-pulse not-italic text-gray-300">|</span>
                  </span>
                )}
              </div>
              <button
                onClick={() => { setShowSuggestions(false); handleSearch() }}
                className="shrink-0 bg-vibe-red text-white font-display text-sm px-5 py-2.5 rounded-full border-2 border-vibe-navy hover:bg-vibe-navy transition-colors ml-2 whitespace-nowrap"
              >
                ASK AI →
              </button>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 bg-white border-2 border-t-0 border-vibe-navy rounded-b-3xl shadow-btn overflow-hidden z-50">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={e => {
                      e.preventDefault()
                      setSearchQuery(s.label)
                      setShowSuggestions(false)
                      handleSearch(s.label)
                    }}
                    className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-vibe-yellow/20 transition-colors text-left border-t border-gray-100 first:border-t-0"
                  >
                    <span className="text-base shrink-0">{s.icon}</span>
                    <span className="font-body text-sm text-vibe-navy font-semibold flex-1">{s.label}</span>
                    <span className="font-body text-xs text-gray-400 capitalize">{s.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="inline-flex items-center bg-vibe-yellow text-vibe-navy font-body font-extrabold text-base px-6 py-3 rounded-full border-2 border-vibe-navy shadow-btn mb-6">
            Hotels • Lodges • Beach Houses • Airbnb
          </div>

        </div>
      </section>

      {/* ── ACTIVITY FILTER ──────────────────────────────── */}
      <section ref={activitySectionRef} className="px-4 py-8 bg-vibe-navy">
        <div className="max-w-5xl mx-auto">
          <p className="font-cursive text-vibe-yellow text-xl text-center mb-5">what's your getaway style?</p>
          <ActivityFilter selected={selectedActivities} onToggle={toggleActivity} onClearAll={clearAllActivities} />
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

          {showFilters && (
            <div className="mb-6 p-5 bg-white rounded-2xl border-2 border-vibe-navy shadow-card space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider block mb-2">Region</label>
                  <select value={region} onChange={e => setRegion(e.target.value)}
                    className="w-full border-2 border-vibe-navy rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-vibe-blue">
                    <option value="">All regions</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider block mb-2">City / District</label>
                  <select value={city} onChange={e => setCity(e.target.value)}
                    className="w-full border-2 border-vibe-navy rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-vibe-blue disabled:opacity-40"
                    disabled={cityOptions.length === 0}>
                    <option value="">All cities</option>
                    {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
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

              {/* Driving from */}
              <div className="border-t border-gray-100 pt-4">
                <label className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider block mb-2">🚗 Driving from</label>
                {/* Mobile: single-row horizontal scroll */}
                <div
                  className="lg:hidden overflow-x-auto pb-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                  <div className="flex gap-2" style={{ width: 'max-content' }}>
                    {DEPARTURE_CITIES.map(c => (
                      <button
                        key={c.id}
                        ref={el => { cityBtnRefs.current[c.id] = el }}
                        onClick={() => setFromCity(c.id)}
                        className={`font-body font-extrabold text-xs px-3 py-1.5 rounded-full border-2 whitespace-nowrap transition-colors ${fromCity === c.id ? 'bg-vibe-navy text-white border-vibe-navy' : 'text-vibe-navy border-vibe-navy/30 hover:border-vibe-navy'}`}
                      >
                        {c.id}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Desktop: wrapping flex (unchanged) */}
                <div className="hidden lg:flex flex-wrap gap-2">
                  {DEPARTURE_CITIES.map(c => (
                    <button key={c.id} onClick={() => setFromCity(c.id)}
                      className={`font-body font-extrabold text-xs px-3 py-1.5 rounded-full border-2 transition-colors ${fromCity === c.id ? 'bg-vibe-navy text-white border-vibe-navy' : 'text-vibe-navy border-vibe-navy/30 hover:border-vibe-navy'}`}>
                      {c.id}
                    </button>
                  ))}
                </div>
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
                onClick={() => setSearchParams({}, { replace: true })}
                className="vibe-btn bg-vibe-yellow text-vibe-navy font-display px-6 py-3 rounded-full border-2 border-vibe-navy">
                RESET ALL FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.slice(0, 32).map(p => <PropertyCard key={p.id} property={p} fromCity={fromCity} />)}
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
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {editorialProps.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING ON SOCIAL — hidden ──────────────────── */}

      {/* ── FESTIVAL TEASER ──────────────────────────────── */}
      <section className="px-4 py-12 bg-vibe-yellow">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-cursive text-vibe-navy text-xl mb-1">plan around culture</p>
              <h2 className="font-display text-4xl sm:text-5xl text-vibe-navy uppercase leading-tight">
                UPCOMING<br />FESTIVALS
              </h2>
            </div>
            <Link to="/festivals"
              className="hidden sm:flex font-body font-extrabold text-sm text-vibe-navy bg-white px-4 py-2 rounded-full border-2 border-vibe-navy shadow-btn hover:bg-vibe-red hover:text-white transition-colors shrink-0">
              Full calendar →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {upcomingFestivals.map(f => (
              <Link key={f.id} to="/festivals"
                className={`${f.color} rounded-2xl border-2 border-vibe-navy shadow-card p-5 block hover:scale-[1.02] transition-transform`}>
                <span className="text-3xl block mb-2">{f.emoji}</span>
                <h3 className="font-display text-lg text-white uppercase leading-tight mb-1">{f.name}</h3>
                <p className="font-cursive text-white/80 text-sm mb-2">{f.tagline}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="font-body font-extrabold text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full">📅 {f.displayDate}</span>
                  <span className="font-body font-extrabold text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full">📍 {f.location}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5 sm:hidden text-center">
            <Link to="/festivals" className="font-body font-extrabold text-sm text-vibe-navy underline">See full festival calendar →</Link>
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
            Found a hidden gem in Ghana? Save your spots and share them with friends planning their next getaway.
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
