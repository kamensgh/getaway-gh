import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import SearchBar from '../components/SearchBar'
import { MOVIES, GENRES, LANGUAGES, DECADES, TYPES, REGIONS } from '../data/movies'

function fuzzScore(query, movie) {
  if (!query.trim()) return 1
  const q = query.toLowerCase()
  let score = 0
  if (movie.title.toLowerCase().includes(q))                score += 100
  if (movie.title.toLowerCase().startsWith(q))              score += 50
  if (movie.director?.toLowerCase().includes(q))            score += 60
  if (movie.cast?.some(c => c.toLowerCase().includes(q)))   score += 50
  if (movie.genre?.some(g => g.toLowerCase().includes(q)))  score += 30
  if (movie.synopsis?.toLowerCase().includes(q))            score += 20
  if (movie.tags?.some(t => t.toLowerCase().includes(q)))   score += 20
  if (movie.language?.some(l => l.toLowerCase().includes(q))) score += 15
  const s = movie.title.toLowerCase()
  let qi = 0
  for (let i = 0; i < s.length && qi < q.length; i++) { if (s[i] === q[qi]) qi++ }
  if (qi === q.length && q.length >= 3) score += 5
  return score
}

function FilterSection({ title, options, value, onChange }) {
  return (
    <div className="mb-6">
      <p className="font-ui text-[10px] uppercase tracking-widest text-[#6B5A47] mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const active = value === opt
          return (
            <button
              key={opt}
              onClick={() => onChange(active ? options[0] : opt)}
              className={`rounded-full border px-3 py-1 font-ui text-xs transition-all ${
                active
                  ? 'border-[#C8922A] bg-[#C8922A] text-[#0E0A07] font-bold'
                  : 'border-[#2A1E12] text-[#C4B49A] hover:border-[#4A3A2A] hover:text-[#F5E6C8]'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const initialQ    = params.get('q') || ''
  const initialSort = params.get('sort') || 'relevance'
  const initialType = params.get('type') || 'All Types'

  const [query,    setQuery]    = useState(initialQ)
  const [sort,     setSort]     = useState(initialSort)
  const [genre,    setGenre]    = useState('All')
  const [language, setLanguage] = useState('All Languages')
  const [decade,   setDecade]   = useState('All Decades')
  const [type,     setType]     = useState(initialType)
  const [region,   setRegion]   = useState('All Regions')
  const [sideOpen, setSideOpen] = useState(() => window.innerWidth >= 1024)

  useEffect(() => {
    if (params.get('q')) setQuery(params.get('q'))
    if (params.get('sort')) setSort(params.get('sort'))
    if (params.get('type')) setType(params.get('type') === 'tv-series' ? 'TV Series' : 'All Types')
  }, [params])

  // Close sidebar on resize to small
  useEffect(() => {
    const onResize = () => { if (window.innerWidth < 1024) setSideOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const results = useMemo(() => {
    let list = MOVIES.map(m => ({ movie: m, score: fuzzScore(query, m) }))
    if (query.trim()) list = list.filter(({ score }) => score > 0)

    list = list.filter(({ movie: m }) => {
      if (genre !== 'All' && !m.genre?.includes(genre.toLowerCase()))               return false
      if (language !== 'All Languages' && !m.language?.includes(language.toLowerCase())) return false
      if (region !== 'All Regions' && m.region !== region)                          return false
      if (decade === 'Pre-1980s (Before 1980)'  && m.year >= 1980)                  return false
      if (decade === 'Early 80s (1980–1984)'   && (m.year < 1980 || m.year > 1984)) return false
      if (decade === 'Late 80s (1985–1989)'    && (m.year < 1985 || m.year > 1989)) return false
      if (decade === 'Early 90s (1990–1994)'   && (m.year < 1990 || m.year > 1994)) return false
      if (decade === 'Late 90s (1995–1999)'    && (m.year < 1995 || m.year > 1999)) return false
      if (decade === 'Early 2000s (2000+)'     && m.year < 2000)                    return false
      if (type === 'Movie'       && m.type !== 'movie')       return false
      if (type === 'TV Series'   && m.type !== 'tv-series')   return false
      if (type === 'Documentary' && m.type !== 'documentary') return false
      return true
    })

    if (sort === 'rating' || !query.trim()) {
      list.sort((a, b) => b.movie.rating - a.movie.rating)
    } else if (sort === 'year-new') {
      list.sort((a, b) => b.movie.year - a.movie.year)
    } else if (sort === 'year-old') {
      list.sort((a, b) => a.movie.year - b.movie.year)
    } else {
      list.sort((a, b) => b.score - a.score)
    }

    return list.map(({ movie }) => movie)
  }, [query, sort, genre, language, decade, type, region])

  const hasFilters = genre !== 'All' || language !== 'All Languages' || decade !== 'All Decades' || type !== 'All Types' || region !== 'All Regions'

  const clearFilters = () => {
    setGenre('All'); setLanguage('All Languages')
    setDecade('All Decades'); setType('All Types'); setRegion('All Regions')
  }

  const didYouMean = results.length === 0 && query.length >= 3
    ? [...MOVIES].sort((a, b) => {
        const sa = a.title.toLowerCase().split('').filter(c => query.toLowerCase().includes(c)).length
        const sb = b.title.toLowerCase().split('').filter(c => query.toLowerCase().includes(c)).length
        return sb - sa
      }).slice(0, 3)
    : []

  return (
    <div className="page-enter min-h-screen bg-[#0E0A07] pt-20">
      <div className="kente-border h-0.5 w-full opacity-60"/>

      {/* Search header */}
      <div className="border-b border-[#1F160D] bg-[#0E0A07]/95 backdrop-blur-md px-4 sm:px-8 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto">
          <SearchBar large initialValue={query} />
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sideOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setSideOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto flex px-4 sm:px-6 lg:px-8 py-6 gap-0 lg:gap-8">

        {/* Sidebar — drawer on mobile, inline on desktop */}
        <aside className={`
          fixed lg:sticky lg:top-24 left-0 top-0 z-50 lg:z-auto
          h-full lg:h-auto
          w-72 lg:w-56 xl:w-64
          shrink-0
          overflow-y-auto lg:overflow-visible
          bg-[#0C0805] lg:bg-transparent
          border-r border-[#1F160D] lg:border-0
          pt-20 lg:pt-0
          px-6 lg:px-0
          transition-transform duration-300 ease-in-out
          ${sideOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${!sideOpen ? 'lg:hidden' : ''}
        `}>
          <div className="lg:pr-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-ui text-sm font-bold text-[#F5E6C8]">Filters</h2>
              <div className="flex items-center gap-3">
                {hasFilters && (
                  <button onClick={clearFilters} className="font-ui text-xs text-[#C8922A] hover:underline">
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setSideOpen(false)}
                  className="lg:hidden text-[#6B5A47] hover:text-[#C4B49A]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <FilterSection title="Genre"    options={GENRES}     value={genre}    onChange={setGenre} />
            <FilterSection title="Language" options={LANGUAGES}  value={language} onChange={setLanguage} />
            <FilterSection title="Decade"   options={DECADES}    value={decade}   onChange={setDecade} />
            <FilterSection title="Type"     options={TYPES}      value={type}     onChange={setType} />
            <FilterSection title="Region"   options={REGIONS}    value={region}   onChange={setRegion} />
          </div>
        </aside>

        {/* Main results */}
        <main className="flex-1 min-w-0">

          {/* Results header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSideOpen(!sideOpen)}
                className="flex items-center gap-1.5 rounded-full border border-[#2A1E12] px-3 py-1.5 font-ui text-xs text-[#C4B49A] hover:border-[#4A3A2A] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 6h18M6 12h12M9 18h6"/>
                </svg>
                {sideOpen ? 'Hide filters' : 'Filters'}
                {hasFilters && (
                  <span className="ml-0.5 rounded-full bg-[#C8922A] text-[#0E0A07] font-bold px-1.5 py-px text-[9px]">
                    {[genre !== 'All', language !== 'All Languages', decade !== 'All Decades', type !== 'All Types', region !== 'All Regions'].filter(Boolean).length}
                  </span>
                )}
              </button>

              <p className="font-ui text-sm text-[#C4B49A]">
                {query ? (
                  <>
                    <span className="text-[#F5E6C8] font-semibold">{results.length}</span>
                    {' '}result{results.length !== 1 ? 's' : ''} for{' '}
                    <span className="text-[#C8922A]">"{query}"</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#F5E6C8] font-semibold">{results.length}</span>
                    {' '}titles{hasFilters ? ' (filtered)' : ' in archive'}
                  </>
                )}
              </p>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline font-ui text-xs text-[#6B5A47]">Sort:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="rounded-lg border border-[#2A1E12] bg-[#1F160D] px-2 py-1.5 font-ui text-xs text-[#C4B49A] outline-none focus:border-[#C8922A44]"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Highest Rated</option>
                <option value="year-new">Newest First</option>
                <option value="year-old">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                genre !== 'All' && genre,
                language !== 'All Languages' && language,
                decade !== 'All Decades' && decade,
                type !== 'All Types' && type,
                region !== 'All Regions' && region,
              ].filter(Boolean).map(f => (
                <span key={f} className="flex items-center gap-1 rounded-full bg-[#C8922A]/15 border border-[#C8922A]/30 px-3 py-1 font-ui text-xs text-[#C8922A]">
                  {f}
                  <button onClick={() => {
                    if (f === genre)    setGenre('All')
                    if (f === language) setLanguage('All Languages')
                    if (f === decade)   setDecade('All Decades')
                    if (f === type)     setType('All Types')
                    if (f === region)   setRegion('All Regions')
                  }} className="ml-1 hover:text-[#E0A83A] text-base leading-none">×</button>
                </span>
              ))}
            </div>
          )}

          {/* Empty state */}
          {results.length === 0 && (
            <div className="py-16 text-center">
              <div className="mb-6 text-6xl opacity-20">🎬</div>
              <h3 className="font-display text-xl font-black text-[#F5E6C8] mb-2">No results found</h3>
              {query && (
                <p className="font-body text-sm text-[#6B5A47] mb-6">
                  No titles match <span className="text-[#C4B49A]">"{query}"</span>
                  {hasFilters ? ' with these filters' : ''}
                </p>
              )}
              {didYouMean.length > 0 && (
                <div>
                  <p className="font-ui text-xs uppercase tracking-widest text-[#6B5A47] mb-3">Did you mean?</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {didYouMean.map(m => (
                      <button key={m.id} onClick={() => navigate(`/film/${m.slug}`)}
                        className="rounded-full border border-[#C8922A]/40 px-4 py-2 font-ui text-sm text-[#C8922A] hover:bg-[#C8922A] hover:text-[#0E0A07] transition-colors">
                        {m.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {hasFilters && (
                <button onClick={clearFilters} className="mt-4 font-ui text-sm text-[#C8922A] hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Results grid — 2 cols sm, 3 cols md, 4 cols lg+ */}
          {results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {results.map(movie => (
                <MovieCard key={movie.id} movie={movie} size="md"/>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
