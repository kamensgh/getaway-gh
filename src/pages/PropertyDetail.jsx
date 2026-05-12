import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { properties, getTagClass } from '../data/properties'
import { CONTACTS } from '../data/contacts'
import { getFestivals } from '../data/festivals'
import { useTripBoard } from '../context/TripBoardContext'
import PropertyCard from '../components/PropertyCard'
import NearbyAmenities from '../components/NearbyAmenities'
import { estimateDriveTime, DEPARTURE_CITIES } from '../utils/driveTime'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function ContactModal({ p, onClose }) {
  const [copied, setCopied] = useState(false)
  function handleShare() {
    const url = `${window.location.origin}/property/${p.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }
  const contact = CONTACTS[p.id] || {}
  const whatsappNum = contact.phone ? contact.phone.replace(/\s+/g, '').replace('+', '') : null
  const whatsappMsg = encodeURIComponent(`Hi, I'm interested in ${p.name}${p.priceGHS ? ` (GHS ${p.priceGHS.toLocaleString()}/night)` : ''}. Could you share more details? Found on Getaway.gh`)
  const isAirbnb = !!p.airbnbUrl

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-vibe-navy/70 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl border-2 border-vibe-navy shadow-card w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-vibe-red hover:text-white flex items-center justify-center font-bold text-gray-500 transition-colors">✕</button>

        <p className="font-cursive text-vibe-blue text-lg mb-1">get in touch</p>
        <h2 className="font-display text-xl text-vibe-navy uppercase leading-tight mb-1">{p.name}</h2>
        <p className="font-body text-xs text-gray-400 mb-5">
          📍 {p.district}, {p.region}{isAirbnb ? ` · GHS ${p.priceGHS.toLocaleString()}/night` : ''}
        </p>

        {/* Contact details block */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4 space-y-2.5">
          {contact.phone && (
            <a href={`tel:${contact.phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-3 text-vibe-navy hover:text-vibe-blue transition-colors group">
              <span className="w-8 h-8 bg-vibe-navy text-white rounded-full flex items-center justify-center shrink-0 text-sm group-hover:bg-vibe-blue transition-colors">📞</span>
              <div>
                <p className="font-body text-xs text-gray-400 leading-none mb-0.5">Phone</p>
                <p className="font-body font-bold text-sm">{contact.phone}</p>
              </div>
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`}
              className="flex items-center gap-3 text-vibe-navy hover:text-vibe-blue transition-colors group">
              <span className="w-8 h-8 bg-vibe-navy text-white rounded-full flex items-center justify-center shrink-0 text-sm group-hover:bg-vibe-blue transition-colors">✉️</span>
              <div>
                <p className="font-body text-xs text-gray-400 leading-none mb-0.5">Email</p>
                <p className="font-body font-bold text-sm break-all">{contact.email}</p>
              </div>
            </a>
          )}
          {contact.website && (
            <a href={contact.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 text-vibe-navy hover:text-vibe-blue transition-colors group">
              <span className="w-8 h-8 bg-vibe-navy text-white rounded-full flex items-center justify-center shrink-0 text-sm group-hover:bg-vibe-blue transition-colors">🌐</span>
              <div>
                <p className="font-body text-xs text-gray-400 leading-none mb-0.5">{isAirbnb ? 'Airbnb listing' : 'Website'}</p>
                <p className="font-body font-bold text-sm truncate max-w-[200px]">
                  {isAirbnb ? 'View on Airbnb →' : contact.website.replace('https://', '')}
                </p>
              </div>
            </a>
          )}
        </div>

        <div className="space-y-2.5">
          {/* WhatsApp direct */}
          {whatsappNum && (
            <a href={`https://wa.me/${whatsappNum}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full py-3 px-4 rounded-xl border-2 border-vibe-navy bg-green-500 text-white font-body font-bold text-sm hover:bg-green-600 transition-colors">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.553 4.122 1.523 5.859L0 24l6.335-1.509A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.374l-.359-.213-3.721.887.929-3.613-.234-.372A9.818 9.818 0 0112 2.182c5.422 0 9.818 4.396 9.818 9.818S17.422 21.818 12 21.818z"/>
              </svg>
              Message on WhatsApp
            </a>
          )}

          {/* Share */}
          <button onClick={handleShare}
            className="flex items-center gap-3 w-full py-3 px-4 rounded-xl border-2 border-vibe-navy bg-vibe-yellow text-vibe-navy font-body font-bold text-sm hover:opacity-90 transition-opacity">
            <span className="text-lg">{copied ? '✅' : '🔗'}</span>
            {copied ? 'Link copied!' : 'Share with friends'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Weather chart ─────────────────────────────────────────────────── */
function WeatherChart({ weather }) {
  const maxRain = Math.max(...weather.months.map(m => m.rain), 1)
  return (
    <div>
      {weather.note && (
        <p className="font-body text-sm text-gray-600 italic mb-5 leading-relaxed">{weather.note}</p>
      )}
      {/* Chart */}
      <div className="flex items-end gap-0.5 h-36">
        {weather.months.map((m, i) => {
          const rainPct = Math.round((m.rain / maxRain) * 100)
          return (
            <div key={m.m} className="flex-1 flex flex-col items-center gap-1 group">
              {/* Temp label */}
              <span className="font-body text-[8px] font-bold text-vibe-navy opacity-0 group-hover:opacity-100 transition-opacity">{m.hi}°</span>
              {/* Rain bar */}
              <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                <div
                  className="w-full rounded-t-sm transition-all duration-300 group-hover:opacity-90"
                  style={{
                    height: `${Math.max(rainPct, 3)}%`,
                    background: rainPct > 60
                      ? '#1e40af'
                      : rainPct > 30
                        ? '#60a5fa'
                        : '#bfdbfe',
                  }}
                />
              </div>
              {/* Temp dot row */}
              <div
                className="w-2.5 h-2.5 rounded-full border-2 border-vibe-navy"
                style={{ background: m.hi > 31 ? '#E84422' : m.hi > 28 ? '#FBBF24' : '#60a5fa' }}
              />
              <span className="font-body text-[8px] text-gray-400 leading-none">{m.m}</span>
            </div>
          )
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-400" />
          <span className="font-body text-xs text-gray-500">Rainfall (mm)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-vibe-red border-2 border-vibe-navy" />
          <span className="font-body text-xs text-gray-500">Avg high temp · hover for °C</span>
        </div>
      </div>
      {/* Temp range table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              {weather.months.map(m => (
                <th key={m.m} className="font-body text-[8px] text-gray-400 pb-1 font-normal">{m.m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {weather.months.map(m => (
                <td key={m.m} className="font-body text-[9px] font-bold text-vibe-navy">{m.hi}°</td>
              ))}
            </tr>
            <tr>
              {weather.months.map(m => (
                <td key={m.m} className="font-body text-[9px] text-gray-400">{m.lo}°</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function PropertyDetail() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isSaved, toggle } = useTripBoard()
  const p = properties.find(prop => prop.id === Number(id))
  const [imgIdx,       setImgIdx]       = useState(0)
  const [showContact,  setShowContact]  = useState(false)
  const [galleryOpen,  setGalleryOpen]  = useState(false)
  const [activeTab,    setActiveTab]    = useState('overview')

  const fromCity = searchParams.get('from') || 'Accra'
  const setFromCity = (city) => setSearchParams(prev => {
    const next = new URLSearchParams(prev)
    next.set('from', city)
    return next
  }, { replace: true })

  const driveTime = useMemo(() => {
    if (!p?.coords) return null
    const city = DEPARTURE_CITIES.find(c => c.id === fromCity)
    return city ? estimateDriveTime(city.coords, p.coords) : null
  }, [fromCity, p?.coords])

  const imgs = p ? (p.images?.length > 0 ? p.images : [p.image]) : []

  const openGallery = useCallback((i = 0) => { setImgIdx(i); setGalleryOpen(true) }, [])
  const closeGallery = useCallback(() => setGalleryOpen(false), [])

  useEffect(() => {
    if (!galleryOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeGallery()
      if (e.key === 'ArrowRight') setImgIdx(i => (i + 1) % imgs.length)
      if (e.key === 'ArrowLeft') setImgIdx(i => (i - 1 + imgs.length) % imgs.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [galleryOpen, imgs.length, closeGallery])

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
  const related = properties.filter(r => r.id !== p.id && r.region === p.region).slice(0, 3)

  const tabs = [
    { id: 'overview',      label: 'Overview',       emoji: '✦' },
    ...(p.itinerary?.length || p.activities_nearby?.length ? [{ id: 'detail', label: 'In more detail', emoji: '📋' }] : []),
    ...(p.weather ? [{ id: 'weather', label: 'Weather', emoji: '🌤' }] : []),
    ...((p.transport || p.coords || p.safety) ? [{ id: 'getting-there', label: 'Getting there', emoji: '🗺' }] : []),
  ]

  return (
    <div className="min-h-screen bg-vibe-red page-enter">

      {showContact && <ContactModal p={p} onClose={() => setShowContact(false)} />}

      {/* ── LIGHTBOX ─────────────────────────────────────── */}
      {galleryOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center" onClick={closeGallery}>
          <button onClick={closeGallery}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors z-10">✕</button>
          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 font-body text-sm z-10">
            {imgIdx + 1} / {imgs.length}
          </p>

          {imgs.length > 1 && <>
            <button onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + imgs.length) % imgs.length) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-3xl transition-colors z-10">‹</button>
            <button onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % imgs.length) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-3xl transition-colors z-10">›</button>
          </>}

          <img src={imgs[imgIdx]} alt="" className="max-h-[80vh] max-w-[88vw] object-contain rounded-xl" onClick={e => e.stopPropagation()} />

          {imgs.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2" onClick={e => e.stopPropagation()}>
              {imgs.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-white opacity-100' : 'border-white/20 opacity-50 hover:opacity-80'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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

        {/* Mobile: swipeable slider */}
        <div className="sm:hidden relative rounded-2xl overflow-hidden border-2 border-vibe-navy shadow-card h-72">
          <img src={imgs[imgIdx]} alt={p.name} className="w-full h-full object-cover cursor-pointer" onClick={() => openGallery(imgIdx)} />
          {imgs.length > 1 && <>
            <button onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border-2 border-vibe-navy rounded-full flex items-center justify-center font-bold text-vibe-navy hover:bg-vibe-yellow transition-colors">‹</button>
            <button onClick={() => setImgIdx(i => (i + 1) % imgs.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border-2 border-vibe-navy rounded-full flex items-center justify-center font-bold text-vibe-navy hover:bg-vibe-yellow transition-colors">›</button>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white font-body text-xs px-2.5 py-1 rounded-full">{imgIdx + 1} / {imgs.length}</span>
          </>}
          <button onClick={() => openGallery(0)}
            className="absolute bottom-3 right-3 bg-white text-vibe-navy font-body text-xs font-bold px-3 py-1.5 rounded-xl border border-vibe-navy hover:bg-vibe-yellow transition-colors">
            ⊞ All photos
          </button>
        </div>

        {/* Desktop: Airbnb grid */}
        <div className="hidden sm:block relative rounded-2xl overflow-hidden border-2 border-vibe-navy shadow-card">
          <div className="grid grid-cols-4 grid-rows-2 gap-0.5 h-[440px] bg-vibe-navy">
            {/* Main image — left half */}
            <button className="col-span-2 row-span-2 relative overflow-hidden group" onClick={() => openGallery(0)}>
              <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
            </button>
            {/* 4 thumbnail slots */}
            {[1, 2, 3, 4].map(i => (
              <button key={i} onClick={() => openGallery(i < imgs.length ? i : 0)}
                className="relative overflow-hidden group">
                {i < imgs.length
                  ? <img src={imgs[i]} alt="" className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300" />
                  : <div className="w-full h-full bg-gray-900/40" />
                }
              </button>
            ))}
          </div>
          {/* Show all photos button — bottom right, over last cell */}
          <button onClick={() => openGallery(0)}
            className="absolute bottom-4 right-4 bg-white text-vibe-navy font-body text-sm font-bold px-4 py-2.5 rounded-xl border-2 border-vibe-navy hover:bg-vibe-yellow transition-colors flex items-center gap-2 shadow-btn">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Show all photos
          </button>
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

            {/* Location + tags */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <p className="font-body font-bold text-white/80 text-sm uppercase tracking-wide">📍 {p.district}, {p.region}</p>
            </div>
            {p.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {p.tags.map(tag => (
                  <span key={tag} className={`${getTagClass(tag)} font-body text-sm font-bold px-3 py-1 rounded-full`}>{tag}</span>
                ))}
              </div>
            )}

            {/* ── TAB BAR ──────────────────────────────────────── */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6 -mx-1 px-1 scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-vibe-navy font-display text-xs uppercase tracking-wide transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'bg-vibe-navy text-white'
                      : 'bg-white text-vibe-navy hover:bg-vibe-yellow'}`}
                >
                  <span>{tab.emoji}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW TAB ─────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">

                {/* Best bits strip */}
                {p.bestBits?.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                    {p.bestBits.map((bit, i) => (
                      <div key={i} className="shrink-0 flex items-start gap-2.5 bg-vibe-yellow border-2 border-vibe-navy rounded-xl px-4 py-3 min-w-[140px] max-w-[180px]">
                        <span className="text-xl mt-0.5 shrink-0">{bit.icon}</span>
                        <p className="font-body text-xs font-bold text-vibe-navy leading-snug">{bit.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-5">
                  <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-2">The Vibe</p>
                  <p className="font-body text-vibe-navy leading-relaxed">{p.description}</p>
                </div>

                {/* What's included / not included */}
                {(p.included?.length > 0 || p.notIncluded?.length > 0) && (
                  <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-5">
                    <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-4">What's included</p>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                      {/* Included */}
                      <div>
                        {p.included?.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                            <span className="text-emerald-500 font-bold text-base shrink-0 leading-none mt-0.5">✓</span>
                            <span className="font-body text-sm text-vibe-navy">{item}</span>
                          </div>
                        ))}
                      </div>
                      {/* Not included */}
                      {p.notIncluded?.length > 0 && (
                        <div>
                          <p className="font-display text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Not included</p>
                          {p.notIncluded.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                              <span className="text-gray-300 font-bold text-base shrink-0 leading-none mt-0.5">✗</span>
                              <span className="font-body text-sm text-gray-500">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {p.amenities?.length > 0 && (
                  <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-5">
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
                )}

                {/* Accessibility */}
                {p.accessibility && (
                  <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4">
                    <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-2">♿ Accessibility</p>
                    <p className="font-body text-sm text-gray-600">{p.accessibility}</p>
                  </div>
                )}

                {/* Best months */}
                {p.bestMonths && (
                  <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4">
                    <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">📅 Best time to visit</p>
                    <div className="flex gap-0 rounded-lg overflow-hidden border border-gray-200">
                      {MONTHS.map((m, i) => {
                        const active = p.bestMonths.includes(m)
                        return (
                          <div key={m} className={`flex-1 flex flex-col items-center py-2.5 gap-1 ${active ? 'bg-vibe-yellow/30' : ''}`}
                            style={{ borderLeft: i > 0 ? '1px solid #e5e7eb' : 'none' }}>
                            <span className={`w-2 h-2 rounded-full ${active ? 'bg-vibe-navy' : 'bg-gray-200'}`} />
                            <span className={`font-body text-[9px] font-bold ${active ? 'text-vibe-navy' : 'text-gray-300'}`}>{m}</span>
                          </div>
                        )
                      })}
                    </div>
                    {p.bestMonths && (
                      <p className="font-body text-xs text-gray-500 mt-2">
                        Best: <span className="font-bold text-vibe-navy">{p.bestMonths.join(', ')}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Festivals */}
                {getFestivals(p.id).length > 0 && (
                  <div className="bg-vibe-yellow rounded-xl border-2 border-vibe-navy shadow-card p-5">
                    <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-4">🎉 What's on nearby</p>
                    <div className="space-y-4">
                      {getFestivals(p.id).map((f, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="text-2xl shrink-0 mt-0.5">{f.emoji}</span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <p className="font-display text-sm text-vibe-navy uppercase leading-tight">{f.name}</p>
                              <span className="font-body text-[10px] font-extrabold bg-vibe-navy text-white px-2 py-0.5 rounded-full">{f.month}</span>
                            </div>
                            <p className="font-body text-xs text-vibe-navy/80 leading-relaxed">{f.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ── IN MORE DETAIL TAB ───────────────────────────── */}
            {activeTab === 'detail' && (
              <div className="space-y-6">

                {/* Day-by-day itinerary */}
                {p.itinerary?.length > 0 && (
                  <div>
                    <h2 className="font-display text-lg text-white uppercase mb-4">Day-by-day itinerary</h2>
                    <div className="space-y-3">
                      {p.itinerary.map((day, i) => (
                        <div key={i} className="bg-white rounded-xl border-2 border-vibe-navy shadow-card overflow-hidden">
                          <div className="flex items-center gap-3 px-4 py-3 bg-vibe-navy">
                            <span className="font-display text-vibe-yellow text-sm uppercase">Day {day.day}</span>
                            <span className="text-white/30">·</span>
                            <span className="font-display text-white text-sm uppercase">{day.title}</span>
                          </div>
                          <div className="p-4">
                            <ul className="space-y-2">
                              {day.activities.map((act, j) => (
                                <li key={j} className="flex items-start gap-2.5 font-body text-sm text-vibe-navy">
                                  <span className="text-vibe-yellow font-bold shrink-0 mt-0.5">✦</span>
                                  {act}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nearby excursions */}
                {p.activities_nearby?.length > 0 && (
                  <div>
                    <h2 className="font-display text-lg text-white uppercase mb-4">Nearby excursions</h2>
                    <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-5">
                      <div className="space-y-0">
                        {p.activities_nearby.map((act, i) => (
                          <div key={i} className={`flex items-start gap-3 py-3 ${i < p.activities_nearby.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <span className="text-vibe-yellow font-bold text-lg shrink-0 leading-none">✦</span>
                            <p className="font-body text-sm text-vibe-navy leading-snug">{act}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Nearby amenities */}
                <NearbyAmenities coords={p.coords} propertyId={p.id} />

                {/* Reviews — all sources */}
                {p.reviews?.length > 0 && (
                  <div>
                    <h2 className="font-display text-lg text-white uppercase mb-4">What guests say</h2>
                    <div className="space-y-3">
                      {p.reviews.map((r, i) => (
                        <div key={i} className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 bg-vibe-navy text-white rounded-full flex items-center justify-center font-display text-sm shrink-0">{r.avatar}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-body font-bold text-vibe-navy text-sm">{r.user}</p>
                                {r.source && (
                                  <span className={`font-body text-[9px] font-bold px-1.5 py-0.5 rounded-full ${r.source === 'airbnb' ? 'bg-[#FF5A5F]/10 text-[#FF5A5F]' : r.source === 'google' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {r.source}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <span key={j} className="text-vibe-yellow text-sm">★</span>)}{Array.from({ length: 5 - r.rating }).map((_, j) => <span key={j} className="text-gray-200 text-sm">★</span>)}</div>
                            </div>
                          </div>
                          <p className="font-body text-sm text-gray-700 italic">"{r.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ── WEATHER TAB ──────────────────────────────────── */}
            {activeTab === 'weather' && p.weather && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-5">
                  <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-4">🌤 Monthly climate</p>
                  <WeatherChart weather={p.weather} />
                </div>

                {p.bestMonths && (
                  <div className="bg-vibe-yellow rounded-xl border-2 border-vibe-navy shadow-card p-5">
                    <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">📅 Best months to visit</p>
                    <div className="flex gap-0 rounded-lg overflow-hidden border-2 border-vibe-navy">
                      {MONTHS.map((m, i) => {
                        const active = p.bestMonths.includes(m)
                        return (
                          <div key={m} className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${active ? 'bg-vibe-navy' : 'bg-white'}`}
                            style={{ borderLeft: i > 0 ? '1px solid #0E1C40' : 'none' }}>
                            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-vibe-yellow' : 'bg-gray-200'}`} />
                            <span className={`font-display text-[9px] uppercase ${active ? 'text-white font-bold' : 'text-gray-300'}`}>{m}</span>
                          </div>
                        )
                      })}
                    </div>
                    <p className="font-body text-xs text-vibe-navy mt-3">
                      <span className="font-bold">Recommended months:</span> {p.bestMonths.join(' · ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── GETTING THERE TAB ────────────────────────────── */}
            {activeTab === 'getting-there' && (
              <div className="space-y-6">

                {/* Transport + drive time */}
                {p.transport && (
                  <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4">
                    <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">🚗 Getting there from</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {DEPARTURE_CITIES.map(c => (
                        <button key={c.id} onClick={() => setFromCity(c.id)}
                          className={`font-body font-extrabold text-[11px] px-2.5 py-1 rounded-full border-2 transition-colors ${fromCity === c.id ? 'bg-vibe-navy text-white border-vibe-navy' : 'text-vibe-navy border-vibe-navy/30 hover:border-vibe-navy'}`}>
                          {c.id}
                        </button>
                      ))}
                    </div>
                    {driveTime && (
                      <p className="font-display text-xl text-vibe-navy mb-2">{driveTime} from {fromCity}</p>
                    )}
                    <p className="font-body text-sm text-gray-500">{p.transport}</p>
                  </div>
                )}

                {/* Map */}
                {p.coords && (
                  <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                      <p className="font-display text-xs text-vibe-navy uppercase tracking-wider">📍 Find it on the map</p>
                      <a
                        href={`https://www.google.com/maps?q=${p.coords.lat},${p.coords.lng}`}
                        target="_blank" rel="noopener noreferrer"
                        className="font-display text-xs font-bold bg-vibe-navy text-white px-3 py-1.5 rounded-full hover:bg-vibe-yellow hover:text-vibe-navy transition-colors"
                      >
                        Open in Google Maps ↗
                      </a>
                    </div>
                    <iframe
                      title={`Map of ${p.name}`}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.coords.lng - 0.015},${p.coords.lat - 0.01},${p.coords.lng + 0.015},${p.coords.lat + 0.01}&layer=mapnik&marker=${p.coords.lat},${p.coords.lng}`}
                      className="w-full h-52 border-0"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Safety & packing */}
                {p.safety && (
                  <div className="bg-vibe-yellow rounded-xl border-2 border-vibe-navy shadow-card p-4">
                    <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">🧳 Before you go</p>
                    {p.safety.road && (
                      <div className="flex items-start gap-2.5 mb-2.5 pb-2.5 border-b border-vibe-navy/10">
                        <span className="shrink-0 text-base">🚗</span>
                        <p className="font-body text-sm text-vibe-navy">{p.safety.road}</p>
                      </div>
                    )}
                    {p.safety.health && (
                      <div className="flex items-start gap-2.5 mb-2.5 pb-2.5 border-b border-vibe-navy/10">
                        <span className="shrink-0 text-base">💊</span>
                        <p className="font-body text-sm text-vibe-navy">{p.safety.health}</p>
                      </div>
                    )}
                    {p.safety.pack?.length > 0 && (
                      <div>
                        <p className="font-display text-[10px] text-vibe-navy uppercase tracking-wider mb-2">Pack list</p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.safety.pack.map((item, i) => (
                            <span key={i} className="font-body text-xs font-bold bg-white text-vibe-navy px-2.5 py-1 rounded-full border border-vibe-navy">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>

          {/* RIGHT COLUMN — sticky panel */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-5">
                {p.priceGHS && (
                  <div className="mb-5">
                    <span className="font-body text-xs text-gray-500">from</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-3xl text-vibe-navy">GHS {p.priceGHS.toLocaleString()}</span>
                      <span className="font-body text-sm text-gray-400">/ night</span>
                    </div>
                    {p.priceUSD && <span className="font-body text-xs text-gray-400">≈ ${p.priceUSD} USD per night</span>}
                  </div>
                )}

                <button onClick={() => setShowContact(true)}
                  className="vibe-btn w-full block text-center bg-vibe-blue text-white font-display text-base py-3 rounded-full border-2 border-vibe-navy mb-3">
                  CONTACT SPOT
                </button>

                <button onClick={() => toggle(p.id)}
                  className={`vibe-btn w-full font-display text-base py-3 rounded-full border-2 border-vibe-navy transition-colors ${saved ? 'bg-vibe-red text-white' : 'bg-vibe-yellow text-vibe-navy'}`}>
                  {saved ? '❤️ SAVED' : '🤍 SAVE SPOT'}
                </button>
              </div>

              {/* Good for */}
              {p.groups?.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4">
                  <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">Good for</p>
                  <div className="flex flex-wrap gap-2">
                    {p.groups.map(g => {
                      const labels = { solo: '🧍 Solo', couple: '👫 Couples', group4: '👥 Groups (4+)', large: '🎉 Large groups (10+)' }
                      return <span key={g} className="font-body text-xs font-bold bg-vibe-yellow text-vibe-navy px-3 py-1.5 rounded-full border border-vibe-navy">{labels[g]}</span>
                    })}
                  </div>
                </div>
              )}

              {/* Activities */}
              {(() => {
                const TAG_ACTIVITIES = {
                  'Beach': ['🏊 Swimming', '🏐 Beach volleyball', '☀️ Sunbathing', '🐚 Shell collecting'],
                  'Beach Front': ['🏊 Swimming', '☀️ Sunbathing', '🚤 Boat rides'],
                  'Watersports': ['🚤 Jet skiing', '🛶 Kayaking', '🏄 Paddleboarding', '⛵ Sailing', '🎣 Fishing'],
                  'Hiking': ['🥾 Trail hiking', '🌄 Sunrise hikes', '📸 Nature photography', '🦅 Bird watching'],
                  'Nature': ['🌿 Nature walks', '🦋 Butterfly spotting', '📸 Wildlife photography', '🏕️ Picnics'],
                  'Eco': ['🌱 Eco tours', '🏕️ Camping', '🦉 Night walks', '🌿 Forest bathing'],
                  'Eco Retreat': ['🌱 Eco tours', '🏕️ Camping', '🦉 Night walks', '🌿 Forest bathing'],
                  'Mountain Views': ['⛰️ Scenic viewpoints', '🥾 Hill climbing', '🌄 Sunrise watching', '📸 Photography'],
                  'Lakeside': ['🚣 Rowing', '🎣 Fishing', '🛶 Canoe trips', '🌅 Sunset watching', '🏊 Lake swimming'],
                  'Volta Lake': ['🛶 Canoe trips', '🎣 Fishing', '🚢 Lake cruises', '🌅 Sunset watching'],
                  'Waterfall': ['💦 Waterfall swimming', '🥾 Waterfall hike', '📸 Photography', '🌿 Nature walks'],
                  'Cultural': ['🏛️ Heritage tours', '🍲 Local cuisine', '🎭 Traditional shows', '🛍️ Market visits'],
                  'Heritage': ['🏛️ Historical tours', '🏰 Castle visits', '📜 Cultural walks', '🍲 Local food'],
                  'Nightlife': ['🎶 Live music', '🍹 Cocktail bar', '🔥 Bonfire nights', '🎉 Night events'],
                  'Wildlife': ['🦁 Safari drives', '🐘 Wildlife spotting', '📸 Game photography', '🦒 Walking safaris'],
                  'Safari': ['🦁 Game drives', '🐘 Elephant walks', '📸 Wildlife photography', '⛺ Bush camping'],
                  'Foodie': ['🍲 Local cuisine tasting', '🫕 Cooking classes', '🛍️ Market tours', '🥘 Street food walks'],
                  'Forest': ['🌲 Forest walks', '🦋 Butterfly trails', '🏕️ Camping', '🐦 Bird watching'],
                  'Chill Vibes': ['📚 Reading & relaxing', '🎲 Board games', '🌅 Sunset lounging', '🎵 Music sessions'],
                  'City': ['🚶 City walks', '🛍️ Shopping', '🍽️ Restaurant hopping', '🎭 Events & shows'],
                  'Budget': ['🚶 Self-guided walks', '🎲 Board games', '🍲 Local eateries', '📸 Photography'],
                  'Luxury': ['🧖 Spa & wellness', '🍾 Fine dining', '🏊 Private pool', '🚁 Helicopter tours'],
                  'Villa': ['🏊 Private pool', '🍳 Private chef', '🎉 Private events', '🧖 In-villa spa'],
                }
                const activities = [...new Set((p.tags || []).flatMap(t => TAG_ACTIVITIES[t] || []))].slice(0, 8)
                if (!activities.length) return null
                return (
                  <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4">
                    <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">Activities</p>
                    <div className="flex flex-wrap gap-2">
                      {activities.map(a => (
                        <span key={a} className="font-body text-xs font-bold bg-gray-50 text-vibe-navy px-2.5 py-1 rounded-full border border-gray-200">{a}</span>
                      ))}
                    </div>
                  </div>
                )
              })()}
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
