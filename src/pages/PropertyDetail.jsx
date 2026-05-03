import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { properties, getTagClass } from '../data/properties'
import { useTripBoard } from '../context/TripBoardContext'
import PropertyCard from '../components/PropertyCard'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function PropertyDetail() {
  const { id } = useParams()
  const { isSaved, toggle } = useTripBoard()
  const p = properties.find(prop => prop.id === Number(id))
  const [imgIdx,      setImgIdx]      = useState(0)
  const [showAll,     setShowAll]     = useState(false)
  const [groupCount,  setGroupCount]  = useState(1)

  if (!p) {
    return (
      <div className="min-h-screen bg-vibe-red flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="font-display text-5xl text-white uppercase mb-4">Spot not found 😅</p>
          <Link to="/" className="vibe-btn bg-vibe-yellow text-vibe-navy font-display px-6 py-3 rounded-full border-2 border-vibe-navy inline-block">GO BACK HOME</Link>
        </div>
      </div>
    )
  }

  const saved = isSaved(p.id)
  const related = properties.filter(r => r.id !== p.id && r.activities.some(a => p.activities.includes(a))).slice(0, 3)
  const whatsappMsg = encodeURIComponent(`Check out ${p.name} on Getaway.gh — GHS ${p.priceGHS}/night! https://getaway-gh.vercel.app/property/${p.id}`)

  return (
    <div className="min-h-screen bg-vibe-red page-enter">

      {/* ── BREADCRUMB ───────────────────────────────────── */}
      <div className="pt-24 pb-2 px-4 max-w-5xl mx-auto">
        <nav className="flex items-center gap-2 font-body text-xs text-white/70 flex-wrap">
          <Link to="/" className="hover:text-white transition-colors">Getaway.gh</Link>
          <span>›</span>
          <Link to="/explore" className="hover:text-white transition-colors">Regions</Link>
          <span>›</span>
          <Link to={`/explore`} className="hover:text-white transition-colors">{p.region}</Link>
          <span>›</span>
          <span className="text-white font-bold truncate">{p.name}</span>
        </nav>
      </div>

      {/* ── PHOTO GALLERY ────────────────────────────────── */}
      <div className="px-4 pb-6 max-w-5xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border-2 border-vibe-navy shadow-card h-72 sm:h-96">
          <img src={p.images[imgIdx] || p.image} alt={p.name} className="w-full h-full object-cover" />

          {p.images.length > 1 && (
            <>
              <button onClick={() => setImgIdx(i => (i - 1 + p.images.length) % p.images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border-2 border-vibe-navy rounded-full flex items-center justify-center font-bold text-vibe-navy hover:bg-vibe-yellow transition-colors">‹</button>
              <button onClick={() => setImgIdx(i => (i + 1) % p.images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border-2 border-vibe-navy rounded-full flex items-center justify-center font-bold text-vibe-navy hover:bg-vibe-yellow transition-colors">›</button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {p.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-2 h-2 rounded-full border border-white transition-all ${i === imgIdx ? 'bg-white scale-125' : 'bg-white/40'}`} />
                ))}
              </div>
            </>
          )}

          {/* Flash deal badge */}
          {p.isFlashDeal && (
            <div className="absolute top-3 left-3 bg-vibe-red text-white font-display text-sm px-3 py-1 rounded-full border-2 border-vibe-navy">⚡ FLASH DEAL</div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div className="px-4 pb-16 max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT COLUMN */}
          <div className="flex-1 min-w-0">

            {/* Badge + name */}
            <p className="font-body text-sm font-bold text-vibe-yellow mb-1">{p.badge}</p>
            <h1 className="font-display text-4xl sm:text-5xl text-white uppercase leading-tight mb-2">{p.name}</h1>

            {/* Location + verified */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <p className="font-body font-bold text-white/80 text-sm uppercase tracking-wide">📍 {p.district}, {p.region}</p>
              {p.verified && (
                <span className="bg-white text-vibe-navy font-body text-xs font-bold px-2.5 py-1 rounded-full border border-vibe-navy">✓ Verified by Getaway.gh</span>
              )}
              <span className="font-display text-sm bg-vibe-navy text-white px-3 py-1 rounded-full">🔥 {p.vibeScore} vibe score</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {p.tags.map(tag => (
                <span key={tag} className={`${getTagClass(tag)} font-body text-sm font-bold px-3 py-1 rounded-full`}>{tag}</span>
              ))}
            </div>

            {/* Best bits bar */}
            {p.bestBits && (
              <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4 mb-6">
                <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">The best bits</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {p.bestBits.map((bit, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-2xl">{bit.icon}</span>
                      <span className="font-body text-sm font-bold text-vibe-navy">{bit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-5 mb-6">
              <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-2">The Vibe</p>
              <p className="font-body text-vibe-navy leading-relaxed">{p.description}</p>
            </div>

            {/* What's included / not included */}
            {p.included && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4">
                  <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">✅ What's included</p>
                  <ul className="space-y-1.5">
                    {p.included.map((item, i) => (
                      <li key={i} className="font-body text-sm text-vibe-navy flex items-start gap-2">
                        <span className="text-green-600 mt-0.5 shrink-0">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4">
                  <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">❌ Not included</p>
                  <ul className="space-y-1.5">
                    {p.notIncluded.map((item, i) => (
                      <li key={i} className="font-body text-sm text-gray-500 flex items-start gap-2">
                        <span className="text-vibe-red mt-0.5 shrink-0">✕</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Transport */}
            {p.transport && (
              <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4 mb-6">
                <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-2">🚗 Getting there</p>
                <p className="font-body text-sm text-vibe-navy">{p.transport}</p>
              </div>
            )}

            {/* Accessibility */}
            {p.accessibility && (
              <div className="bg-vibe-yellow rounded-xl border-2 border-vibe-navy shadow-card p-4 mb-6">
                <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-1">♿ Accessibility</p>
                <p className="font-body text-sm text-vibe-navy font-bold">{p.accessibility}</p>
              </div>
            )}

            {/* Safety & packing */}
            {p.safety && (
              <div className="bg-vibe-yellow rounded-xl border-2 border-vibe-navy shadow-card p-4 mb-6">
                <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">🧳 Before you go</p>
                {p.safety.road && (
                  <p className="font-body text-xs text-vibe-navy mb-2 flex items-start gap-1.5">
                    <span className="shrink-0">🚗</span> {p.safety.road}
                  </p>
                )}
                {p.safety.health && (
                  <p className="font-body text-xs text-vibe-navy mb-3 flex items-start gap-1.5">
                    <span className="shrink-0">💊</span> {p.safety.health}
                  </p>
                )}
                {p.safety.pack && p.safety.pack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.safety.pack.map((item, i) => (
                      <span key={i} className="font-body text-xs font-bold bg-white text-vibe-navy px-2.5 py-1 rounded-full border border-vibe-navy">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Best months */}
            {p.bestMonths && (
              <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4 mb-6">
                <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">📅 Best months to visit</p>
                <div className="flex flex-wrap gap-1.5">
                  {MONTHS.map(m => (
                    <span key={m} className={`font-body text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${
                      p.bestMonths.includes(m)
                        ? 'bg-vibe-navy text-white border-vibe-navy'
                        : 'bg-gray-100 text-gray-400 border-gray-200'
                    }`}>{m}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Day-by-day itinerary */}
            {p.itinerary && (
              <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-5 mb-6">
                <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-4">🗓 Suggested itinerary</p>
                <div className="space-y-4">
                  {(showAll ? p.itinerary : p.itinerary.slice(0, 2)).map((day, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="shrink-0 w-12 h-12 bg-vibe-navy text-white rounded-xl flex flex-col items-center justify-center">
                        <span className="font-body text-xs">Day</span>
                        <span className="font-display text-lg leading-none">{day.day}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-display text-sm text-vibe-navy uppercase mb-1">{day.title}</p>
                        <ul className="space-y-0.5">
                          {day.activities.map((act, j) => (
                            <li key={j} className="font-body text-xs text-gray-600 flex items-start gap-1.5">
                              <span className="text-vibe-red mt-0.5">·</span> {act}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  {p.itinerary.length > 2 && (
                    <button onClick={() => setShowAll(s => !s)}
                      className="font-body text-sm font-bold text-vibe-blue underline">
                      {showAll ? 'Show less' : `Show all ${p.itinerary.length} days`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-5 mb-6">
              <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">What's on site</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {p.amenities.map(a => (
                  <div key={a} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-lg">{a.split(' ')[0]}</span>
                    <span className="font-body text-xs text-vibe-navy font-bold">{a.split(' ').slice(1).join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby excursions */}
            <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-5 mb-6">
              <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">📍 Pair this with</p>
              <ul className="space-y-2">
                {p.activities_nearby.map(act => (
                  <li key={act} className="flex items-start gap-2 font-body text-sm text-vibe-navy">
                    <span className="text-vibe-red mt-0.5 shrink-0">→</span> {act}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            <div className="mb-6">
              <p className="font-display text-lg text-white uppercase mb-4">What people say</p>
              <div className="space-y-3">
                {p.reviews.map((r, i) => (
                  <div key={i} className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-vibe-navy text-white rounded-full flex items-center justify-center font-display text-sm shrink-0">{r.avatar}</div>
                      <div>
                        <p className="font-body font-bold text-vibe-navy text-sm">{r.user}</p>
                        <div className="flex">{Array.from({ length: r.rating }).map((_, j) => <span key={j} className="text-vibe-yellow text-sm">★</span>)}</div>
                      </div>
                    </div>
                    <p className="font-body text-sm text-gray-700 italic">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — sticky booking panel */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-5">
                <div className="mb-4">
                  <span className="font-body text-xs text-gray-500">from</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl text-vibe-navy">GHS {p.priceGHS.toLocaleString()}</span>
                    <span className="font-body text-sm text-gray-400">/ night</span>
                  </div>
                  <span className="font-body text-xs text-gray-400">≈ ${p.priceUSD} USD per night</span>
                  {p.minStay > 1 && (
                    <p className="font-body text-xs text-vibe-red font-bold mt-1">Minimum {p.minStay} nights</p>
                  )}
                  {p.bookingsThisMonth > 8 && (
                    <p className="font-body text-xs text-vibe-red font-bold mt-1">🔥 {p.bookingsThisMonth} people booked this month</p>
                  )}
                </div>

                {/* Group size stepper */}
                <div className="border border-gray-200 rounded-xl px-3 py-2.5 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-gray-500 font-bold uppercase tracking-wide">Group size</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setGroupCount(c => Math.max(1, c - 1))}
                        className="w-7 h-7 rounded-lg bg-vibe-navy text-white font-display text-sm flex items-center justify-center hover:bg-vibe-blue transition-colors">−</button>
                      <span className="font-display text-lg text-vibe-navy w-5 text-center">{groupCount}</span>
                      <button onClick={() => setGroupCount(c => Math.min(12, c + 1))}
                        className="w-7 h-7 rounded-lg bg-vibe-navy text-white font-display text-sm flex items-center justify-center hover:bg-vibe-blue transition-colors">+</button>
                    </div>
                  </div>
                  {groupCount > 1 && (
                    <p className="font-body text-xs text-vibe-blue font-bold mt-1.5">
                      → GHS {Math.round(p.priceGHS / groupCount).toLocaleString()} / person / night
                    </p>
                  )}
                </div>

                <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
                  className="vibe-btn w-full block text-center bg-vibe-blue text-white font-display text-base py-3 rounded-full border-2 border-vibe-navy mb-3">
                  BOOK THIS SPOT
                </a>

                <button onClick={() => toggle(p.id)}
                  className={`vibe-btn w-full font-display text-base py-3 rounded-full border-2 border-vibe-navy transition-colors mb-3 ${saved ? 'bg-vibe-red text-white' : 'bg-vibe-yellow text-vibe-navy'}`}>
                  {saved ? '❤️ SAVED TO BOARD' : '🤍 SAVE TO BOARD'}
                </button>

                {/* WhatsApp share */}
                <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border-2 border-vibe-navy bg-green-500 text-white font-body font-bold text-sm hover:bg-green-600 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.553 4.122 1.523 5.859L0 24l6.335-1.509A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.374l-.359-.213-3.721.887.929-3.613-.234-.372A9.818 9.818 0 0112 2.182c5.422 0 9.818 4.396 9.818 9.818S17.422 21.818 12 21.818z"/>
                  </svg>
                  Share on WhatsApp
                </a>
              </div>

              {/* Good for */}
              <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4">
                <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">Good for</p>
                <div className="flex flex-wrap gap-2">
                  {p.groups.map(g => {
                    const labels = { solo: '🧍 Solo', couple: '👫 Couples', group4: '👥 Groups (4+)', large: '🎉 Large groups (10+)' }
                    return <span key={g} className="font-body text-xs font-bold bg-vibe-yellow text-vibe-navy px-3 py-1.5 rounded-full border border-vibe-navy">{labels[g]}</span>
                  })}
                </div>
              </div>

              {/* Activity tags */}
              <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4">
                <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">Activities</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map(tag => (
                    <span key={tag} className={`${getTagClass(tag)} font-body text-xs font-bold px-2.5 py-1 rounded-full`}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RELATED SPOTS ────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-12">
            <p className="font-cursive text-vibe-yellow text-2xl mb-2">you might also like</p>
            <h2 className="font-display text-3xl text-white uppercase mb-6">Similar Getaways</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map(r => <PropertyCard key={r.id} property={r} />)}
            </div>
          </div>
        )}
      </div>

      <footer className="bg-vibe-navy py-6 text-center mt-4">
        <p className="font-body font-bold text-white/60 text-sm">Getaway.gh — Discover Ghana © 2025</p>
      </footer>
    </div>
  )
}
