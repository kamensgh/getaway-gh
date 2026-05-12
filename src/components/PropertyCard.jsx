import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useTripBoard } from '../context/TripBoardContext'
import { getTagClass } from '../data/properties'
import { estimateDriveTime, DEPARTURE_CITIES } from '../utils/driveTime'

export default function PropertyCard({ property: p, style, fromCity }) {
  const { isSaved, toggle } = useTripBoard()
  const saved = isSaved(p.id)
  const image = p.image || p.images?.[0] || ''
  const tags = p.tags || []

  const driveTime = useMemo(() => {
    if (!fromCity || !p.coords) return null
    const city = DEPARTURE_CITIES.find(c => c.id === fromCity)
    return city ? estimateDriveTime(city.coords, p.coords) : null
  }, [fromCity, p.coords])

  return (
    <div className="property-card relative bg-white rounded-xl2 border-2 border-vibe-navy shadow-card overflow-visible cursor-pointer group"
      style={{ transform: p.rotate ? `rotate(${p.rotate})` : undefined, ...style }}>

      {/* Image */}
      <Link to={fromCity ? `/property/${p.id}?from=${encodeURIComponent(fromCity)}` : `/property/${p.id}`}>
        <div className="relative h-52 overflow-hidden border-b-2 border-vibe-navy rounded-t-xl2">
          <img src={image} alt={p.name} className="card-img w-full h-full object-cover" loading="lazy" />

          {p.priceGHS && p.priceTag && (
            <span className={`absolute top-2 right-2 ${p.priceTag} font-display text-xs px-2 py-0.5 rounded-full border border-vibe-navy`}>
              GHS {p.priceGHS.toLocaleString()}
            </span>
          )}

        </div>
      </Link>

      {/* Save heart */}
      <button onClick={e => { e.preventDefault(); toggle(p.id) }}
        className={`save-btn absolute top-2 left-2 w-9 h-9 rounded-full border-2 border-vibe-navy flex items-center justify-center text-base z-10 shadow-btn ${saved ? 'bg-vibe-red' : 'bg-white text-gray-400'}`}
        aria-label={saved ? 'Remove spot' : 'Save spot'}>
        <svg className="w-4 h-4" fill={saved ? 'white' : 'none'} stroke={saved ? 'white' : 'currentColor'} strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {/* Card body */}
      <Link to={fromCity ? `/property/${p.id}?from=${encodeURIComponent(fromCity)}` : `/property/${p.id}`}>
        <div className="p-4">
          <div className="mb-1">
            <p className="font-body text-xs text-gray-500 font-semibold leading-tight">{p.badge}</p>
          </div>

          <h3 className="font-display text-base text-vibe-navy uppercase leading-tight mb-1">{p.name}</h3>

          <div className="flex items-center gap-1 mb-1">
            <svg className="w-3 h-3 text-vibe-red shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="font-body text-xs font-bold uppercase tracking-wide text-vibe-blue">{p.district}, {p.region}</span>
          </div>

          {driveTime ? (
            <p className="font-body text-xs text-gray-500 font-bold mb-2">🚗 {driveTime} from {fromCity}</p>
          ) : p.transport && (
            <p className="font-body text-xs text-gray-400 mb-2">🚗 {p.transport.split('·')[0].trim()}</p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 2).map(tag => (
              <span key={tag} className={`${getTagClass(tag)} font-body text-xs font-bold px-2 py-0.5 rounded-full`}>{tag}</span>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <span className="font-body text-xs text-gray-400">{p.type}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
