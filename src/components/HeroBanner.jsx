import { useNavigate } from 'react-router-dom'
import { FEATURED_MOVIE } from '../data/movies'
import SearchBar from './SearchBar'

function AdinkraGye() {
  /* Gye Nyame — "Except God" — the most ubiquitous Adinkra */
  return (
    <svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-15">
      <ellipse cx="60" cy="80" rx="35" ry="55" stroke="#C8922A" strokeWidth="2"/>
      <ellipse cx="60" cy="80" rx="20" ry="38" stroke="#C8922A" strokeWidth="1.5"/>
      <path d="M25 80 Q40 55 60 45 Q80 55 95 80 Q80 105 60 115 Q40 105 25 80Z" stroke="#C8922A" strokeWidth="1.5" fill="none"/>
      <path d="M60 25 Q75 35 80 55" stroke="#C8922A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M60 25 Q45 35 40 55" stroke="#C8922A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M60 135 Q75 125 80 105" stroke="#C8922A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M60 135 Q45 125 40 105" stroke="#C8922A" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="60" cy="80" r="6" fill="#C8922A" opacity="0.5"/>
    </svg>
  )
}

export default function HeroBanner() {
  const movie = FEATURED_MOVIE
  const navigate = useNavigate()

  const ratingColor = (r) => r >= 9 ? '#C8922A' : r >= 8 ? '#E8741A' : '#C4B49A'

  return (
    <div className="relative min-h-[92vh] flex flex-col overflow-hidden">

      {/* Backdrop image */}
      <div className="absolute inset-0">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="h-full w-full object-cover object-center"
          style={{ filter: 'saturate(1.3) brightness(0.35) sepia(0.25)' }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0A07] via-[#0E0A07]/70 to-transparent"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0A07] via-transparent to-[#0E0A07]/40"/>
      </div>

      {/* Adinkra decorative right side */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-64 opacity-100 hidden lg:block pointer-events-none">
        <AdinkraGye />
      </div>

      {/* Kente vertical stripe accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5">
        <div className="kente-border h-full w-full"/>
      </div>

      {/* Main content */}
      <div className="relative flex flex-1 flex-col justify-center px-8 sm:px-12 lg:px-20 pt-28 pb-16 max-w-7xl mx-auto w-full">

        {/* Search hero — the star of the show */}
        <div className="mb-14">
          <p className="mb-3 font-ui text-xs uppercase tracking-[0.3em] text-[#C8922A]">
            Ghana's Cinema Heritage · 1980s–1990s
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#F5E6C8] leading-[1.05] mb-6 max-w-xl">
            Return to<br/>
            <span className="italic text-[#C8922A]">Your Roots</span>
          </h1>
          <p className="mb-8 font-body text-base text-[#C4B49A] max-w-md leading-relaxed">
            Discover the films and TV shows that defined a generation — Twi, Ga, Hausa, and English — all in one place.
          </p>

          {/* The big search bar */}
          <SearchBar large />

          <p className="mt-3 font-body text-xs text-[#4A3A2A]">
            Try: <button onClick={() => navigate('/search?q=Obra')} className="text-[#6B5A47] hover:text-[#C8922A] transition-colors">"Obra"</button>
            {', '}
            <button onClick={() => navigate('/search?q=Yaa+Asantewaa')} className="text-[#6B5A47] hover:text-[#C8922A] transition-colors">"Yaa Asantewaa"</button>
            {', '}
            <button onClick={() => navigate('/search?q=Nana+Ama')} className="text-[#6B5A47] hover:text-[#C8922A] transition-colors">"Nana Ama"</button>
          </p>
        </div>

        {/* Featured film card */}
        <div className="flex items-end gap-8">
          {/* Poster thumbnail */}
          <div className="relative hidden sm:block h-36 w-24 shrink-0 overflow-hidden rounded-lg border border-[#2A1E12] shadow-2xl">
            <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" style={{ filter: 'saturate(1.2)' }}/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
            <div className="absolute top-2 left-2">
              <span className="rounded px-1.5 py-0.5 font-ui text-[9px] font-bold badge-new uppercase">Featured</span>
            </div>
          </div>

          {/* Film info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1.5">
              <span className="font-ui text-[10px] uppercase tracking-widest text-[#C8922A]">Now Streaming</span>
              <div className="h-px flex-1 max-w-16 bg-[#C8922A]/30"/>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#F5E6C8] mb-2">
              {movie.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="font-ui text-sm font-bold" style={{ color: ratingColor(movie.rating) }}>
                ★ {movie.rating}
              </span>
              <span className="text-[#4A3A2A]">·</span>
              <span className="font-body text-sm text-[#C4B49A]">{movie.year}</span>
              <span className="text-[#4A3A2A]">·</span>
              <span className="font-body text-sm text-[#C4B49A]">{movie.duration}</span>
              <span className={`px-2 py-0.5 rounded font-ui text-[10px] font-bold uppercase ${movie.quality === '4K' ? 'badge-4k' : 'badge-hd'}`}>
                {movie.quality}
              </span>
            </div>
            <p className="font-body text-sm text-[#C4B49A] max-w-md leading-relaxed line-clamp-2">
              {movie.logline}
            </p>
            <div className="mt-4 flex gap-3">
              <button onClick={() => navigate(`/film/${movie.slug}`)}
                className="flex items-center gap-2 rounded-full bg-[#C8922A] px-5 py-2.5 font-ui text-sm font-bold text-[#0E0A07] hover:bg-[#E0A83A] transition-colors shadow-lg shadow-[#C8922A]/20">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Now
              </button>
              <button onClick={() => navigate(`/film/${movie.slug}`)}
                className="flex items-center gap-2 rounded-full border border-[#2A1E12] px-5 py-2.5 font-ui text-sm text-[#C4B49A] hover:border-[#C8922A44] hover:text-[#F5E6C8] transition-colors">
                Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade into content */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0E0A07] to-transparent pointer-events-none"/>
    </div>
  )
}
