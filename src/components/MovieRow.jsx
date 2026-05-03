import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MovieCard from './MovieCard'

export default function MovieRow({ title, subtitle, movies, seeAllPath, size = 'md' }) {
  const rowRef  = useRef(null)
  const navigate = useNavigate()

  const scroll = (dir) => {
    rowRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  if (!movies?.length) return null

  return (
    <section className="py-6">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-4 px-4 sm:px-8 lg:px-12">
        <div>
          <h2 className="font-ui text-lg sm:text-xl font-bold text-[#F5E6C8]">{title}</h2>
          {subtitle && <p className="font-body text-xs text-[#6B5A47] mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {seeAllPath && (
            <button onClick={() => navigate(seeAllPath)}
              className="font-ui text-xs text-[#C8922A] hover:underline">
              See all →
            </button>
          )}
          {/* Arrow buttons */}
          <div className="hidden sm:flex gap-1.5">
            <button onClick={() => scroll(-1)}
              className="h-8 w-8 flex items-center justify-center rounded-full border border-[#2A1E12] text-[#6B5A47] hover:border-[#C8922A44] hover:text-[#C8922A] transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button onClick={() => scroll(1)}
              className="h-8 w-8 flex items-center justify-center rounded-full border border-[#2A1E12] text-[#6B5A47] hover:border-[#C8922A44] hover:text-[#C8922A] transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={rowRef}
        className="scroll-row flex gap-4 overflow-x-auto px-4 sm:px-8 lg:px-12 pb-2"
      >
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} size={size}/>
        ))}
      </div>
    </section>
  )
}
