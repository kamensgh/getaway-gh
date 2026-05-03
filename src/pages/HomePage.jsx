import { useState } from 'react'
import HeroBanner from '../components/HeroBanner'
import MovieRow from '../components/MovieRow'
import {
  MOVIES, TRENDING, DIRECTOR_PICKS, NEW_RELEASES,
  TV_SERIALS, MOST_LOVED, AWARD_WINNERS
} from '../data/movies'

const CATEGORIES = [
  { label: 'All Films',   filter: () => true },
  { label: 'New Releases',filter: m => m.isNew },
  { label: 'Drama',       filter: m => m.genre?.includes('drama') },
  { label: 'Comedy',      filter: m => m.genre?.includes('comedy') },
  { label: 'Romance',     filter: m => m.genre?.includes('romance') },
  { label: 'Historical',  filter: m => m.genre?.includes('historical') },
  { label: 'Documentary', filter: m => m.type === 'documentary' },
  { label: 'TV Serials',  filter: m => m.type === 'tv-series' },
  { label: 'Fantasy',     filter: m => m.genre?.includes('fantasy') },
]

function KenteDivider() {
  return (
    <div className="mx-4 sm:mx-8 lg:mx-12 my-2 flex items-center gap-4">
      <div className="kente-border h-0.5 w-16 rounded-full opacity-60"/>
      <div className="flex-1 h-px bg-[#1F160D]"/>
    </div>
  )
}

function StatsBar() {
  return (
    <div className="mx-4 sm:mx-8 lg:mx-12 mb-6 mt-2 flex flex-wrap items-center gap-6">
      {[
        { label: 'Films & Series', value: MOVIES.length },
        { label: 'Directors', value: [...new Set(MOVIES.map(m => m.director))].length },
        { label: 'Languages', value: [...new Set(MOVIES.flatMap(m => m.language || []))].length },
        { label: 'Award Winners', value: AWARD_WINNERS.length },
      ].map(s => (
        <div key={s.label} className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-black text-[#C8922A]">{s.value}</span>
          <span className="font-body text-xs text-[#6B5A47] uppercase tracking-wide">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState(0)
  const filtered = MOVIES.filter(CATEGORIES[activeCategory].filter)

  return (
    <div className="page-enter min-h-screen bg-[#0E0A07]">
      <HeroBanner />

      <div className="sticky top-1 z-30 bg-[#0E0A07]/95 backdrop-blur-md border-b border-[#1F160D] px-4 sm:px-8 lg:px-12 py-3">
        <div className="scroll-row flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat, i) => (
            <button key={cat.label} onClick={() => setActiveCategory(i)}
              className={`cat-pill shrink-0 rounded-full border px-4 py-1.5 font-ui text-xs font-medium transition-all ${
                i === activeCategory
                  ? 'active border-[#C8922A]'
                  : 'border-[#2A1E12] text-[#C4B49A] hover:border-[#4A3A2A] hover:text-[#F5E6C8]'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <StatsBar />

      {activeCategory !== 0 ? (
        <div className="pb-16">
          <MovieRow
            title={CATEGORIES[activeCategory].label}
            subtitle={`${filtered.length} title${filtered.length !== 1 ? 's' : ''} available`}
            movies={filtered} size="lg"
          />
        </div>
      ) : (
        <div className="pb-16">
          <MovieRow title="Most Loved" subtitle="Rated highest by Ghanaian audiences"
            movies={MOST_LOVED} seeAllPath="/search?sort=rating" size="lg"/>
          <KenteDivider />
          <MovieRow title="Classic TV Serials" subtitle="The series that defined Ghana's golden TV era"
            movies={TV_SERIALS} seeAllPath="/search?type=tv-series"/>
          <KenteDivider />
          <MovieRow title="Trending Now" subtitle="What audiences are watching this week"
            movies={TRENDING}/>
          <KenteDivider />
          <MovieRow title="Director's Picks" subtitle="Curated by the Sankofa editorial team"
            movies={DIRECTOR_PICKS} size="lg"/>
          <KenteDivider />
          <MovieRow title="New Releases" subtitle="Recently added to the archive"
            movies={NEW_RELEASES.length ? NEW_RELEASES : MOVIES.slice(3, 8)}/>
          <KenteDivider />
          {AWARD_WINNERS.length > 0 && (
            <>
              <MovieRow title="FESPACO Award Winners"
                subtitle="Ghanaian films honoured at Africa's greatest film festival"
                movies={AWARD_WINNERS} size="sm"/>
              <KenteDivider />
            </>
          )}
          <div className="px-4 sm:px-8 lg:px-12 py-8">
            <div className="rounded-2xl border border-[#1F160D] bg-[#161009] adinkra-bg p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1">
                <p className="font-ui text-xs uppercase tracking-widest text-[#C8922A] mb-2">Full Archive</p>
                <h3 className="font-display text-2xl font-black text-[#F5E6C8] mb-2">{MOVIES.length} Titles Available</h3>
                <p className="font-body text-sm text-[#C4B49A]">
                  From early 80s classics to the late-90s new wave — every film, documentary, and TV series we've restored.
                </p>
              </div>
              <a href="/search" className="shrink-0 rounded-full bg-[#C8922A] px-6 py-3 font-ui text-sm font-bold text-[#0E0A07] hover:bg-[#E0A83A] transition-colors">
                Browse All →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
