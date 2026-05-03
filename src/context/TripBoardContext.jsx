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
  const { user } = useAuth()

  const [saved,     setSaved]     = useState(() => loadLocal('getaway-saved', []))
  const [reactions, setReactions] = useState(() => loadLocal('getaway-reactions', {}))

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

  const toggle = (id) =>
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const isSaved = (id) => saved.includes(id)

  const react = (propertyId, emoji) => {
    setReactions(prev => {
      const key = `${propertyId}-${emoji}`
      return { ...prev, [key]: !prev[key] }
    })
  }

  const hasReacted = (propertyId, emoji) => !!reactions[`${propertyId}-${emoji}`]

  return (
    <TripBoardContext.Provider value={{ saved, toggle, isSaved, react, hasReacted }}>
      {children}
    </TripBoardContext.Provider>
  )
}

export const useTripBoard = () => useContext(TripBoardContext)
