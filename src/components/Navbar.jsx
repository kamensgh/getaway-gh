import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTripBoard } from '../context/TripBoardContext'
import { useAuth } from '../context/AuthContext'

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function Navbar() {
  const { saved } = useTripBoard()
  const { user, authError, signInWithGoogle } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/',        label: 'Explore' },
    { to: '/board',   label: 'My Trips' },
    { to: '/explore', label: 'Regions' },
  ]

  function handleSignIn() {
    signInWithGoogle() // triggers redirect — page navigates away
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <nav className="navbar-pill rounded-full px-5 py-3 flex items-center gap-4 w-full max-w-2xl">
        <Link to="/" className="font-display text-xl text-vibe-navy tracking-tight shrink-0">
          Getaway<span className="text-vibe-blue">.</span><span className="text-vibe-red">gh</span>
        </Link>

        <div className="hidden sm:flex items-center gap-5 flex-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`font-body text-sm font-bold transition-colors ${location.pathname === l.to ? 'text-vibe-navy' : 'text-gray-500 hover:text-vibe-navy'}`}>
              {l.label}
              {l.to === '/board' && saved.length > 0 && (
                <span className="ml-1 bg-vibe-red text-white text-xs rounded-full px-1.5 py-0.5 font-black">{saved.length}</span>
              )}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {user ? (
            <button onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full border-2 border-vibe-navy overflow-hidden shadow-btn hover:scale-105 transition-transform"
              title={user.displayName || 'My Profile'}>
              {user.photoURL
                ? <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : <span className="w-full h-full bg-vibe-yellow flex items-center justify-center font-display text-vibe-navy text-sm">
                    {user.displayName?.[0] ?? '?'}
                  </span>
              }
            </button>
          ) : (
            <button onClick={handleSignIn}
              className="hidden sm:flex items-center gap-1.5 font-body font-bold text-sm text-vibe-navy bg-white border-2 border-vibe-navy px-3 py-1.5 rounded-full hover:bg-vibe-yellow transition-colors shadow-btn">
              <GoogleIcon />
              Sign in
            </button>
          )}

        </div>

        <button className="sm:hidden ml-2 flex flex-col gap-1.5 p-1" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span className={`block w-5 h-0.5 bg-vibe-navy transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}/>
          <span className={`block w-5 h-0.5 bg-vibe-navy transition-opacity ${menuOpen ? 'opacity-0' : ''}`}/>
          <span className={`block w-5 h-0.5 bg-vibe-navy transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}/>
        </button>
      </nav>

      {authError && (
        <div className="absolute top-20 left-4 right-4 bg-vibe-red text-white font-body text-sm font-bold px-4 py-3 rounded-xl border-2 border-white shadow-card text-center">
          {authError}
        </div>
      )}

      {menuOpen && (
        <div className="absolute top-20 left-4 right-4 bg-white border-2 border-vibe-navy rounded-2xl shadow-card overflow-hidden">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-5 py-4 font-body font-bold text-vibe-navy border-b border-gray-100 hover:bg-yellow-50 transition-colors">
              {l.label}
              {l.to === '/board' && saved.length > 0 && (
                <span className="bg-vibe-red text-white text-xs rounded-full px-2 py-0.5 font-black">{saved.length}</span>
              )}
            </Link>
          ))}
          {user ? (
            <Link to="/profile" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-5 py-4 font-body font-bold text-vibe-navy border-t border-gray-100 hover:bg-yellow-50 transition-colors">
              {user.photoURL
                ? <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full border border-vibe-navy" referrerPolicy="no-referrer" />
                : <span className="w-6 h-6 rounded-full bg-vibe-yellow border border-vibe-navy flex items-center justify-center text-xs font-black">{user.displayName?.[0]}</span>
              }
              My Profile
            </Link>
          ) : (
            <button onClick={() => { setMenuOpen(false); handleSignIn() }}
              className="w-full flex items-center gap-2 px-5 py-4 font-body font-bold text-vibe-navy hover:bg-yellow-50 transition-colors">
              <GoogleIcon />
              Sign in with Google
            </button>
          )}
        </div>
      )}
    </header>
  )
}
