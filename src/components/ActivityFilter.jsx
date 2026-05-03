import { ACTIVITIES } from '../data/properties'

export default function ActivityFilter({ selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {ACTIVITIES.map(a => {
        const active = selected.includes(a.id)
        return (
          <button
            key={a.id}
            onClick={() => onToggle(a.id)}
            className={`activity-pill font-body font-extrabold text-sm px-5 py-2.5 rounded-full border-2 border-vibe-navy transition-all ${
              active
                ? 'bg-vibe-navy text-white shadow-btn'
                : 'bg-white text-vibe-navy hover:bg-vibe-yellow'
            }`}
          >
            <span className="mr-1.5">{a.emoji}</span>
            {a.label}
          </button>
        )
      })}

      {selected.length > 0 && (
        <button
          onClick={() => selected.forEach(id => onToggle(id))}
          className="activity-pill font-body font-extrabold text-sm px-5 py-2.5 rounded-full border-2 border-vibe-navy bg-vibe-red text-white hover:bg-red-700 transition-all"
        >
          ✕ Clear all
        </button>
      )}
    </div>
  )
}
