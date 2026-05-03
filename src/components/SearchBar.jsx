import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOVIES, TRENDING_SEARCHES } from '../data/movies'

function fuzzMatch(query, str) {
  if (!query) return false
  const q = query.toLowerCase()
  const s = str.toLowerCase()
  if (s.includes(q)) return true
  // simple fuzzy: all chars in order
  let qi = 0
  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] === q[qi]) qi++
  }
  return qi === q.length && q.length >= 3
}

function scoreMovie(movie, query) {
  const q = query.toLowerCase()
  let score = 0
  if (movie.title.toLowerCase().includes(q))               score += 100
  if (movie.title.toLowerCase().startsWith(q))             score += 50
  if (movie.director?.toLowerCase().includes(q))           score += 60
  if (movie.cast?.some(c => c.toLowerCase().includes(q)))  score += 50
  if (movie.genre?.some(g => g.toLowerCase().includes(q))) score += 30
  if (movie.tags?.some(t => t.toLowerCase().includes(q)))  score += 20
  if (movie.language?.some(l => l.toLowerCase().includes(q))) score += 20
  if (fuzzMatch(q, movie.title))                           score += 10
  return score
}

export default function SearchBar({ large = false, initialValue = '' }) {
  const [query, setQuery]       = useState(initialValue)
  const [open, setOpen]         = useState(false)
  const [focused, setFocused]   = useState(false)
  const [history, setHistory]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('sk_history') || '[]') } catch { return [] }
  })
  const inputRef  = useRef(null)
  const wrapRef   = useRef(null)
  const navigate  = useNavigate()

  const results = query.trim().length > 0
    ? MOVIES
        .map(m => ({ movie: m, score: scoreMovie(m, query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(({ movie }) => movie)
    : []

  const didYouMean = results.length === 0 && query.length >= 3
    ? MOVIES
        .map(m => ({ movie: m, score: fuzzMatch(query, m.title) ? 1 : 0 }))
        .filter(({ score }) => score > 0)
        .slice(0, 3)
        .map(({ movie }) => movie)
    : []

  const showDropdown = focused && (query.length > 0 || history.length > 0)

  const saveHistory = useCallback((q) => {
    const next = [q, ...history.filter(h => h !== q)].slice(0, 6)
    setHistory(next)
    localStorage.setItem('sk_history', JSON.stringify(next))
  }, [history])

  const submit = useCallback((q) => {
    const term = (q || query).trim()
    if (!term) return
    saveHistory(term)
    setOpen(false)
    setFocused(false)
    inputRef.current?.blur()
    navigate(`/search?q=${encodeURIComponent(term)}`)
  }, [query, navigate, saveHistory])

  const goToMovie = useCallback((movie) => {
    saveHistory(movie.title)
    setOpen(false)
    setFocused(false)
    navigate(`/film/${movie.slug}`)
  }, [navigate, saveHistory])

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFocused(false)
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setFocused(false); setOpen(false); inputRef.current?.blur() }
      if (e.key === '/' && !focused && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [focused])

  const ratingColor = (r) => r >= 8.5 ? 'text-[#C8922A]' : r >= 7 ? 'text-[#E8741A]' : 'text-[#C4B49A]'

  return (
    <div ref={wrapRef} className={`relative w-full ${large ? 'max-w-2xl' : 'max-w-md'}`}>
      {/* Input */}
      <div className={`search-glow flex items-center gap-3 rounded-full border border-[#2A1E12] bg-[#1F160D] px-4 py-3 transition-all duration-300 ${focused ? 'border-[#C8922A44]' : ''} ${large ? 'py-4 px-6 text-lg' : ''}`}>
        <svg className={`shrink-0 text-[#C8922A] ${large ? 'w-6 h-6' : 'w-4 h-4'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setFocused(true); setOpen(true) }}
          onKeyDown={e => { if (e.key === 'Enter') submit() }}
          placeholder="Search films, directors, actors…"
          className={`flex-1 bg-transparent font-body text-[#F5E6C8] placeholder-[#6B5A47] outline-none ${large ? 'text-lg' : 'text-sm'}`}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="text-[#6B5A47] hover:text-[#C8922A] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
        {!large && !focused && (
          <span className="hidden sm:block shrink-0 rounded border border-[#2A1E12] px-1.5 py-0.5 font-ui text-[10px] text-[#6B5A47]">/</span>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-[#2A1E12] bg-[#161009] shadow-2xl shadow-black/60 overflow-hidden z-50 animate-fade-in">

          {/* Trending when empty */}
          {query.length === 0 && (
            <div className="p-4">
              {history.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 font-ui text-[10px] uppercase tracking-widest text-[#6B5A47]">Recent</p>
                  <div className="flex flex-wrap gap-2">
                    {history.map((h, i) => (
                      <button key={i} onClick={() => { setQuery(h); submit(h) }}
                        className="flex items-center gap-1.5 rounded-full border border-[#2A1E12] bg-[#1F160D] px-3 py-1 font-body text-xs text-[#C4B49A] hover:border-[#C8922A44] hover:text-[#F5E6C8] transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                        </svg>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="mb-2 font-ui text-[10px] uppercase tracking-widest text-[#6B5A47]">Trending</p>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((t, i) => (
                  <button key={i} onClick={() => { setQuery(t); submit(t) }}
                    className="flex items-center gap-1.5 rounded-full border border-[#2A1E12] px-3 py-1 font-body text-xs text-[#C4B49A] hover:border-[#C8922A44] hover:text-[#F5E6C8] transition-colors">
                    <span className="text-[#C8922A]">#</span>{t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live results */}
          {results.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1">
                <p className="font-ui text-[10px] uppercase tracking-widest text-[#6B5A47]">Results</p>
              </div>
              {results.map((movie) => (
                <button key={movie.id} onClick={() => goToMovie(movie)}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-[#1F160D] transition-colors text-left group">
                  <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded">
                    <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-ui text-sm text-[#F5E6C8] truncate group-hover:text-[#C8922A] transition-colors">{movie.title}</p>
                    <p className="font-body text-xs text-[#6B5A47]">{movie.year} · {movie.director}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-ui text-sm font-bold ${ratingColor(movie.rating)}`}>{movie.rating}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-ui font-bold ${movie.quality === '4K' ? 'badge-4k' : 'badge-hd'}`}>{movie.quality}</span>
                  </div>
                </button>
              ))}
              <div className="border-t border-[#1F160D] px-4 py-3">
                <button onClick={() => submit()} className="font-ui text-sm text-[#C8922A] hover:underline">
                  See all results for "{query}" →
                </button>
              </div>
            </div>
          )}

          {/* Did you mean */}
          {results.length === 0 && query.length >= 3 && didYouMean.length > 0 && (
            <div className="p-4">
              <p className="mb-2 font-body text-sm text-[#C4B49A]">No exact match — did you mean:</p>
              {didYouMean.map(m => (
                <button key={m.id} onClick={() => goToMovie(m)}
                  className="block w-full py-2 px-3 rounded-lg text-left hover:bg-[#1F160D] transition-colors">
                  <span className="font-ui text-sm text-[#C8922A]">{m.title}</span>
                  <span className="ml-2 font-body text-xs text-[#6B5A47]">{m.year}</span>
                </button>
              ))}
            </div>
          )}

          {results.length === 0 && query.length >= 3 && didYouMean.length === 0 && (
            <div className="p-6 text-center">
              <p className="font-body text-sm text-[#6B5A47]">No results for <span className="text-[#C4B49A]">"{query}"</span></p>
              <p className="mt-1 font-body text-xs text-[#4A3A2A]">Try a director name, actor, or genre</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
