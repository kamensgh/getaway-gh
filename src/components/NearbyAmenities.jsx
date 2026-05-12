import { nearbyData } from '../data/nearby-data'

const CATS = [
  { key: 'restaurant', label: 'Restaurants', icon: '🍽️' },
  { key: 'nightlife',  label: 'Bars & Clubs', icon: '🎶' },
  { key: 'medical',   label: 'Medical',       icon: '🏥' },
  { key: 'atm',       label: 'ATMs & Banks',  icon: '💳' },
  { key: 'nature',    label: 'Nature',        icon: '🌿' },
]

export default function NearbyAmenities({ coords, propertyId }) {
  if (!coords || !propertyId) return null
  const grouped = nearbyData[String(propertyId)]
  if (!grouped) return null

  const hasAny = CATS.some(c => grouped[c.key]?.length > 0)

  return (
    <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4 mb-6">
      <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-4">🗺️ What's nearby · 2 km radius</p>

      {!hasAny ? (
        <p className="font-body text-sm text-gray-400">No mapped amenities within 2 km — this is a remote spot!</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {CATS.map(cat => {
            const items = grouped[cat.key] || []
            const names = items.slice(0, 3).map(p => p.name).filter(Boolean)
            const topRated = items.find(p => p.rating >= 4)
            return (
              <div key={cat.key} className={`flex items-start gap-3 py-2.5 ${items.length === 0 ? 'opacity-35' : ''}`}>
                <span className="text-base shrink-0 mt-0.5">{cat.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-display text-xs font-bold text-vibe-navy">{cat.label}</span>
                    <span className="font-body text-xs text-gray-400">
                      {items.length === 0 ? 'none nearby' : `${items.length} found`}
                    </span>
                    {topRated && (
                      <span className="font-body text-xs text-amber-500">★ {topRated.rating} {topRated.name}</span>
                    )}
                  </div>
                  {names.length > 0 && (
                    <p className="font-body text-xs text-gray-500 mt-0.5 truncate">{names.join(' · ')}</p>
                  )}
                </div>
                {items.length > 0 && (
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(cat.label)}/@${coords.lat},${coords.lng},14z`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 font-body text-xs text-vibe-navy underline underline-offset-2 hover:text-vibe-yellow transition-colors"
                  >
                    View ↗
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
