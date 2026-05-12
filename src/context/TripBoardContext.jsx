import { createContext, useContext, useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './AuthContext'

const TripBoardContext = createContext()

function loadLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) }
  catch { return fallback }
}

export function TripBoardProvider({ children }) {
  const { user, signInWithGoogle } = useAuth()

  const [saved,     setSaved]     = useState(() => loadLocal('getaway-saved', []))
  const [reactions, setReactions] = useState(() => loadLocal('getaway-reactions', {}))
  const [loginPrompt, setLoginPrompt] = useState(false)

  // Persist to localStorage on every change
  useEffect(() => { localStorage.setItem('getaway-saved',     JSON.stringify(saved))     }, [saved])
  useEffect(() => { localStorage.setItem('getaway-reactions', JSON.stringify(reactions)) }, [reactions])

  // When user signs in: fetch Firestore data and merge with localStorage
  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    getDoc(ref).then(snap => {
      if (!snap.exists()) return
      const data = snap.data()
      if (data.saved)     setSaved(prev     => [...new Set([...prev, ...(data.saved || [])])])
      if (data.reactions) setReactions(prev => ({ ...data.reactions, ...prev }))
    }).catch(() => {})
  }, [user])

  // Sync to Firestore whenever saved/reactions change and user is logged in
  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    setDoc(ref, { saved, reactions }, { merge: true }).catch(() => {})
  }, [user, saved, reactions])

  const toggle = (id) => {
    if (!user) { setLoginPrompt(true); return }
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const isSaved = (id) => saved.includes(id)

  const react = (propertyId, emoji) => {
    if (!user) { setLoginPrompt(true); return }
    setReactions(prev => {
      const key = `${propertyId}-${emoji}`
      const isActive = !!prev[key]
      const cleared = Object.fromEntries(
        Object.entries(prev).filter(([k]) => !k.startsWith(`${propertyId}-`))
      )
      return isActive ? cleared : { ...cleared, [key]: true }
    })
  }

  const hasReacted = (propertyId, emoji) => !!reactions[`${propertyId}-${emoji}`]

  return (
    <TripBoardContext.Provider value={{ saved, toggle, isSaved, react, hasReacted }}>
      {children}

      {/* Login nudge modal */}
      {loginPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setLoginPrompt(false)}
        >
          <div
            className="bg-white rounded-2xl border-2 border-vibe-navy shadow-card p-8 max-w-sm w-full text-center"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-4xl mb-3">🔐</p>
            <h2 className="font-display text-2xl text-vibe-navy uppercase mb-2">Sign in to save</h2>
            <p className="font-body text-sm text-gray-500 mb-6">
              Create a free account to save your favourite spots and access them anywhere.
            </p>
            <button
              onClick={() => { signInWithGoogle(); setLoginPrompt(false) }}
              className="w-full flex items-center justify-center gap-3 bg-vibe-navy text-white font-display text-sm py-3 px-6 rounded-full border-2 border-vibe-navy hover:bg-vibe-yellow hover:text-vibe-navy transition-colors mb-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => setLoginPrompt(false)}
              className="font-body text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </TripBoardContext.Provider>
  )
}

export const useTripBoard = () => useContext(TripBoardContext)
