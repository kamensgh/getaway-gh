# Removed Features — Getaway.gh

Features removed on 2026-05-04. All logic is preserved here for easy re-addition.

---

## 1. Vibe Score badge
**Removed from:** `PropertyCard.jsx` and `PropertyDetail.jsx`

### Card (was in the card body header row):
```jsx
<span className="font-display text-sm bg-vibe-navy text-white px-2 py-0.5 rounded-full shrink-0">🔥 {p.vibeScore}</span>
```

### Detail page (was in the location/verified row):
```jsx
<span className="font-display text-sm bg-vibe-navy text-white px-3 py-1 rounded-full">🔥 {p.vibeScore} vibe score</span>
```

Data field: `vibeScore` (number, e.g. `9.6`) — still present in `properties.js`.

---

## 2. Bookings this month
**Removed from:** `PropertyCard.jsx` and `PropertyDetail.jsx`

### Card (was at the bottom of card body):
```jsx
{p.bookingsThisMonth > 0 && (
  <span className="font-body text-xs text-vibe-red font-bold">🔥 {p.bookingsThisMonth} booked this month</span>
)}
```

### Detail page (was in the price panel):
```jsx
{p.bookingsThisMonth > 8 && (
  <p className="font-body text-xs text-vibe-red font-bold mt-1">🔥 {p.bookingsThisMonth} people booked this month</p>
)}
```

Data field: `bookingsThisMonth` (number) — still present in `properties.js`.

---

## 3. Flash Deal tag / ribbon
**Removed from:** `PropertyCard.jsx` and `PropertyDetail.jsx`

### Card (was absolute ribbon above image):
```jsx
{p.isFlashDeal && (
  <div className="absolute -top-3 left-4 z-10 bg-vibe-red text-white font-display text-xs px-3 py-1 rounded-full border-2 border-vibe-navy">
    ⚡ FLASH DEAL
  </div>
)}
```

### Detail page (was overlaid on photo gallery):
```jsx
{p.isFlashDeal && (
  <div className="absolute top-3 left-3 bg-vibe-red text-white font-display text-sm px-3 py-1 rounded-full border-2 border-vibe-navy">⚡ FLASH DEAL</div>
)}
```

Data field: `isFlashDeal` (boolean) — still in `properties.js`.

---

## 4. Stay / Duration filter
**Removed from:** `VibeHome.jsx`

### State:
```js
const [duration, setDuration] = useState('')
```

### Filter logic (inside `useMemo`):
```js
if (duration === '1' && p.minStay > 1) return false
if (duration === '2' && (p.minStay > 2 || p.minStay < 2)) return false
if (duration === '3' && p.minStay < 3) return false
```
Add `duration` to the `useMemo` dependency array.

### Import: add `DURATIONS` back to the properties import.

### JSX (duration pills — was above the "More filters" panel):
```jsx
{/* Duration pills */}
<div className="flex flex-wrap gap-2 mb-4">
  <span className="font-body font-extrabold text-white/70 text-xs self-center mr-1 uppercase tracking-wide">Stay:</span>
  {DURATIONS.map(d => (
    <button key={d.id} onClick={() => setDuration(d.id === duration ? '' : d.id)}
      className={`font-body font-extrabold text-xs px-4 py-1.5 rounded-full border-2 border-vibe-navy transition-all ${duration === d.id ? 'bg-vibe-navy text-white' : 'bg-white text-vibe-navy hover:bg-vibe-yellow'}`}>
      {d.label}
    </button>
  ))}
</div>
```

Also add `setDuration('')` back to the reset button's onClick.

---

## 5. Group Size filter
**Removed from:** `VibeHome.jsx` (filter panel)

### State:
```js
const [groupSize, setGroupSize] = useState('')
```

### Filter logic (inside `useMemo`):
```js
if (groupSize && !p.groups.includes(groupSize)) return false
```
Add `groupSize` to the `useMemo` dependency array.

### Import: add `GROUP_SIZES` back to the properties import.

### JSX (was the second column in the More Filters grid — change grid to `lg:grid-cols-4`):
```jsx
<div>
  <label className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider block mb-2">Group Size</label>
  <select value={groupSize} onChange={e => setGroupSize(e.target.value)}
    className="w-full border-2 border-vibe-navy rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-vibe-blue">
    <option value="">Any size</option>
    {GROUP_SIZES.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
  </select>
</div>
```

Also add `setGroupSize('')` back to the reset button's onClick.

---

## 6. What's Included / Not Included
**Removed from:** `PropertyDetail.jsx`

```jsx
{p.included && (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
    <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4">
      <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">✅ What's included</p>
      <ul className="space-y-1.5">
        {p.included.map((item, i) => (
          <li key={i} className="font-body text-sm text-vibe-navy flex items-start gap-2">
            <span className="text-green-600 mt-0.5 shrink-0">✓</span> {item}
          </li>
        ))}
      </ul>
    </div>
    <div className="bg-white rounded-xl border-2 border-vibe-navy shadow-card p-4">
      <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-3">❌ Not included</p>
      <ul className="space-y-1.5">
        {p.notIncluded.map((item, i) => (
          <li key={i} className="font-body text-sm text-gray-500 flex items-start gap-2">
            <span className="text-vibe-red mt-0.5 shrink-0">✕</span> {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
)}
```

Data fields: `included` and `notIncluded` (string arrays) — still in `properties.js`.

---

## 7. Accessibility
**Removed from:** `PropertyDetail.jsx`

```jsx
{p.accessibility && (
  <div className="bg-vibe-yellow rounded-xl border-2 border-vibe-navy shadow-card p-4 mb-6">
    <p className="font-display text-xs text-vibe-navy uppercase tracking-wider mb-1">♿ Accessibility</p>
    <p className="font-body text-sm text-vibe-navy font-bold">{p.accessibility}</p>
  </div>
)}
```

Data field: `accessibility` (string) — still in `properties.js`.

---

## 8. The Best Bits (card)
**Removed from:** `PropertyCard.jsx`

```jsx
{p.bestBits && (
  <div className="flex flex-col gap-0.5 mb-3 py-2 px-2 bg-gray-50 rounded-lg border border-gray-100">
    {p.bestBits.map((bit, i) => (
      <span key={i} className="font-body text-xs text-vibe-navy flex items-center gap-1.5">
        <span>{bit.icon}</span> {bit.text}
      </span>
    ))}
  </div>
)}
```

Note: original properties use `{ icon, text }` objects; Airbnb properties (ids 21–36) use plain strings. Reconcile before re-adding.
