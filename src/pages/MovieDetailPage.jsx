import { useParams, useNavigate } from 'react-router-dom'
import { MOVIES } from '../data/movies'
import MovieCard from '../components/MovieCard'

const LANG_FULL = { twi: 'Twi', ga: 'Ga', english: 'English', hausa: 'Hausa', fante: 'Fante' }

function AdinkraSankofa() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="100" r="90" stroke="#C8922A" strokeWidth="1.5" opacity="0.2"/>
      <circle cx="100" cy="100" r="65" stroke="#C8922A" strokeWidth="1" opacity="0.15"/>
      <path d="M100 35 Q145 55 155 100 Q145 145 100 165 Q55 145 45 100 Q55 55 100 35Z"
        fill="none" stroke="#C8922A" strokeWidth="1.5" opacity="0.15"/>
      <path d="M100 60 Q125 75 130 100 Q125 125 100 140 Q75 125 70 100 Q75 75 100 60Z"
        fill="#C8922A" opacity="0.05"/>
      <circle cx="100" cy="100" r="8" fill="#C8922A" opacity="0.2"/>
      <path d="M100 20 L100 35 M100 165 L100 180 M20 100 L35 100 M165 100 L180 100"
        stroke="#C8922A" strokeWidth="1" opacity="0.1"/>
    </svg>
  )
}

export default function MovieDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const movie = MOVIES.find(m => m.slug === slug)

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0E0A07] flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="font-display text-4xl text-[#C8922A] mb-4">404</p>
          <p className="font-body text-[#6B5A47] mb-6">Film not found in the archive.</p>
          <button onClick={() => navigate('/')}
            className="rounded-full bg-[#C8922A] px-6 py-2.5 font-ui text-sm font-bold text-[#0E0A07]">
            Back to Sankofa
          </button>
        </div>
      </div>
    )
  }

  const related = MOVIES
    .filter(m => m.id !== movie.id && (
      m.genre?.some(g => movie.genre?.includes(g)) ||
      m.director === movie.director ||
      m.language?.some(l => movie.language?.includes(l))
    ))
    .slice(0, 6)

  const ratingColor = (r) => r >= 8.5 ? '#C8922A' : r >= 7 ? '#E8741A' : '#C4B49A'

  return (
    <div className="page-enter min-h-screen bg-[#0E0A07] pt-16">

      {/* Backdrop */}
      <div className="relative h-[55vh] overflow-hidden">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="h-full w-full object-cover object-center"
          style={{ filter: 'saturate(1.2) brightness(0.3) sepia(0.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0A07] via-[#0E0A07]/50 to-transparent"/>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0A07]/70 to-transparent"/>

        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-40 h-40 hidden lg:block pointer-events-none">
          <AdinkraSankofa />
        </div>

        <div className="absolute top-6 left-4 sm:left-8 lg:left-12">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-full border border-[#2A1E12] bg-[#0E0A07]/60 backdrop-blur-sm px-4 py-2 font-ui text-xs text-[#C4B49A] hover:border-[#C8922A44] hover:text-[#C8922A] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 -mt-24 relative z-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Poster */}
          <div className="shrink-0">
            <div className="relative w-44 sm:w-52 overflow-hidden rounded-2xl border border-[#2A1E12] shadow-2xl shadow-black/60">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
                style={{ filter: 'saturate(1.2)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-multiply"/>
            </div>
            <div className="mt-4 flex flex-col gap-2 w-44 sm:w-52">
              <button
                onClick={() => navigate('/watchlist')}
                className="flex items-center justify-center gap-2 rounded-full bg-[#C8922A] py-3 font-ui text-sm font-bold text-[#0E0A07] hover:bg-[#E0A83A] transition-colors shadow-lg shadow-[#C8922A]/20">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Now
              </button>
              <button
                onClick={() => navigate('/watchlist')}
                className="flex items-center justify-center gap-2 rounded-full border border-[#2A1E12] py-3 font-ui text-sm text-[#C4B49A] hover:border-[#C8922A44] hover:text-[#F5E6C8] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                Add to Watchlist
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pt-6 lg:pt-0">

            <div className="flex flex-wrap gap-1.5 mb-3">
              {movie.genre?.map(g => (
                <span key={g} className="rounded-full border border-[#2A1E12] bg-[#1F160D] px-3 py-0.5 font-ui text-[10px] uppercase tracking-widest text-[#6B5A47]">
                  {g}
                </span>
              ))}
              {movie.type !== 'movie' && (
                <span className="rounded-full border border-[#6B1E3C]/40 bg-[#6B1E3C]/20 px-3 py-0.5 font-ui text-[10px] uppercase tracking-widest text-[#C4B49A]">
                  {movie.type === 'tv-series'
                    ? ['Series', movie.seasons && `${movie.seasons}S`, movie.episodes && `${movie.episodes}Ep`].filter(Boolean).join(' · ')
                    : 'Documentary'}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-[#F5E6C8] leading-tight mb-3">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-5">
              <span className="font-ui text-xl font-black" style={{ color: ratingColor(movie.rating) }}>
                ★ {movie.rating}
              </span>
              <span className="font-body text-sm text-[#C4B49A]">{movie.year}</span>
              <span className="font-body text-sm text-[#C4B49A]">{movie.duration}</span>
              <span className={`px-2 py-0.5 rounded font-ui text-xs font-bold uppercase ${
                movie.quality === '4K' ? 'badge-4k' : movie.quality === 'HD' ? 'badge-hd' : 'badge-sd'
              }`}>{movie.quality}</span>
              {movie.isNew && (
                <span className="px-2 py-0.5 rounded font-ui text-xs font-bold uppercase badge-new">New</span>
              )}
            </div>

            <p className="font-body text-base sm:text-lg text-[#C8922A] italic mb-5 leading-relaxed border-l-2 border-[#C8922A]/40 pl-4">
              {movie.logline}
            </p>

            <div className="kente-border h-0.5 w-full mb-5 opacity-40"/>

            <p className="font-body text-sm sm:text-base text-[#C4B49A] leading-relaxed mb-8">
              {movie.synopsis}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8">
              <InfoRow label="Director" value={movie.director}/>
              <InfoRow label="Year" value={movie.year}/>
              <InfoRow label="Region" value={movie.region}/>
              <InfoRow label="Duration" value={movie.duration}/>
              <InfoRow
                label="Languages"
                value={movie.language?.map(l => LANG_FULL[l] || l).join(', ')}
              />
              {movie.type === 'tv-series' && (movie.seasons || movie.episodes) && (
                <InfoRow label="Episodes" value={[movie.seasons && `${movie.seasons} seasons`, movie.episodes && `${movie.episodes} episodes`].filter(Boolean).join(' · ')}/>
              )}
            </div>

            {movie.cast?.length > 0 && (
              <div className="mb-8">
                <p className="font-ui text-[10px] uppercase tracking-widest text-[#6B5A47] mb-3">Cast</p>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map(name => (
                    <button
                      key={name}
                      onClick={() => navigate(`/search?q=${encodeURIComponent(name)}`)}
                      className="rounded-full border border-[#2A1E12] bg-[#161009] px-3 py-1.5 font-body text-xs text-[#C4B49A] hover:border-[#C8922A44] hover:text-[#C8922A] transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {movie.tags?.length > 0 && (
              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-[#6B5A47] mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {movie.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                      className="rounded-sm bg-[#1F160D] px-2 py-0.5 font-ui text-[10px] text-[#4A3A2A] hover:text-[#C8922A] transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="kente-border h-0.5 w-12 opacity-60"/>
              <h2 className="font-ui text-lg font-bold text-[#F5E6C8]">You Might Also Like</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto scroll-row pb-2">
              {related.map(m => <MovieCard key={m.id} movie={m} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="font-ui text-[10px] uppercase tracking-widest text-[#6B5A47] mb-0.5">{label}</p>
      <p className="font-body text-sm text-[#F5E6C8]">{value}</p>
    </div>
  )
}
