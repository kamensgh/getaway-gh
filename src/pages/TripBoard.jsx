import { useState } from 'react'
import { Link } from 'react-router-dom'
import { properties, getTagClass } from '../data/properties'
import { useTripBoard } from '../context/TripBoardContext'

const REACTIONS = ['👍', '🔥', '❓']

export default function TripBoard() {
  const { saved, toggle, react, hasReacted } = useTripBoard()
  const [linkCopied, setLinkCopied] = useState(false)
  const [tripName, setTripName] = useState('')

  const savedProperties = properties.filter(p => saved.includes(p.id))

  const copyLink = () => {
    navigator.clipboard.writeText(
      window.location.origin + '/board?trip=' + encodeURIComponent(tripName || 'My Ghana Getaway')
    )
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-vibe-red page-enter">
      {/* Header */}
      <div className="pt-28 pb-8 px-4 bg-vibe-navy">
        <div className="max-w-5xl mx-auto">
          <p className="font-cursive text-vibe-yellow text-2xl mb-1">plan your getaway</p>
          <h1 className="font-display text-5xl sm:text-6xl text-white uppercase leading-tight mb-4">
            YOUR TRIP BOARD
          </h1>
          <p className="font-body text-white/70 mb-6">
            {savedProperties.length === 0
              ? "You haven't saved any spots yet. Go explore and heart the ones that catch your eye."
              : `${savedProperties.length} spot${savedProperties.length > 1 ? 's' : ''} saved — react and share with friends.`}
          </p>

          {/* Share bar */}
          <div className="bg-white rounded-2xl border-2 border-vibe-navy p-4 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Name your trip (e.g. Ada Weekend 🏖️)"
              value={tripName}
              onChange={e => setTripName(e.target.value)}
              className="flex-1 font-body text-sm text-vibe-navy border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-vibe-blue"
            />
            <button onClick={copyLink}
              className={`vibe-btn font-display text-sm px-6 py-2.5 rounded-xl border-2 border-vibe-navy transition-all whitespace-nowrap ${
                linkCopied ? 'bg-green-500 text-white' : 'bg-vibe-yellow text-vibe-navy'
              }`}>
              {linkCopied ? '✓ LINK COPIED!' : '🔗 SHARE GETAWAY'}
            </button>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="px-4 py-10 max-w-5xl mx-auto">
        {savedProperties.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-6xl text-white/20 uppercase mb-4">EMPTY</p>
            <p className="font-body font-bold text-white/60 mb-8">Your board is waiting for some vibes.</p>
            <Link to="/" className="vibe-btn bg-vibe-yellow text-vibe-navy font-display text-base px-8 py-4 rounded-full border-2 border-vibe-navy inline-block">
              EXPLORE SPOTS
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedProperties.map(property => (
              <div key={property.id}
                className="property-card bg-white rounded-xl2 border-2 border-vibe-navy shadow-card overflow-visible"
                style={{ transform: `rotate(${property.rotate})` }}>

                {/* Photo */}
                <div className="relative h-48 overflow-hidden rounded-t-xl border-b-2 border-vibe-navy">
                  <Link to={`/property/${property.id}`}>
                    <img src={property.image} alt={property.name} className="card-img w-full h-full object-cover" />
                  </Link>
                  <span className={`absolute top-3 right-3 ${property.priceTag} font-display text-xs px-2.5 py-1 rounded-full border border-vibe-navy`}>
                    GHS {property.priceGHS.toLocaleString()}
                  </span>
                  <button onClick={() => toggle(property.id)}
                    className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white border-2 border-vibe-navy flex items-center justify-center text-vibe-red text-xs font-black hover:bg-red-50 transition-colors shadow-btn"
                    title="Remove">✕</button>
                </div>

                {/* Body */}
                <div className="p-4">
                  <Link to={`/property/${property.id}`}>
                    <h3 className="font-display text-base text-vibe-navy uppercase leading-tight mb-1">{property.name}</h3>
                    <p className="font-body text-xs text-vibe-blue font-bold uppercase tracking-wide mb-3">{property.district}, {property.region}</p>
                  </Link>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {property.tags.slice(0, 2).map(tag => (
                      <span key={tag} className={`${getTagClass(tag)} font-body text-xs font-bold px-2 py-0.5 rounded-full`}>{tag}</span>
                    ))}
                  </div>

                  {/* Reactions */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="font-body text-xs text-gray-400 font-bold mb-2">Squad vote:</p>
                    <div className="flex gap-2">
                      {REACTIONS.map(emoji => (
                        <button key={emoji} onClick={() => react(property.id, emoji)}
                          className={`react-btn font-body text-lg px-2.5 py-1 rounded-full border-2 border-vibe-navy transition-all ${
                            hasReacted(property.id, emoji) ? 'bg-vibe-navy text-white' : 'bg-white text-vibe-navy hover:bg-vibe-yellow'
                          }`}>
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-vibe-navy py-6 text-center mt-8">
        <p className="font-body font-bold text-white/60 text-sm">Getaway.gh — Discover Ghana © 2025</p>
      </footer>
    </div>
  )
}
