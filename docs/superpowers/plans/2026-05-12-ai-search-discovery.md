# AI Search & Discovery Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a client-side AI search bar to the homepage hero and a new `/search` results page with sidebar filters, fake AI loader, and ranked property cards.

**Architecture:** A pure `searchEngine.js` utility scores all 679 properties against natural-language keyword signals (activity, group type, region, price). The homepage hero gains a search bar + quick-pick chips that navigate to `/search?q=…`. The search results page runs a 1.8s fake loader then shows a sidebar-filtered grid. No backend, no API calls.

**Tech Stack:** React 18, React Router v6, Vite, Tailwind CSS v3, existing `PropertyCard` component, existing `properties` dataset.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/utils/searchEngine.js` | Parse query → score + rank properties → build summary string |
| Create | `src/pages/SearchResults.jsx` | `/search` route: fake loader, AI banner, sidebar filters, results grid |
| Modify | `src/pages/VibeHome.jsx` | Add search bar + quick-pick chips to hero section |
| Modify | `src/App.jsx` | Register `/search` route |
| Modify | `src/components/Navbar.jsx` | Show compact search input when `pathname === '/search'` |

---

## Task 1: Search Engine Utility

**Files:**
- Create: `src/utils/searchEngine.js`

- [ ] **Step 1: Create the file**

```js
// src/utils/searchEngine.js

// ── Signal maps ──────────────────────────────────────────────────────────────

const ACTIVITY_SIGNALS = {
  beach:      { keywords: ['beach','coast','sea','ocean','ada','busua','kokrobite','saltpond','cape coast','swim'], activities: ['beach','watersports'], emoji: '🌊', label: 'beach' },
  nature:     { keywords: ['nature','forest','waterfall','wli','boti','kakum','green','rainforest'], activities: ['nature','eco','hiking'], emoji: '🌿', label: 'nature' },
  hiking:     { keywords: ['hiking','hike','trek','walk','mountain','hills','trail'], activities: ['hiking','mountain'], emoji: '🥾', label: 'hiking' },
  wildlife:   { keywords: ['safari','elephant','mole','wildlife','game drive','animals','baboon'], activities: ['eco'], regions: ['Savannah','Northern'], emoji: '🦁', label: 'safari' },
  lakeside:   { keywords: ['lake','volta','akosombo','bosomtwe','lakeside','dam'], activities: ['lakeside'], emoji: '🌅', label: 'lakeside' },
  cultural:   { keywords: ['culture','history','heritage','castle','ashanti','festival','traditional','museum','slave'], activities: ['cultural'], emoji: '🏛️', label: 'cultural' },
  nightlife:  { keywords: ['nightlife','party','club','bar','social','music','live'], activities: ['nightlife'], emoji: '🎉', label: 'nightlife' },
  eco:        { keywords: ['eco','sustainable','green','organic','camp','retreat','off grid'], types: ['Eco Retreat'], emoji: '🌱', label: 'eco' },
  food:       { keywords: ['food','restaurant','cuisine','eat','chop bar','local food'], activities: ['food'], emoji: '🍽️', label: 'food' },
}

const GROUP_SIGNALS = {
  couple:  { keywords: ['couple','couples','romantic','romance','anniversary','honeymoon','partner','date','two'], groups: ['couple'] },
  family:  { keywords: ['family','kids','children','child','parents','toddler','daughter','son'], groups: ['group4'] },
  solo:    { keywords: ['solo','alone','myself','single','just me','one person'], groups: ['solo'] },
  group:   { keywords: ['group','squad','friends','crew','gang','bachelor','bachelorette','team','company','lads','girls'], groups: ['large','group4'] },
}

const REGION_MAP = {
  'greater accra': 'Greater Accra', 'accra': 'Greater Accra',
  'ashanti': 'Ashanti', 'kumasi': 'Ashanti',
  'eastern': 'Eastern', 'koforidua': 'Eastern',
  'volta': 'Volta', 'ho': 'Volta', 'hohoe': 'Volta',
  'oti': 'Oti', 'dambai': 'Oti', 'nkwanta': 'Oti',
  'western': 'Western', 'busua': 'Western', 'takoradi': 'Western',
  'western north': 'Western North', 'wiawso': 'Western North',
  'central': 'Central', 'cape coast': 'Central', 'elmina': 'Central',
  'bono': 'Bono', 'sunyani': 'Bono', 'brong': 'Bono',
  'bono east': 'Bono East', 'techiman': 'Bono East', 'kintampo': 'Bono East',
  'ahafo': 'Ahafo', 'goaso': 'Ahafo',
  'northern': 'Northern', 'tamale': 'Northern',
  'savannah': 'Savannah', 'mole': 'Savannah', 'damongo': 'Savannah',
  'north east': 'North East', 'nalerigu': 'North East',
  'upper east': 'Upper East', 'bolgatanga': 'Upper East', 'navrongo': 'Upper East',
  'upper west': 'Upper West', 'wa': 'Upper West',
}

const CITY_KEYWORDS = [
  'ada foah','ada','busua','kokrobite','saltpond','anomabo','elmina','cape coast',
  'kumasi','tamale','ho','koforidua','bolgatanga','sunyani','techiman','kintampo',
  'damongo','larabanga','wli','hohoe','dambai','nkwanta','bosomtwe','akosombo',
  'atimpoku','boti','aburi','kokrobite','dixcove',
]

// ── Price extraction ─────────────────────────────────────────────────────────

function extractMaxPrice(q) {
  const m =
    q.match(/(?:under|below|less than|max|maximum|up to|budget of?|within)\s*(?:ghs\s*)?(\d[\d,]*)/i) ||
    q.match(/(\d[\d,]*)\s*(?:ghs|cedis?|cedi)\b/i) ||
    q.match(/(?:ghs|₵)\s*(\d[\d,]*)/i)
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : null
}

// ── Summary builder ──────────────────────────────────────────────────────────

function buildSummary(count, actSignal, groupSignal, maxPrice, results) {
  if (count === 0) return "No spots matched — try different keywords."

  const sigInfo = actSignal ? ACTIVITY_SIGNALS[actSignal] : null
  const label   = sigInfo ? sigInfo.label : 'spot'
  const emoji   = sigInfo ? sigInfo.emoji : '✨'
  const forStr  = groupSignal ? ` for ${groupSignal}s` : ''
  const priceStr = maxPrice ? ` under GHS ${maxPrice.toLocaleString()}` : ''

  const topCities = [...new Set(results.slice(0, 6).map(p => p.city).filter(Boolean))].slice(0, 3)
  const cityStr = topCities.length >= 2
    ? ` — ${topCities.slice(0, -1).join(', ')} & ${topCities[topCities.length - 1]} lead the pack`
    : topCities[0] ? ` — ${topCities[0]} tops the list` : ''

  return `Found ${count} ${label} spot${count !== 1 ? 's' : ''}${forStr}${priceStr}${cityStr}. ${emoji}`
}

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * @param {string} query  — raw search string from the user
 * @param {Array}  allProperties — full properties array
 * @returns {{ results: Array, summary: string, detectedSignals: string[], totalCount: number }}
 */
export function searchProperties(query, allProperties) {
  const q = (query || '').toLowerCase().trim()
  if (!q) return { results: [], summary: '', detectedSignals: [], totalCount: 0 }

  const detectedSignals = []
  const activityBoost   = {}  // activityId → points
  const typeBoost       = {}  // type string → points
  const groupBoost      = {}  // groupId → points
  let   regionFilter    = null
  let   cityFilter      = null

  const maxPrice = extractMaxPrice(q)

  // Detect activity signals
  let firstActSignal = null
  for (const [key, sig] of Object.entries(ACTIVITY_SIGNALS)) {
    if (sig.keywords.some(kw => q.includes(kw))) {
      if (!firstActSignal) firstActSignal = key
      detectedSignals.push(key)
      sig.activities?.forEach(a => { activityBoost[a] = (activityBoost[a] || 0) + 10 })
      sig.types?.forEach(t => { typeBoost[t] = (typeBoost[t] || 0) + 8 })
      sig.regions?.forEach(r => { if (!regionFilter) regionFilter = r })
    }
  }

  // Detect group signals
  let firstGroupSignal = null
  for (const [key, sig] of Object.entries(GROUP_SIGNALS)) {
    if (sig.keywords.some(kw => q.includes(kw))) {
      if (!firstGroupSignal) firstGroupSignal = key
      detectedSignals.push(key)
      sig.groups.forEach(g => { groupBoost[g] = (groupBoost[g] || 0) + 8 })
    }
  }

  // Detect region
  for (const [kw, region] of Object.entries(REGION_MAP)) {
    if (q.includes(kw)) { regionFilter = region; break }
  }

  // Detect city
  for (const city of CITY_KEYWORDS) {
    if (q.includes(city)) { cityFilter = city; break }
  }

  // Filter + score
  const results = allProperties
    .filter(p => {
      if (maxPrice && p.priceGHS && p.priceGHS > maxPrice) return false
      if (regionFilter && p.region !== regionFilter) return false
      if (cityFilter) {
        const haystack = `${p.city} ${p.district} ${p.name}`.toLowerCase()
        if (!haystack.includes(cityFilter)) return false
      }
      return true
    })
    .map(p => {
      let score = 0
      ;(p.activities || []).forEach(a => { score += activityBoost[a] || 0 })
      score += typeBoost[p.type] || 0
      ;(p.groups || []).forEach(g => { score += groupBoost[g] || 0 })
      score += ((p.vibeScore || 0) / 10) * 2  // tiebreaker
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
    .map(x => x.p)

  return {
    results,
    summary: buildSummary(results.length, firstActSignal, firstGroupSignal, maxPrice, results),
    detectedSignals: [...new Set(detectedSignals)],
    totalCount: results.length,
  }
}
```

- [ ] **Step 2: Smoke-test in browser console**

Run dev server:
```bash
cd /Users/mac/Documents/projects/getaway && source ~/.nvm/nvm.sh && nvm use 20 && npm run dev
```

Open browser console on `http://localhost:5173` and paste:
```js
// In browser console — import works because Vite exposes modules
import('/src/utils/searchEngine.js').then(m => {
  import('/src/data/properties.js').then(p => {
    const r = m.searchProperties('beach escape for couples under GHS 1000', p.properties)
    console.log('count:', r.totalCount, '| summary:', r.summary)
    console.log('top 3:', r.results.slice(0,3).map(x => x.name))
  })
})
```
Expected: count > 0, summary mentions "beach", top results are coastal properties.

- [ ] **Step 3: Commit**

```bash
git add src/utils/searchEngine.js
git commit -m "feat: add client-side search engine with keyword scoring"
```

---

## Task 2: Register `/search` Route

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add import and route**

In `src/App.jsx`, add the import after existing page imports and the route inside `<Routes>`:

```jsx
// Add after the Festivals import:
import SearchResults from './pages/SearchResults'

// Add inside <Routes>, after the festivals route:
<Route path="/search" element={<SearchResults />} />
```

Full updated `AppRoutes` function:
```jsx
function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/"              element={<VibeHome />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/board"         element={<TripBoard />} />
        <Route path="/explore"       element={<ExploreGhana />} />
        <Route path="/profile"       element={<UserProfile />} />
        <Route path="/list/:uid"     element={<SharedList />} />
        <Route path="/festivals"     element={<Festivals />} />
        <Route path="/search"        element={<SearchResults />} />
        <Route path="*"              element={<VibeHome />} />
      </Routes>
    </>
  )
}
```

- [ ] **Step 2: Create stub page so the route doesn't crash**

Create `src/pages/SearchResults.jsx` with a stub:
```jsx
export default function SearchResults() {
  return <div className="min-h-screen bg-white pt-28 px-4"><p>Search results — coming soon</p></div>
}
```

- [ ] **Step 3: Verify route works**

Navigate to `http://localhost:5173/search?q=beach` — should show "Search results — coming soon" without errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/pages/SearchResults.jsx
git commit -m "feat: register /search route with stub page"
```

---

## Task 3: Hero Search Bar in VibeHome

**Files:**
- Modify: `src/pages/VibeHome.jsx`

- [ ] **Step 1: Add `useNavigate` and search state**

At the top of `VibeHome.jsx`, add `useNavigate` to the React Router import and add two pieces of state after the existing `useState` calls:

```jsx
// Existing import — add useNavigate:
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'

// Inside VibeHome(), after existing state declarations:
const navigate = useNavigate()
const [searchQuery, setSearchQuery] = useState('')
```

- [ ] **Step 2: Add `handleSearch` function**

Add this function inside `VibeHome()`, before the `return`:

```jsx
const handleSearch = useCallback((q) => {
  const trimmed = (q || searchQuery).trim()
  if (!trimmed) return
  navigate(`/search?q=${encodeURIComponent(trimmed)}`)
}, [searchQuery, navigate])
```

- [ ] **Step 3: Define quick chips constant**

Add this constant at the top of the file, after the `TAGLINES` array:

```jsx
const QUICK_CHIPS = [
  { label: '🌊 Beach weekend',    query: 'beach weekend' },
  { label: '🦁 Safari & wildlife', query: 'safari wildlife mole' },
  { label: '💑 Romantic escape',  query: 'romantic couple escape' },
  { label: '🎉 Group trip',       query: 'group trip friends' },
  { label: '🌿 Eco retreat',      query: 'eco retreat nature' },
  { label: '❄️ Cool & refreshing', query: 'cool mountain waterfall refreshing' },
  { label: '🏛️ Cultural trip',    query: 'cultural history heritage' },
  { label: '💰 Budget under 500', query: 'budget under GHS 500' },
]
```

- [ ] **Step 4: Replace the hero section**

Find the hero `<section>` block (lines 100–116) and replace it entirely:

```jsx
{/* ── HERO ─────────────────────────────────────────── */}
<section className="relative pt-28 pb-10 px-4 overflow-hidden">
  <div className="absolute top-28 left-6 text-white text-4xl opacity-80 animate-float select-none pointer-events-none">✦</div>
  <div className="absolute top-44 right-10 text-white text-2xl opacity-50 animate-float select-none pointer-events-none" style={{ animationDelay: '1.2s' }}>✦</div>

  <div className="max-w-3xl mx-auto text-center relative z-10">
    <p key={taglineKey} className="font-cursive text-2xl sm:text-3xl text-vibe-yellow mb-3 animate-tagline">
      {TAGLINES[taglineIdx]}
    </p>
    <h1 className="font-display text-6xl sm:text-7xl md:text-8xl text-white uppercase leading-none tracking-tight mb-6">
      YOUR NEXT<br />GETAWAY
    </h1>
    <div className="inline-flex items-center bg-vibe-yellow text-vibe-navy font-body font-extrabold text-base px-6 py-3 rounded-full border-2 border-vibe-navy shadow-btn mb-8">
      Hotels • Eco Lodges • Beach Houses • Airbnb
    </div>

    {/* AI Search bar */}
    <div className="relative max-w-xl mx-auto mb-5">
      <div className="flex items-center bg-white rounded-full border-2 border-vibe-navy shadow-btn overflow-hidden pr-1.5 pl-5 py-1.5 focus-within:border-vibe-yellow transition-colors">
        <span className="text-xl mr-3 shrink-0">✨</span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder='Try "beach escape under GHS 1000"...'
          className="flex-1 font-body text-sm text-vibe-navy bg-transparent outline-none placeholder:text-gray-400 placeholder:italic"
        />
        <button
          onClick={() => handleSearch()}
          className="shrink-0 bg-vibe-red text-white font-display text-sm px-5 py-2.5 rounded-full border-2 border-vibe-navy hover:bg-vibe-navy transition-colors ml-2 whitespace-nowrap"
        >
          ASK AI →
        </button>
      </div>
    </div>

    {/* Quick-pick chips */}
    <div className="flex gap-2 flex-wrap justify-center pb-2">
      {QUICK_CHIPS.map(chip => (
        <button
          key={chip.label}
          onClick={() => handleSearch(chip.query)}
          className="font-body font-bold text-xs text-white bg-white/15 border border-white/40 px-4 py-2 rounded-full hover:bg-white hover:text-vibe-navy transition-colors"
        >
          {chip.label}
        </button>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 5: Verify hero renders correctly**

Check `http://localhost:5173`:
- Search bar visible in red hero
- Placeholder text shown
- Typing + Enter navigates to `/search?q=...`
- Clicking a chip navigates to `/search?q=...`
- Quick chips wrap neatly on mobile (resize to 375px)

- [ ] **Step 6: Commit**

```bash
git add src/pages/VibeHome.jsx
git commit -m "feat: add AI search bar and quick-pick chips to hero"
```

---

## Task 4: SearchResults — Fake Loader

**Files:**
- Modify: `src/pages/SearchResults.jsx`

- [ ] **Step 1: Replace the stub with the loader shell**

Replace the entire contents of `src/pages/SearchResults.jsx`:

```jsx
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { properties } from '../data/properties'
import { searchProperties } from '../utils/searchEngine'

const LOADER_STEPS = [
  'Reading your vibe...',
  'Scanning {n} spots across Ghana...',
  'Ranking by best match...',
]

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const query          = searchParams.get('q') || ''

  const [loading,    setLoading]    = useState(true)
  const [loaderStep, setLoaderStep] = useState(0)

  // Run search engine (pure, fast — runs before loader finishes)
  const { results: rawResults, summary, detectedSignals } = useMemo(
    () => searchProperties(query, properties),
    [query]
  )

  // Fake loader sequence: 400ms → step 1, 900ms → step 2, 1800ms → done
  useEffect(() => {
    if (!query) { setLoading(false); return }
    setLoading(true)
    setLoaderStep(0)
    const t1 = setTimeout(() => setLoaderStep(1), 400)
    const t2 = setTimeout(() => setLoaderStep(2), 900)
    const t3 = setTimeout(() => setLoading(false), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [query])

  if (loading) {
    return (
      <div className="min-h-screen bg-vibe-navy flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border-2 border-vibe-navy shadow-card p-8 max-w-sm w-full">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl animate-spin" style={{ animationDuration: '1.5s' }}>✦</span>
            <div>
              <p className="font-display text-lg text-vibe-navy uppercase leading-tight">Finding your perfect getaway...</p>
              <p className="font-body text-xs text-gray-400 mt-1">Searching {properties.length} spots across Ghana</p>
            </div>
          </div>
          <div className="space-y-3">
            {LOADER_STEPS.map((step, i) => {
              const label = step.replace('{n}', properties.length)
              const done  = i < loaderStep
              const active = i === loaderStep
              return (
                <div key={i} className="flex items-center gap-3 font-body text-sm font-semibold">
                  {done ? (
                    <span className="text-green-500 text-base shrink-0">✓</span>
                  ) : active ? (
                    <span className="w-4 h-4 border-2 border-vibe-red border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                  )}
                  <span className={done ? 'text-vibe-navy' : active ? 'text-vibe-navy' : 'text-gray-300'}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* AI Answer Banner */}
      <div className="bg-vibe-navy pt-20 pb-4 px-4 sticky top-0 z-40 border-b-2 border-vibe-navy">
        <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
          <span className="font-body font-extrabold text-vibe-yellow text-xs uppercase tracking-widest shrink-0">✨ Getaway AI</span>
          <span className="font-body text-white text-sm flex-1">{summary || `Showing all results for "${query}"`}</span>
          <button
            onClick={() => navigate('/')}
            className="font-body font-bold text-xs text-white/60 hover:text-white transition-colors shrink-0"
          >
            New search ✕
          </button>
        </div>
      </div>

      {/* Main content placeholder — replaced in Task 5 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="font-body text-gray-500">{rawResults.length} results — sidebar coming in Task 5</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify loader flow**

Navigate to `http://localhost:5173/search?q=beach`:
- Navy loading screen appears with spinning ✦
- Steps tick through at ~400ms intervals
- After 1.8s: navy banner with AI summary + "X results" placeholder text
- Navigating to `http://localhost:5173/search?q=safari` reruns the loader

- [ ] **Step 3: Commit**

```bash
git add src/pages/SearchResults.jsx
git commit -m "feat: search results page with fake AI loader and answer banner"
```

---

## Task 5: SearchResults — Sidebar Filters + Results Grid

**Files:**
- Modify: `src/pages/SearchResults.jsx`

- [ ] **Step 1: Replace `SearchResults.jsx` with the full implementation**

```jsx
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import { properties, REGIONS, TYPES, ACTIVITIES } from '../data/properties'
import { searchProperties } from '../utils/searchEngine'
import { DEPARTURE_CITIES } from '../utils/driveTime'

// ── Constants ─────────────────────────────────────────────────────────────────

const LOADER_STEPS = [
  'Reading your vibe...',
  `Scanning ${properties.length} spots across Ghana...`,
  'Ranking by best match...',
]

const SORT_OPTIONS = [
  { id: 'match',      label: 'Best match' },
  { id: 'price-asc',  label: 'Price: low → high' },
  { id: 'price-desc', label: 'Price: high → low' },
  { id: 'rating',     label: 'Highest rated' },
]

// ── Sidebar component ─────────────────────────────────────────────────────────

function SearchSidebar({ baseResults, filters, setFilters, onClose }) {
  const { regions, types, activities, priceRange, fromCity } = filters

  // Derive available regions from base results
  const availableRegions = useMemo(() => {
    const counts = {}
    baseResults.forEach(p => { if (p.region) counts[p.region] = (counts[p.region] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [baseResults])

  const maxPriceInResults = useMemo(() =>
    Math.max(...baseResults.map(p => p.priceGHS || 0).filter(Boolean), 3000)
  , [baseResults])

  function toggleSet(key, value) {
    setFilters(prev => {
      const current = prev[key]
      const next = current.includes(value)
        ? current.filter(x => x !== value)
        : [...current, value]
      return { ...prev, [key]: next }
    })
  }

  const activeCount =
    regions.length + types.length + activities.length +
    (priceRange[1] < maxPriceInResults ? 1 : 0)

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b-2 border-gray-100 shrink-0">
        <span className="font-display text-base text-vibe-navy uppercase">Filters {activeCount > 0 && `(${activeCount})`}</span>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={() => setFilters({ regions: [], types: [], activities: [], priceRange: [0, maxPriceInResults], fromCity: 'Accra' })}
              className="font-body text-xs text-vibe-red font-bold hover:underline"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="font-body text-lg text-gray-400 hover:text-vibe-navy leading-none">✕</button>
          )}
        </div>
      </div>

      {/* Scrollable filter body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

        {/* Region */}
        <details open>
          <summary className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider cursor-pointer mb-3 list-none flex justify-between">
            Region <span className="text-gray-400 font-normal">▾</span>
          </summary>
          <div className="space-y-2">
            {availableRegions.map(([region, count]) => (
              <label key={region} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={regions.includes(region)}
                  onChange={() => toggleSet('regions', region)}
                  className="w-4 h-4 rounded border-2 border-gray-300 accent-vibe-red"
                />
                <span className="font-body text-sm text-vibe-navy group-hover:font-bold transition-all flex-1">{region}</span>
                <span className="font-body text-xs text-gray-400">{count}</span>
              </label>
            ))}
          </div>
        </details>

        {/* Price range */}
        <details open>
          <summary className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider cursor-pointer mb-3 list-none flex justify-between">
            Price / night <span className="text-gray-400 font-normal">▾</span>
          </summary>
          <div>
            <div className="flex justify-between font-body text-xs text-gray-500 mb-2">
              <span>GHS 0</span>
              <span className="font-bold text-vibe-navy">up to GHS {priceRange[1].toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPriceInResults}
              step={100}
              value={priceRange[1]}
              onChange={e => setFilters(prev => ({ ...prev, priceRange: [0, +e.target.value] }))}
              className="w-full accent-vibe-red"
            />
          </div>
        </details>

        {/* Type */}
        <details open>
          <summary className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider cursor-pointer mb-3 list-none flex justify-between">
            Type <span className="text-gray-400 font-normal">▾</span>
          </summary>
          <div className="space-y-2">
            {TYPES.map(t => (
              <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={types.includes(t)}
                  onChange={() => toggleSet('types', t)}
                  className="w-4 h-4 rounded border-2 border-gray-300 accent-vibe-red"
                />
                <span className="font-body text-sm text-vibe-navy group-hover:font-bold transition-all">{t}</span>
              </label>
            ))}
          </div>
        </details>

        {/* Activities */}
        <details open>
          <summary className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider cursor-pointer mb-3 list-none flex justify-between">
            Activities <span className="text-gray-400 font-normal">▾</span>
          </summary>
          <div className="space-y-2">
            {ACTIVITIES.map(a => (
              <label key={a.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={activities.includes(a.id)}
                  onChange={() => toggleSet('activities', a.id)}
                  className="w-4 h-4 rounded border-2 border-gray-300 accent-vibe-red"
                />
                <span className="font-body text-sm text-vibe-navy group-hover:font-bold transition-all">{a.emoji} {a.label}</span>
              </label>
            ))}
          </div>
        </details>

        {/* Drive from */}
        <details open>
          <summary className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider cursor-pointer mb-3 list-none flex justify-between">
            🚗 Drive from <span className="text-gray-400 font-normal">▾</span>
          </summary>
          <div className="space-y-2">
            {DEPARTURE_CITIES.map(c => (
              <label key={c.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="fromCity"
                  checked={fromCity === c.id}
                  onChange={() => setFilters(prev => ({ ...prev, fromCity: c.id }))}
                  className="w-4 h-4 accent-vibe-red"
                />
                <span className="font-body text-sm text-vibe-navy group-hover:font-bold transition-all">{c.id}</span>
              </label>
            ))}
          </div>
        </details>

      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const query          = searchParams.get('q') || ''

  const [loading,     setLoading]     = useState(true)
  const [loaderStep,  setLoaderStep]  = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sortBy,      setSortBy]      = useState('match')
  const [filters, setFilters] = useState({
    regions:    [],
    types:      [],
    activities: [],
    priceRange: [0, 5000],
    fromCity:   'Accra',
  })

  // Search engine (runs immediately, before loader ends)
  const { results: baseResults, summary } = useMemo(
    () => searchProperties(query, properties),
    [query]
  )

  // Apply sidebar filters
  const filteredResults = useMemo(() => {
    let res = baseResults
    if (filters.regions.length)    res = res.filter(p => filters.regions.includes(p.region))
    if (filters.types.length)      res = res.filter(p => filters.types.includes(p.type))
    if (filters.activities.length) res = res.filter(p => filters.activities.some(a => p.activities?.includes(a)))
    res = res.filter(p => !p.priceGHS || p.priceGHS <= filters.priceRange[1])

    if (sortBy === 'price-asc')  return [...res].sort((a, b) => (a.priceGHS || 9999) - (b.priceGHS || 9999))
    if (sortBy === 'price-desc') return [...res].sort((a, b) => (b.priceGHS || 0) - (a.priceGHS || 0))
    if (sortBy === 'rating')     return [...res].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return res
  }, [baseResults, filters, sortBy])

  const activeFilterCount =
    filters.regions.length + filters.types.length + filters.activities.length +
    (filters.priceRange[1] < 5000 ? 1 : 0)

  // Fake loader
  useEffect(() => {
    if (!query) { setLoading(false); return }
    setLoading(true)
    setLoaderStep(0)
    const t1 = setTimeout(() => setLoaderStep(1), 400)
    const t2 = setTimeout(() => setLoaderStep(2), 900)
    const t3 = setTimeout(() => setLoading(false), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [query])

  // Close sidebar on desktop resize
  useEffect(() => {
    function handleResize() { if (window.innerWidth >= 1024) setSidebarOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ── Loader screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-vibe-navy flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border-2 border-vibe-navy shadow-card p-8 max-w-sm w-full">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl" style={{ display: 'inline-block', animation: 'spin 1.5s linear infinite' }}>✦</span>
            <div>
              <p className="font-display text-lg text-vibe-navy uppercase leading-tight">Finding your perfect getaway...</p>
              <p className="font-body text-xs text-gray-400 mt-1">Searching {properties.length} spots across Ghana</p>
            </div>
          </div>
          <div className="space-y-3">
            {LOADER_STEPS.map((step, i) => {
              const done   = i < loaderStep
              const active = i === loaderStep
              return (
                <div key={i} className="flex items-center gap-3 font-body text-sm font-semibold">
                  {done ? (
                    <span className="text-green-500 text-base shrink-0">✓</span>
                  ) : active ? (
                    <span className="w-4 h-4 border-2 border-vibe-red border-t-transparent rounded-full shrink-0" style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                  )}
                  <span className={done || active ? 'text-vibe-navy' : 'text-gray-300'}>{step}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Results screen ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* AI Answer Banner — sticky */}
      <div className="bg-vibe-navy pt-20 pb-3 px-4 sticky top-0 z-40 border-b-2 border-vibe-navy/50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
          <span className="font-body font-extrabold text-vibe-yellow text-xs uppercase tracking-widest shrink-0">✨ Getaway AI</span>
          <span className="font-body text-white text-sm flex-1 min-w-0 truncate">
            {summary || `Showing results for "${query}"`}
          </span>
          <button
            onClick={() => navigate('/')}
            className="font-body font-bold text-xs text-white/50 hover:text-white transition-colors shrink-0"
          >
            New search ✕
          </button>
        </div>
      </div>

      {/* Body: sidebar + results */}
      <div className="max-w-6xl mx-auto flex min-h-[calc(100vh-120px)]">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-60 min-w-[240px] border-r-2 border-gray-200 bg-white shrink-0 sticky top-[88px] h-[calc(100vh-88px)] overflow-hidden">
          <SearchSidebar
            baseResults={baseResults}
            filters={filters}
            setFilters={setFilters}
            onClose={null}
          />
        </aside>

        {/* ── Mobile sidebar drawer ── */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 w-72 z-50 shadow-2xl lg:hidden flex flex-col">
              <SearchSidebar
                baseResults={baseResults}
                filters={filters}
                setFilters={setFilters}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* ── Results column ── */}
        <div className="flex-1 px-4 py-6 min-w-0">

          {/* Toolbar: filter button (mobile) + count + sort */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 font-body font-extrabold text-sm text-vibe-navy bg-white border-2 border-vibe-navy px-4 py-2 rounded-full shadow-btn hover:bg-vibe-yellow transition-colors"
            >
              ⚙️ Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            <p className="font-body text-sm text-gray-500 font-semibold">
              <span className="text-vibe-navy font-extrabold">{filteredResults.length}</span> spot{filteredResults.length !== 1 ? 's' : ''}
              {baseResults.length !== filteredResults.length && ` of ${baseResults.length}`}
            </p>

            <div className="ml-auto flex items-center gap-2">
              <label className="font-body text-xs text-gray-500 font-semibold hidden sm:block">Sort:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="font-body text-sm border-2 border-vibe-navy rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-vibe-yellow bg-white"
              >
                {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Empty state */}
          {filteredResults.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-4xl text-vibe-navy uppercase mb-4">No spots found 😅</p>
              <p className="font-body text-gray-500 mb-6">Try removing a filter or start a new search.</p>
              <button
                onClick={() => setFilters({ regions: [], types: [], activities: [], priceRange: [0, 5000], fromCity: 'Accra' })}
                className="font-body font-extrabold text-sm bg-vibe-navy text-white px-6 py-3 rounded-full border-2 border-vibe-navy hover:bg-vibe-red transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredResults.map((p, idx) => (
                <div key={p.id} className="relative">
                  {/* Top-3 AI pick badge */}
                  {idx < 3 && (
                    <div className="absolute top-3 left-12 z-20 bg-vibe-yellow text-vibe-navy font-display text-xs px-2.5 py-0.5 rounded-full border border-vibe-navy shadow-sm">
                      {idx === 0 ? '🏅 #1 AI Pick' : idx === 1 ? '🥈 #2' : '🥉 #3'}
                    </div>
                  )}
                  <PropertyCard property={p} fromCity={filters.fromCity} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify full results page**

Navigate to `http://localhost:5173/search?q=beach+escape+for+couples`:
- Loader runs 1.8s ✓
- Navy banner shows AI summary ✓
- Desktop: sidebar visible on left with checkboxes ✓
- Desktop: results grid (3 columns) with #1 AI Pick badge on first card ✓
- Mobile (375px): sidebar hidden, "⚙️ Filters" button visible ✓
- Mobile: tap Filters → sidebar slides in from left over backdrop ✓
- Mobile: tap backdrop → sidebar closes ✓
- Checking a region → results update immediately ✓
- Price slider → results update immediately ✓
- Sort dropdown → order changes ✓
- "New search ✕" → navigates to `/` ✓

- [ ] **Step 3: Commit**

```bash
git add src/pages/SearchResults.jsx
git commit -m "feat: search results page with sidebar filters, mobile drawer, and ranked grid"
```

---

## Task 6: Navbar Compact Search on `/search`

**Files:**
- Modify: `src/components/Navbar.jsx`

- [ ] **Step 1: Add search input that shows only on `/search`**

In `src/components/Navbar.jsx`, add `useSearchParams` to the React Router import and add the compact search bar inside the `<nav>` element:

```jsx
// Updated import:
import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTripBoard } from '../context/TripBoardContext'
import { useAuth } from '../context/AuthContext'
```

Inside the `Navbar` function, add this after the existing state declarations:

```jsx
const [searchParams] = useSearchParams()
const isSearchPage   = location.pathname === '/search'
const [navQuery, setNavQuery] = useState(searchParams.get('q') || '')

function handleNavSearch(e) {
  e.preventDefault()
  const q = navQuery.trim()
  if (!q) return
  navigate(`/search?q=${encodeURIComponent(q)}`)
}
```

Inside the `<nav>` element, add the compact search bar between the logo and the desktop links `<div>`. Insert it right after the `<Link to="/">` logo:

```jsx
{/* Compact search — only on /search page */}
{isSearchPage && (
  <form onSubmit={handleNavSearch} className="hidden sm:flex flex-1 max-w-xs mx-4">
    <div className="flex items-center w-full bg-white rounded-full border-2 border-vibe-navy px-3 py-1 gap-2">
      <span className="text-sm">✨</span>
      <input
        type="text"
        value={navQuery}
        onChange={e => setNavQuery(e.target.value)}
        placeholder="Search again..."
        className="flex-1 font-body text-xs text-vibe-navy bg-transparent outline-none placeholder:text-gray-400"
      />
      <button type="submit" className="font-display text-xs text-vibe-red font-black hover:text-vibe-navy transition-colors">GO</button>
    </div>
  </form>
)}
```

- [ ] **Step 2: Keep `navQuery` in sync when query param changes**

Add a `useEffect` inside `Navbar` to sync the input when the URL changes:

```jsx
useEffect(() => {
  setNavQuery(searchParams.get('q') || '')
}, [searchParams])
```

- [ ] **Step 3: Verify navbar behaviour**

- On `/` (homepage): compact search bar is NOT visible ✓
- On `/search?q=beach`: compact search bar is visible, pre-filled with "beach" ✓
- Editing the navbar input and pressing Enter → navigates to new `/search?q=...` → loader reruns ✓
- On mobile: compact search bar hidden (shows on sm+) ✓

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.jsx
git commit -m "feat: show compact search bar in navbar on /search route"
```

---

## Task 7: Build & Deploy

- [ ] **Step 1: Final check — run build**

```bash
cd /Users/mac/Documents/projects/getaway && source ~/.nvm/nvm.sh && nvm use 20 && npm run build 2>&1
```
Expected: `✓ built in Xs` with no errors (chunk size warning is acceptable).

- [ ] **Step 2: Quick smoke-test on built output**

```bash
npx vite preview --port 4173
```
Open `http://localhost:4173` and verify:
- Homepage hero has search bar + chips
- Typing a query + Enter → loader → results page
- Sidebar filters + mobile drawer work
- Navbar search bar visible on `/search`

- [ ] **Step 3: Deploy to Vercel**

```bash
/Users/mac/.nvm/versions/node/v20.19.0/bin/npx vercel --prod --yes 2>&1
```

- [ ] **Step 4: Final commit**

```bash
git add docs/
git commit -m "docs: add AI search design spec and implementation plan"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| AI search bar in red hero | Task 3 |
| Quick-pick chips (8 chips) | Task 3 |
| Fake loader ~1.8s with steps | Tasks 4 & 5 |
| `/search` route | Task 2 |
| AI answer banner (navy, sticky) | Tasks 4 & 5 |
| Sidebar: region checkboxes with counts | Task 5 |
| Sidebar: price range slider | Task 5 |
| Sidebar: type checkboxes | Task 5 |
| Sidebar: activity checkboxes | Task 5 |
| Sidebar: drive-from radio buttons | Task 5 |
| Mobile: sidebar slides in via button | Task 5 |
| Active filter count on mobile button | Task 5 |
| Sort dropdown | Task 5 |
| Top-3 AI pick badges | Task 5 |
| Empty state | Task 5 |
| Navbar compact search on `/search` | Task 6 |
| Build + deploy | Task 7 |

**No placeholders found.** All code is complete.

**Type consistency:** `searchProperties()` returns `{ results, summary, detectedSignals, totalCount }`. SearchResults uses `results` as `baseResults` and `summary` — consistent. `PropertyCard` receives `property={p}` and `fromCity={filters.fromCity}` — matches existing component props.
