import { useNavigate } from 'react-router-dom'

function KentePattern() {
  return (
    <svg viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg" style={{height:'80px'}} className="w-full">
      <defs>
        <pattern id="kp" x="0" y="0" width="40" height="80" patternUnits="userSpaceOnUse">
          <rect width="40" height="80" fill="#0E0A07"/>
          <rect x="0"  y="0"  width="8"  height="80" fill="#C8922A" opacity="0.8"/>
          <rect x="8"  y="0"  width="8"  height="80" fill="#1A3A2E" opacity="0.9"/>
          <rect x="16" y="0"  width="8"  height="80" fill="#E8741A" opacity="0.8"/>
          <rect x="24" y="0"  width="8"  height="80" fill="#6B1E3C" opacity="0.9"/>
          <rect x="32" y="0"  width="8"  height="80" fill="#C8922A" opacity="0.6"/>
          <rect x="0"  y="32" width="40" height="8"  fill="#0E0A07" opacity="0.4"/>
          <rect x="0"  y="40" width="40" height="8"  fill="#C8922A" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="80" fill="url(#kp)"/>
    </svg>
  )
}

function DwennimmenAdinkra() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="100" r="85" stroke="#C8922A" strokeWidth="1.5" opacity="0.15"/>
      <circle cx="100" cy="55"  r="30" stroke="#C8922A" strokeWidth="1.5" opacity="0.35"/>
      <circle cx="100" cy="145" r="30" stroke="#C8922A" strokeWidth="1.5" opacity="0.35"/>
      <circle cx="55"  cy="100" r="30" stroke="#C8922A" strokeWidth="1.5" opacity="0.35"/>
      <circle cx="145" cy="100" r="30" stroke="#C8922A" strokeWidth="1.5" opacity="0.35"/>
      <circle cx="100" cy="55"  r="12" fill="#C8922A" opacity="0.15"/>
      <circle cx="100" cy="145" r="12" fill="#C8922A" opacity="0.15"/>
      <circle cx="55"  cy="100" r="12" fill="#C8922A" opacity="0.15"/>
      <circle cx="145" cy="100" r="12" fill="#C8922A" opacity="0.15"/>
      <circle cx="100" cy="100" r="15" fill="#C8922A" opacity="0.2"/>
      <circle cx="100" cy="100" r="6"  fill="#C8922A" opacity="0.4"/>
    </svg>
  )
}

const FEATURES = [
  { icon: '★', label: 'Personal ratings & reviews' },
  { icon: '↓', label: 'Offline viewing for restored prints' },
  { icon: '◎', label: 'Curated collections by era and director' },
  { icon: '♦', label: 'Continue watching across devices' },
]

export default function WatchlistPage() {
  const navigate = useNavigate()

  return (
    <div className="page-enter min-h-screen bg-[#0E0A07] pt-16">
      <KentePattern />

      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-32 h-32 mx-auto mb-8 opacity-60">
          <DwennimmenAdinkra />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#C8922A]/40 bg-[#C8922A]/10 px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8922A] animate-pulse"/>
          <span className="font-ui text-xs uppercase tracking-widest text-[#C8922A]">Coming Soon</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-black text-[#F5E6C8] mb-4 leading-tight">
          Your Watchlist
        </h1>
        <p className="font-body text-[#6B5A47] mb-10 leading-relaxed">
          Save films to watch later, track what you've seen, and build your own Ghanaian cinema archive.
          We're building this feature — come back soon.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12 text-left">
          {FEATURES.map(f => (
            <div key={f.label} className="flex items-center gap-3 rounded-xl border border-[#1F160D] bg-[#161009] px-4 py-3">
              <span className="font-display text-[#C8922A] text-lg w-5 text-center shrink-0">{f.icon}</span>
              <span className="font-body text-sm text-[#C4B49A]">{f.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="rounded-full bg-[#C8922A] px-8 py-3 font-ui text-sm font-bold text-[#0E0A07] hover:bg-[#E0A83A] transition-colors"
        >
          ← Back to Films
        </button>
      </div>
    </div>
  )
}
