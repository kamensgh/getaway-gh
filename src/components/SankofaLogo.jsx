export default function SankofaLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sankofa bird — stylised Adinkra symbol */}
      <circle cx="24" cy="24" r="22" stroke="#C8922A" strokeWidth="1.5" opacity="0.4"/>
      {/* Body */}
      <ellipse cx="24" cy="26" rx="9" ry="7" fill="#C8922A" opacity="0.9"/>
      {/* Head (turned back — the sankofa gesture) */}
      <circle cx="32" cy="18" r="5" fill="#C8922A"/>
      {/* Beak pointing backward */}
      <path d="M36 15 L42 12 L38 17Z" fill="#E8741A"/>
      {/* Eye */}
      <circle cx="33.5" cy="17" r="1.2" fill="#0E0A07"/>
      {/* Tail */}
      <path d="M15 27 Q10 20 8 14 Q12 18 16 22" stroke="#C8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Legs */}
      <path d="M20 33 L18 40 M28 33 L26 40" stroke="#C8922A" strokeWidth="2" strokeLinecap="round"/>
      {/* Egg (the thing it carries in its mouth) */}
      <ellipse cx="37" cy="13" rx="3" ry="2.2" fill="#E8741A" opacity="0.8"/>
    </svg>
  )
}
