import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { useTripBoard } from '../context/TripBoardContext'
import { properties, getTagClass } from '../data/properties'

const REACTIONS = ['👍', '🔥', '❓']
const BASE_URL = 'https://getaway-gh.vercel.app'

export default function UserProfile() {
  const { user, signOut, signInWithGoogle } = useAuth()
  const { saved, toggle, react, hasReacted } = useTripBoard()
  const navigate = useNavigate()
  const [shareState, setShareState] = useState('idle') // idle | sharing | copied | error
  const [shareError, setShareError] = useState('')

  async function handleShare() {
    if (!user || shareState === 'sharing') return
    setShareState('sharing')
    const url = `${BASE_URL}/list/${user.uid}`
    try {
      await navigator.clipboard.writeText(url)
      await setDoc(doc(db, 'publicLists', user.uid), {
        displayName: user.displayName || 'A Traveller',
        photoURL: user.photoURL || null,
        saved,
        updatedAt: serverTimestamp(),
      })
      setShareState('copied')
      setTimeout(() => setShareState('idle'), 3000)
    } catch (err) {
      console.error('Share failed:', err)
      setShareError(err?.message || String(err))
      setShareState('error')
      setTimeout(() => { setShareState('idle'); setShareError('') }, 8000)
    }
  }

  const savedProperties = properties.filter(p => saved.includes(p.id))

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  // Not signed in — prompt to login
  if (!user) {
    return (
      <div className="min-h-screen bg-vibe-red flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border-2 border-vibe-navy shadow-card p-10 max-w-sm w-full text-center">
          <p className="text-5xl mb-4">🇬🇭</p>
          <h2 className="font-display text-3xl text-vibe-navy uppercase mb-2">Sign in to save spots</h2>
          <p className="font-body text-gray-500 text-sm mb-6 leading-relaxed">
            Create a free account to save your favourite Ghana getaways and access them from any device.
          </p>
          <button onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-vibe-navy rounded-xl px-5 py-3 font-body font-bold text-vibe-navy hover:bg-vibe-yellow transition-colors shadow-btn mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
          <Link to="/" className="font-body text-sm text-gray-400 hover:text-vibe-navy transition-colors">
            Continue browsing →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vibe-red page-enter">
      {/* Profile header */}
      <div className="pt-28 pb-8 px-4 bg-vibe-navy">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName}
                  className="w-16 h-16 rounded-full border-3 border-vibe-yellow shadow-btn shrink-0"
                  referrerPolicy="no-referrer" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-vibe-yellow border-3 border-white flex items-center justify-center font-display text-vibe-navy text-2xl shrink-0">
                  {user.displayName?.[0] ?? '?'}
                </div>
              )}
              <div>
                <p className="font-cursive text-vibe-yellow text-lg">welcome back</p>
                <h1 className="font-display text-3xl sm:text-4xl text-white uppercase leading-tight">
                  {user.displayName || 'Traveller'}
                </h1>
                <p className="font-body text-white/60 text-sm mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
              <button onClick={handleShare} disabled={shareState === 'sharing'}
                className="font-body font-bold text-sm bg-vibe-yellow text-vibe-navy px-4 py-2 rounded-full border-2 border-vibe-navy hover:bg-yellow-300 transition-colors shadow-btn disabled:opacity-60">
                {shareState === 'sharing' ? 'Sharing…' : shareState === 'copied' ? 'Link copied!' : shareState === 'error' ? 'Failed — retry' : 'Share my list'}
              </button>
              <button onClick={handleSignOut}
                className="font-body font-bold text-sm bg-vibe-red text-white px-4 py-2 rounded-full border-2 border-white hover:bg-red-700 transition-colors shadow-btn">
                Sign out
              </button>
            </div>
          </div>
          {shareError && (
            <p className="mt-3 font-body text-xs text-vibe-yellow/80 bg-white/10 rounded-lg px-3 py-2 break-all">{shareError}</p>
          )}

          {/* Stats row */}
          <div className="flex gap-6 mt-6 pt-6 border-t border-white/10">
            <div>
              <p className="font-display text-3xl text-vibe-yellow">{savedProperties.length}</p>
              <p className="font-body text-xs text-white/60 uppercase tracking-wide">Spots saved</p>
            </div>
            <div>
              <p className="font-display text-3xl text-vibe-yellow">
                {Object.values(
                  savedProperties.reduce((acc, p) => {
                    const r = new Set(REACTIONS.filter(e => hasReacted(p.id, e)))
                    r.forEach(e => { acc[`${p.id}-${e}`] = true })
                    return acc
                  }, {})
                ).length}
              </p>
              <p className="font-body text-xs text-white/60 uppercase tracking-wide">Reactions</p>
            </div>
            <div>
              <p className="font-display text-3xl text-vibe-yellow">
                {[...new Set(savedProperties.map(p => p.region))].length}
              </p>
              <p className="font-body text-xs text-white/60 uppercase tracking-wide">Regions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Saved spots */}
      <div className="px-4 py-10 max-w-5xl mx-auto">
        {savedProperties.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-5xl text-white/20 uppercase mb-4">EMPTY</p>
            <p className="font-body font-bold text-white/60 mb-8">
              Heart spots on the explore page to save them here.
            </p>
            <Link to="/" className="vibe-btn bg-vibe-yellow text-vibe-navy font-display text-base px-8 py-4 rounded-full border-2 border-vibe-navy inline-block">
              EXPLORE SPOTS
            </Link>
          </div>
        ) : (
          <>
            <p className="font-cursive text-vibe-yellow text-xl mb-6">your saved getaways</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedProperties.map(p => (
                <div key={p.id}
                  className="property-card bg-white rounded-xl2 border-2 border-vibe-navy shadow-card overflow-visible"
                  style={{ transform: `rotate(${p.rotate})` }}>

                  {/* Photo */}
                  <div className="relative h-48 overflow-hidden rounded-t-xl border-b-2 border-vibe-navy">
                    <Link to={`/property/${p.id}`}>
                      <img src={p.image} alt={p.name} className="card-img w-full h-full object-cover" />
                    </Link>
                    <span className={`absolute top-3 right-3 ${p.priceTag} font-display text-xs px-2.5 py-1 rounded-full border border-vibe-navy`}>
                      GHS {p.priceGHS.toLocaleString()}
                    </span>
                    <button onClick={() => toggle(p.id)}
                      className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white border-2 border-vibe-navy flex items-center justify-center text-vibe-red text-xs font-black hover:bg-red-50 transition-colors shadow-btn"
                      title="Remove">✕</button>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <Link to={`/property/${p.id}`}>
                      <h3 className="font-display text-base text-vibe-navy uppercase leading-tight mb-1">{p.name}</h3>
                      <p className="font-body text-xs text-vibe-blue font-bold uppercase tracking-wide mb-3">{p.district}, {p.region}</p>
                    </Link>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {p.tags.slice(0, 2).map(tag => (
                        <span key={tag} className={`${getTagClass(tag)} font-body text-xs font-bold px-2 py-0.5 rounded-full`}>{tag}</span>
                      ))}
                    </div>

                    {/* Reactions */}
                    <div className="border-t border-gray-100 pt-3">
                      <p className="font-body text-xs text-gray-400 font-bold mb-2">Your vote:</p>
                      <div className="flex gap-2">
                        {REACTIONS.map(emoji => (
                          <button key={emoji} onClick={() => react(p.id, emoji)}
                            className={`react-btn font-body text-lg px-2.5 py-1 rounded-full border-2 border-vibe-navy transition-all ${
                              hasReacted(p.id, emoji) ? 'bg-vibe-navy text-white' : 'bg-white text-vibe-navy hover:bg-vibe-yellow'
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
          </>
        )}
      </div>

      <footer className="bg-vibe-navy py-6 text-center mt-8">
        <p className="font-body font-bold text-white/60 text-sm">Getaway.gh — Discover Ghana © 2025</p>
      </footer>
    </div>
  )
}
