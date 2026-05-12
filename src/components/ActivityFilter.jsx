import { useRef, useEffect } from 'react'
import { ACTIVITIES } from '../data/properties'

function Pill({ a, active, onToggle, btnRef }) {
  return (
    <button
      ref={btnRef}
      onClick={() => onToggle(a.id)}
      className={`activity-pill font-body font-extrabold text-sm px-5 py-2.5 rounded-full border-2 border-vibe-navy whitespace-nowrap transition-all ${
        active
          ? 'bg-vibe-navy text-white shadow-btn'
          : 'bg-white text-vibe-navy hover:bg-vibe-yellow'
      }`}
    >
      <span className="mr-1.5">{a.emoji}</span>
      {a.label}
    </button>
  )
}

export default function ActivityFilter({ selected, onToggle, onClearAll }) {
  const mobileRefs = useRef({})

  // Scroll newly-selected chip into view on mobile
  useEffect(() => {
    if (selected.length === 0 || window.innerWidth >= 1024) return
    const last = selected[selected.length - 1]
    const el = mobileRefs.current[last]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selected])


  return (
    <>
      {/* ── Mobile: 3-row horizontal-scroll grid ── */}
      <div
        className="lg:hidden relative"
      >
        {/* Right-edge fade to hint at more content */}
        <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-vibe-navy to-transparent pointer-events-none z-10" />
        <div
          className="overflow-x-auto pb-2"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
        <style>{`.activity-scroll::-webkit-scrollbar{display:none}`}</style>
        <div
          className="activity-scroll grid gap-3 pr-12"
          style={{ gridTemplateRows: 'repeat(3, auto)', gridAutoFlow: 'column', width: 'max-content' }}
        >
          {ACTIVITIES.map(a => (
            <Pill
              key={a.id}
              a={a}
              active={selected.includes(a.id)}
              onToggle={onToggle}
              btnRef={el => { mobileRefs.current[a.id] = el }}
            />
          ))}
        </div>
        </div>
      </div>

      {/* ── Desktop: wrapping flex (unchanged) ── */}
      <div className="hidden lg:flex flex-wrap gap-3 justify-center">
        {ACTIVITIES.map(a => (
          <Pill
            key={a.id}
            a={a}
            active={selected.includes(a.id)}
            onToggle={onToggle}
            btnRef={null}
          />
        ))}
      </div>

      {/* Clear all — below the grid, only when something is selected */}
      {selected.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onClearAll}
            className="activity-pill font-body font-extrabold text-sm px-5 py-2.5 rounded-full border-2 border-vibe-navy bg-vibe-red text-white hover:bg-red-700 transition-all"
          >
            ✕ Clear all
          </button>
        </div>
      )}
    </>
  )
}
