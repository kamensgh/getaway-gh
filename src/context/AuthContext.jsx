import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  async function signInWithGoogle() {
    setAuthError(null)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (err) {
      console.error('[Firebase Auth Error]', err?.code, err?.message)
      const code = err?.code ?? ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return // user dismissed, not an error
      }
      setAuthError(`${code || 'auth-error'}: ${err?.message ?? 'Sign-in failed'}`)
      throw err
    }
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  async function fetchUserData(uid) {
    const ref  = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    return snap.exists() ? snap.data() : null
  }

  async function saveUserData(uid, data) {
    const ref = doc(db, 'users', uid)
    await setDoc(ref, data, { merge: true })
  }

  return (
    <AuthContext.Provider value={{ user, loading, authError, signInWithGoogle, signOut, fetchUserData, saveUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
