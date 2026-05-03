import { useNavigate } from 'react-router-dom'

const LANG_SHORT = { twi: 'TWI', ga: 'GA', english: 'ENG', hausa: 'HAU', fante: 'FAN' }

function RatingBadge({ rating }) {
  const color = rating >= 8.5 ? '#C8922A' : rating >= 7 ? '#E8741A' : '#C4B49A'
  return <span className="font-ui text-sm font-black" style={{ color }}>★ {rating}</span>
}

export default function MovieCard({ movie, size = 'md' }) {
  const navigate = useNavigate()
  const dims = size === 'lg'
    ? 'w-52 sm:w-60'
    : size === 'sm'
    ? 'w-32 sm:w-36'
    : 'w-40 sm:w-48'

  const imgH = size === 'lg' ? 'h-[300px]' : size === 'sm' ? 'h-48' : 'h-64'

  return (
    <div
      className={`movie-card shrink-0 ${dims} cursor-pointer group`}
      onClick={() => navigate(`/film/${movie.slug}`)}
    >
      {/* Poster */}
      <div className={`relative ${imgH} overflow-hidden rounded-xl mb-2.5 bg-[#1F160D]`}>
        <img
          src={movie.poster}
          alt={movie.title}
          className="card-img h-full w-full object-cover"
          style={{ filter: 'saturate(1.15)' }}
          loading="lazy"
        />

        {/* Overlay — slides in on hover */}
        <div className="card-overlay absolute inset-0 flex flex-col justify-end p-3">
          <div className="flex gap-2">
            <button className="flex-1 rounded-full bg-[#C8922A] py-1.5 font-ui text-xs font-bold text-[#0E0A07] hover:bg-[#E0A83A] transition-colors">
              Watch
            </button>
            <button
              onClick={e => { e.stopPropagation(); navigate('/watchlist') }}
              className="rounded-full border border-[#F5E6C8]/40 px-3 py-1.5 font-ui text-xs text-[#F5E6C8] hover:border-[#C8922A] hover:text-[#C8922A] transition-colors">
              + List
            </button>
          </div>
        </div>

        {/* Always-visible badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 pointer-events-none">
          {movie.isNew && (
            <span className="rounded px-1.5 py-0.5 font-ui text-[9px] font-bold badge-new uppercase">New</span>
          )}
          <span className={`rounded px-1.5 py-0.5 font-ui text-[9px] font-bold uppercase ${
            movie.quality === '4K' ? 'badge-4k' : movie.quality === 'HD' ? 'badge-hd' : 'badge-sd'
          }`}>{movie.quality}</span>
        </div>

        {/* Type badge for TV/docs */}
        {movie.type !== 'movie' && (
          <div className="absolute top-2 right-2 pointer-events-none">
            <span className="rounded px-1.5 py-0.5 font-ui text-[9px] font-bold bg-[#6B1E3C] text-[#F5E6C8] uppercase">
              {movie.type === 'tv-series' ? 'Series' : 'Doc'}
            </span>
          </div>
        )}
      </div>

      {/* Info below poster */}
      <div>
        <h3 className="font-ui text-sm font-semibold text-[#F5E6C8] leading-tight mb-0.5 group-hover:text-[#C8922A] transition-colors line-clamp-1">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <RatingBadge rating={movie.rating}/>
          <span className="font-body text-xs text-[#6B5A47]">{movie.year}</span>
          {movie.duration && (
            <span className="font-body text-xs text-[#4A3A2A]">{movie.duration}</span>
          )}
        </div>
        <div className="mt-1 flex gap-1 flex-wrap">
          {movie.language?.slice(0, 2).map(l => (
            <span key={l} className="rounded-sm bg-[#1F160D] px-1.5 py-0.5 font-ui text-[9px] text-[#6B5A47] uppercase tracking-wide border border-[#2A1E12]">
              {LANG_SHORT[l] || l.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
