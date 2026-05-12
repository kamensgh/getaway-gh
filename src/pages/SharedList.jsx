import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { properties, getTagClass } from '../data/properties'

export default function SharedList() {
  const { uid } = useParams()
  const [listData, setListData] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!uid) { setNotFound(true); setLoading(false); return }
    getDoc(doc(db, 'publicLists', uid))
      .then(snap => {
        if (!snap.exists()) { setNotFound(true) }
        else { setListData(snap.data()) }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [uid])

  if (loading) {
    return (
      <div className="min-h-screen bg-vibe-red flex items-center justify-center">
        <p className="font-display text-3xl text-white uppercase animate-pulse">Loading…</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-vibe-red flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-display text-6xl text-white/20 uppercase mb-4">404</p>
          <p className="font-body font-bold text-white/70 mb-6">This list doesn't exist or hasn't been shared yet.</p>
          <Link to="/" className="vibe-btn bg-vibe-yellow text-vibe-navy font-display text-base px-8 py-4 rounded-full border-2 border-vibe-navy">
            EXPLORE GETAWAY.GH
          </Link>
        </div>
      </div>
    )
  }

  const savedProps = properties.filter(p => (listData.saved || []).includes(p.id))
  const ownerName  = listData.displayName || 'A Traveller'

  return (
    <div className="min-h-screen bg-vibe-red page-enter">
      {/* Header */}
      <div className="pt-28 pb-8 px-4 bg-vibe-navy">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            {listData.photoURL ? (
              <img src={listData.photoURL} alt={ownerName}
                className="w-16 h-16 rounded-full border-3 border-vibe-yellow shadow-btn shrink-0"
                referrerPolicy="no-referrer" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-vibe-yellow border-3 border-white flex items-center justify-center font-display text-vibe-navy text-2xl shrink-0">
                {ownerName[0]}
              </div>
            )}
            <div>
              <p className="font-cursive text-vibe-yellow text-lg">getaway list by</p>
              <h1 className="font-display text-3xl sm:text-4xl text-white uppercase leading-tight">
                {ownerName}
              </h1>
              <p className="font-body text-white/50 text-xs mt-0.5">
                {savedProps.length} spot{savedProps.length !== 1 ? 's' : ''} saved · Last updated {new Date(listData.updatedAt?.seconds * 1000 || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 py-10 max-w-5xl mx-auto">
        {savedProps.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-4xl text-white/20 uppercase mb-4">EMPTY LIST</p>
            <p className="font-body font-bold text-white/50">This list has no spots yet.</p>
          </div>
        ) : (
          <>
            <p className="font-cursive text-vibe-yellow text-xl mb-6">{ownerName.split(' ')[0]}'s favourite getaways</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedProps.map(p => (
                <div key={p.id}
                  className="property-card bg-white rounded-xl2 border-2 border-vibe-navy shadow-card overflow-visible"
                  style={{ transform: `rotate(${p.rotate})` }}>
                  <div className="relative h-48 overflow-hidden rounded-t-xl border-b-2 border-vibe-navy">
                    <Link to={`/property/${p.id}`}>
                      <img src={p.image} alt={p.name} className="card-img w-full h-full object-cover" />
                    </Link>
                    <span className={`absolute top-3 right-3 ${p.priceTag} font-display text-xs px-2.5 py-1 rounded-full border border-vibe-navy`}>
                      GHS {p.priceGHS.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-4">
                    <Link to={`/property/${p.id}`}>
                      <h3 className="font-display text-base text-vibe-navy uppercase leading-tight mb-1">{p.name}</h3>
                      <p className="font-body text-xs text-vibe-blue font-bold uppercase tracking-wide mb-3">{p.district}, {p.region}</p>
                    </Link>
                    <div className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 2).map(tag => (
                        <span key={tag} className={`${getTagClass(tag)} font-body text-xs font-bold px-2 py-0.5 rounded-full`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-16 text-center">
          <p className="font-cursive text-white/50 text-lg mb-3">build your own list</p>
          <Link to="/" className="vibe-btn bg-vibe-yellow text-vibe-navy font-display text-base px-8 py-4 rounded-full border-2 border-vibe-navy inline-block">
            EXPLORE GETAWAY.GH
          </Link>
        </div>
      </div>

      <footer className="bg-vibe-navy py-6 text-center mt-8">
        <p className="font-body font-bold text-white/60 text-sm">Getaway.gh — Discover Ghana © 2025</p>
      </footer>
    </div>
  )
}
