import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import { properties, TYPES, ACTIVITIES } from '../data/properties'
import { searchProperties } from '../utils/searchEngine'
import { DEPARTURE_CITIES } from '../utils/driveTime'

// ── Constants ─────────────────────────────────────────────────────────────────

const LOADER_STEPS = [
  'Reading your vibe...',
  `Scanning ${properties.length} spots across Ghana...`,
  'Ranking by best match...',
]

const SORT_OPTIONS = [
  { id: 'match',      label: 'Best match' },
  { id: 'price-asc',  label: 'Price: low → high' },
  { id: 'price-desc', label: 'Price: high → low' },
  { id: 'rating',     label: 'Highest rated' },
]

// ── Sidebar component ─────────────────────────────────────────────────────────

function SearchSidebar({ baseResults, filters, setFilters, onClose }) {
  const { regions, types, activities, priceRange, fromCity } = filters

  const availableRegions = useMemo(() => {
    const counts = {}
    baseResults.forEach(p => { if (p.region) counts[p.region] = (counts[p.region] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [baseResults])

  const maxPriceInResults = useMemo(() =>
    Math.max(...baseResults.map(p => p.priceGHS || 0).filter(Boolean), 3000)
  , [baseResults])

  function toggleSet(key, value) {
    setFilters(prev => {
      const current = prev[key]
      const next = current.includes(value)
        ? current.filter(x => x !== value)
        : [...current, value]
      return { ...prev, [key]: next }
    })
  }

  const activeCount =
    regions.length + types.length + activities.length +
    (priceRange[1] < maxPriceInResults ? 1 : 0)

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b-2 border-gray-100 shrink-0">
        <span className="font-display text-base text-vibe-navy uppercase">Filters {activeCount > 0 && `(${activeCount})`}</span>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={() => setFilters({ regions: [], types: [], activities: [], priceRange: [0, maxPriceInResults], fromCity: 'Accra' })}
              className="font-body text-xs text-vibe-red font-bold hover:underline"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="font-body text-lg text-gray-400 hover:text-vibe-navy leading-none">✕</button>
          )}
        </div>
      </div>

      {/* Scrollable filter body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

        {/* Region */}
        <details open>
          <summary className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider cursor-pointer mb-3 list-none flex justify-between">
            Region <span className="text-gray-400 font-normal">▾</span>
          </summary>
          <div className="space-y-2">
            {availableRegions.map(([region, count]) => (
              <label key={region} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={regions.includes(region)}
                  onChange={() => toggleSet('regions', region)}
                  className="w-4 h-4 rounded border-2 border-gray-300 accent-vibe-red"
                />
                <span className="font-body text-sm text-vibe-navy group-hover:font-bold transition-all flex-1">{region}</span>
                <span className="font-body text-xs text-gray-400">{count}</span>
              </label>
            ))}
          </div>
        </details>

        {/* Price range */}
        <details open>
          <summary className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider cursor-pointer mb-3 list-none flex justify-between">
            Price / night <span className="text-gray-400 font-normal">▾</span>
          </summary>
          <div>
            <div className="flex justify-between font-body text-xs text-gray-500 mb-2">
              <span>GHS 0</span>
              <span className="font-bold text-vibe-navy">up to GHS {priceRange[1].toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPriceInResults}
              step={100}
              value={priceRange[1]}
              onChange={e => setFilters(prev => ({ ...prev, priceRange: [0, +e.target.value] }))}
              className="w-full accent-vibe-red"
            />
          </div>
        </details>

        {/* Type */}
        <details open>
          <summary className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider cursor-pointer mb-3 list-none flex justify-between">
            Type <span className="text-gray-400 font-normal">▾</span>
          </summary>
          <div className="space-y-2">
            {TYPES.map(t => (
              <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={types.includes(t)}
                  onChange={() => toggleSet('types', t)}
                  className="w-4 h-4 rounded border-2 border-gray-300 accent-vibe-red"
                />
                <span className="font-body text-sm text-vibe-navy group-hover:font-bold transition-all">{t}</span>
              </label>
            ))}
          </div>
        </details>

        {/* Activities */}
        <details open>
          <summary className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider cursor-pointer mb-3 list-none flex justify-between">
            Activities <span className="text-gray-400 font-normal">▾</span>
          </summary>
          <div className="space-y-2">
            {ACTIVITIES.map(a => (
              <label key={a.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={activities.includes(a.id)}
                  onChange={() => toggleSet('activities', a.id)}
                  className="w-4 h-4 rounded border-2 border-gray-300 accent-vibe-red"
                />
                <span className="font-body text-sm text-vibe-navy group-hover:font-bold transition-all">{a.emoji} {a.label}</span>
              </label>
            ))}
          </div>
        </details>

        {/* Drive from */}
        <details open>
          <summary className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider cursor-pointer mb-3 list-none flex justify-between">
            🚗 Drive from <span className="text-gray-400 font-normal">▾</span>
          </summary>
          <div className="space-y-2">
            {DEPARTURE_CITIES.map(c => (
              <label key={c.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="fromCity"
                  checked={fromCity === c.id}
                  onChange={() => setFilters(prev => ({ ...prev, fromCity: c.id }))}
                  className="w-4 h-4 accent-vibe-red"
                />
                <span className="font-body text-sm text-vibe-navy group-hover:font-bold transition-all">{c.id}</span>
              </label>
            ))}
          </div>
        </details>

      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const query          = searchParams.get('q') || ''

  const [loading,     setLoading]     = useState(true)
  const [loaderStep,  setLoaderStep]  = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sortBy,      setSortBy]      = useState('match')
  const [inlineQuery, setInlineQuery] = useState(query)
  const [filters, setFilters] = useState({
    regions:    [],
    types:      [],
    activities: [],
    priceRange: [0, 5000],
    fromCity:   'Accra',
  })

  const { results: baseResults, summary } = useMemo(
    () => searchProperties(query, properties),
    [query]
  )

  const filteredResults = useMemo(() => {
    let res = baseResults
    if (filters.regions.length)    res = res.filter(p => filters.regions.includes(p.region))
    if (filters.types.length)      res = res.filter(p => filters.types.includes(p.type))
    if (filters.activities.length) res = res.filter(p => filters.activities.some(a => p.activities?.includes(a)))
    res = res.filter(p => !p.priceGHS || p.priceGHS <= filters.priceRange[1])

    if (sortBy === 'price-asc')  return [...res].sort((a, b) => (a.priceGHS || 9999) - (b.priceGHS || 9999))
    if (sortBy === 'price-desc') return [...res].sort((a, b) => (b.priceGHS || 0) - (a.priceGHS || 0))
    if (sortBy === 'rating')     return [...res].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return res
  }, [baseResults, filters, sortBy])

  const maxPriceInResults = useMemo(() =>
    Math.max(...baseResults.map(p => p.priceGHS || 0).filter(Boolean), 3000)
  , [baseResults])

  const activeFilterCount =
    filters.regions.length + filters.types.length + filters.activities.length +
    (filters.priceRange[1] < maxPriceInResults ? 1 : 0)

  // Sync inline search input when query param changes
  useEffect(() => { setInlineQuery(query) }, [query])

  // Pre-select all regions found in results so users can uncheck to narrow
  useEffect(() => {
    if (baseResults.length === 0) return
    const uniqueRegions = [...new Set(baseResults.map(p => p.region).filter(Boolean))]
    setFilters(prev => ({ ...prev, regions: uniqueRegions }))
  }, [baseResults])

  useEffect(() => {
    if (!query) { setLoading(false); return }
    setLoading(true)
    setLoaderStep(0)
    const t1 = setTimeout(() => setLoaderStep(1), 400)
    const t2 = setTimeout(() => setLoaderStep(2), 900)
    const t3 = setTimeout(() => setLoading(false), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [query])

  useEffect(() => {
    function handleResize() { if (window.innerWidth >= 1024) setSidebarOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function handleInlineSearch(e) {
    e.preventDefault()
    const q = inlineQuery.trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-vibe-navy flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border-2 border-vibe-navy shadow-card p-8 max-w-sm w-full">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl" style={{ display: 'inline-block', animation: 'spin 1.5s linear infinite' }}>✦</span>
            <div>
              <p className="font-display text-lg text-vibe-navy uppercase leading-tight">Finding your perfect getaway...</p>
              <p className="font-body text-xs text-gray-400 mt-1">Searching {properties.length} spots across Ghana</p>
            </div>
          </div>
          <div className="space-y-3">
            {LOADER_STEPS.map((step, i) => {
              const done   = i < loaderStep
              const active = i === loaderStep
              return (
                <div key={i} className="flex items-center gap-3 font-body text-sm font-semibold">
                  {done ? (
                    <span className="text-green-500 text-base shrink-0">✓</span>
                  ) : active ? (
                    <span className="w-4 h-4 border-2 border-vibe-red border-t-transparent rounded-full shrink-0" style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                  )}
                  <span className={done || active ? 'text-vibe-navy' : 'text-gray-300'}>{step}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* AI Answer Banner — sticky */}
      <div className="bg-vibe-navy pt-24 pb-5 px-4 sticky top-0 z-40 border-b-2 border-vibe-navy/50 shadow-sm">
        <div className="max-w-6xl mx-auto relative text-center">
          <p className="font-body font-extrabold text-vibe-yellow text-xs uppercase tracking-widest mb-1">✨ Getaway AI</p>
          <p className="font-body text-white text-sm leading-snug max-w-2xl mx-auto">
            {summary || `Showing results for "${query}"`}
          </p>
          <button
            onClick={() => navigate('/')}
            className="absolute right-0 top-0 font-body font-bold text-xs text-white/50 hover:text-white transition-colors"
          >
            New search ✕
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex min-h-[calc(100vh-120px)]">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 min-w-[240px] border-r-2 border-gray-200 bg-white shrink-0 sticky top-[88px] h-[calc(100vh-88px)] overflow-hidden">
          <SearchSidebar
            baseResults={baseResults}
            filters={filters}
            setFilters={setFilters}
            onClose={null}
          />
        </aside>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 z-50 shadow-2xl lg:hidden flex flex-col">
              <SearchSidebar
                baseResults={baseResults}
                filters={filters}
                setFilters={setFilters}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* Results column */}
        <div className="flex-1 px-4 py-6 min-w-0">

          {/* Inline search bar */}
          <form onSubmit={handleInlineSearch} className="mb-5">
            <div className="flex items-center bg-white rounded-full border-2 border-vibe-navy shadow-btn overflow-hidden pr-1.5 pl-5 py-1.5 focus-within:border-vibe-yellow transition-colors max-w-lg">
              <span className="text-lg mr-3 shrink-0">✨</span>
              <input
                type="text"
                value={inlineQuery}
                onChange={e => setInlineQuery(e.target.value)}
                placeholder='Try "beach escape under GHS 1000"...'
                className="flex-1 font-body text-sm text-vibe-navy bg-transparent outline-none placeholder:text-gray-400 placeholder:italic"
              />
              <button
                type="submit"
                className="shrink-0 bg-vibe-red text-white font-display text-sm px-5 py-2.5 rounded-full border-2 border-vibe-navy hover:bg-vibe-navy transition-colors ml-2 whitespace-nowrap"
              >
                ASK AI →
              </button>
            </div>
          </form>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 font-body font-extrabold text-sm text-vibe-navy bg-white border-2 border-vibe-navy px-4 py-2 rounded-full shadow-btn hover:bg-vibe-yellow transition-colors"
            >
              ⚙️ Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            <p className="font-body text-sm text-gray-500 font-semibold">
              <span className="text-vibe-navy font-extrabold">{filteredResults.length}</span> spot{filteredResults.length !== 1 ? 's' : ''}
              {baseResults.length !== filteredResults.length && ` of ${baseResults.length}`}
            </p>

            <div className="ml-auto flex items-center gap-2">
              <label className="font-body text-xs text-gray-500 font-semibold hidden sm:block">Sort:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="font-body text-sm border-2 border-vibe-navy rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-vibe-yellow bg-white"
              >
                {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Empty state */}
          {filteredResults.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-4xl text-vibe-navy uppercase mb-4">No spots found 😅</p>
              <p className="font-body text-gray-500 mb-6">Try removing a filter or start a new search.</p>
              <button
                onClick={() => setFilters({ regions: [], types: [], activities: [], priceRange: [0, maxPriceInResults], fromCity: 'Accra' })}
                className="font-body font-extrabold text-sm bg-vibe-navy text-white px-6 py-3 rounded-full border-2 border-vibe-navy hover:bg-vibe-red transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredResults.map((p, idx) => (
                <div key={p.id} className="relative">
                  {idx < 3 && (
                    <div className="absolute top-3 left-12 z-20 bg-vibe-yellow text-vibe-navy font-display text-xs px-2.5 py-0.5 rounded-full border border-vibe-navy shadow-sm">
                      {idx === 0 ? '🏅 #1 AI Pick' : idx === 1 ? '🥈 #2' : '🥉 #3'}
                    </div>
                  )}
                  <PropertyCard property={p} fromCity={filters.fromCity} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
