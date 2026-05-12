# AI Search & Discovery Platform — Design Spec
**Date:** 2026-05-12  
**Project:** Getaway.gh  
**Scope:** Phase 1 Discovery — AI search bar on homepage + dedicated search results page

---

## Summary

Add a prominent AI-powered search bar to the existing homepage hero and a new dedicated `/search` results page. The "AI" is entirely client-side: a scoring engine that parses natural language queries, matches against the existing 679-property dataset, and returns ranked results. A timed fake loader (~1.8s) creates the perception of AI thinking. No backend, no API costs, no latency.

---

## Decisions Made

| Question | Decision |
|---|---|
| Hero layout | Option A — search bar embedded in red hero section |
| AI backend | Client-side only + fake loader |
| Results destination | New `/search` page (not inline replace) |
| Filter layout | Sidebar (Booking.com style) |
| Mobile sidebar | Slides in/out via filter button |

---

## 1. Homepage Hero — AI Search Bar

### What changes in `VibeHome.jsx`

The existing hero keeps its red background, animated taglines, "YOUR NEXT GETAWAY" heading, and yellow badge chip. Below the badge, add:

**Search bar** — full-width pill input (max-w-xl, centered):
- Left: ✨ sparkle icon
- Middle: placeholder text that cycles through prompts:
  - `"Try \"beach escape under GHS 1000\"..."`
  - `"Find me something near Kumasi for the family..."`
  - `"Romantic getaway, 2 nights, not too far..."`
- Right: red `ASK AI →` submit button (border-2 border-vibe-navy)
- On focus: border highlights to vibe-yellow
- On submit: navigate to `/search?q=<encoded query>`

**Quick-pick chips** — below the search bar, horizontally scrollable on mobile:
- 🌊 Beach weekend
- 🦁 Safari & wildlife  
- 💑 Romantic escape
- 🎉 Group trip
- 🌿 Eco retreat
- ❄️ Cool & refreshing
- 🏛️ Cultural trip
- 💰 Budget under GHS 500

Clicking a chip sets the query to that chip's label and navigates to `/search?q=<chip text>`.

**Fake loader** — shown on the `/search` page (not the homepage). After navigation, the search page shows the loader for 1.8s before revealing results.

### What stays the same
The activity filter strip, filter panel, editorial picks, festival teaser, and scrapbook CTA all remain unchanged on the homepage.

---

## 2. Client-Side Search Engine (`src/utils/searchEngine.js`)

A pure function: `searchProperties(query, allProperties) → RankedResult[]`

### Parsing pipeline

1. **Lowercase & normalise** the raw query string
2. **Extract signals** — scan for these keyword groups:

| Signal | Keywords | Effect |
|---|---|---|
| Beach/coastal | beach, coast, sea, ocean, ada, busua, kokrobite, saltpond | boost `activities.includes('beach')` |
| Nature/hiking | hiking, waterfall, forest, wli, boti, kakum | boost `activities.includes('hiking' / 'nature')` |
| Wildlife/safari | safari, elephant, mole, wildlife, game drive | boost `activities.includes('eco')` + `region === 'Savannah'` |
| Lakeside | lake, volta, akosombo, bosomtwe | boost `activities.includes('lakeside')` |
| Cultural | culture, history, castle, ashanti, festival | boost `activities.includes('cultural')` |
| Romantic/couples | romantic, couple, anniversary, honeymoon | boost `groups.includes('couple')` |
| Family | family, kids, children | boost `groups.includes('group4')` |
| Group | group, squad, friends, bachelor | boost `groups.includes('large')` |
| Eco | eco, sustainable, green, nature | boost `type === 'Eco Retreat'` |
| Budget | budget, cheap, affordable, under + GHS amount | filter `priceGHS <= extracted amount` |
| Luxury | luxury, upscale, premium, resort | boost `priceGHS >= 1200` |
| Region names | greater accra, ashanti, volta, central, western… | hard filter by region |
| City names | accra, kumasi, cape coast, tamale, ho, ada foah… | filter by `city` or fuzzy match |
| Drive time | near accra, close to kumasi, 2 hours | future: filter by drive time estimate |

3. **Score each property** — start at 0, add points:
   - +10 for each matching activity tag
   - +8 for matching group type
   - +6 for matching region/city
   - +5 for type match (eco, resort, etc.)
   - +3 for price within range
   - +2 for vibeScore / 10 (tiebreaker)
   - −100 if priceGHS > extracted max price (hard exclude)

4. **Sort** descending by score, return top 50

5. **Generate AI summary string** — template-based, e.g.:
   - `"Found {n} beach spots for couples, all under GHS {max} — {city1}, {city2} & {city3} lead the pack. 🌊"`
   - Built from the detected signals, not AI-generated

### Output shape
```js
{
  results: Property[],        // sorted, up to 50
  summary: string,            // "Found 14 beach spots..."
  detectedSignals: string[],  // ["beach", "couples", "budget"]
  totalCount: number,
}
```

---

## 3. Search Results Page (`src/pages/SearchResults.jsx`)

**Route:** `/search?q=<query>`

### Layout (desktop)

```
┌─────────────────────────────────────────────┐
│  NAVBAR (with search bar pre-filled)        │
├─────────────────────────────────────────────┤
│  AI ANSWER BANNER (navy bg, yellow text)    │
│  "✨ Found 14 beach spots for couples..."   │
├──────────────┬──────────────────────────────┤
│  SIDEBAR     │  RESULTS                     │
│  (240px)     │                              │
│              │  Sort: [Best match ▾]        │
│  Region      │  14 spots                   │
│  ☑ Western   │                              │
│  ☐ Central   │  [Card] [Card] [Card]        │
│              │  [Card] [Card] [Card]        │
│  Price/night │  ...                         │
│  GHS 0–2000  │                              │
│  [slider]    │                              │
│              │                              │
│  Type        │                              │
│  ☑ Resort    │                              │
│  ☑ Airbnb    │                              │
│              │                              │
│  Activities  │                              │
│  ☑ Beach     │                              │
│  ☐ Hiking    │                              │
│              │                              │
│  🚗 From     │                              │
│  ◉ Accra     │                              │
│  ○ Kumasi    │                              │
│              │                              │
│  [APPLY]     │                              │
│  Clear all   │                              │
└──────────────┴──────────────────────────────┘
```

### Layout (mobile)

- Sidebar is hidden by default
- Sticky bar at top of results: `[⚙️ Filters (3)] [Sort ▾] · 14 spots`
- Tapping "Filters" slides the sidebar in from the left as a full-height drawer over the content
- Drawer has an ✕ close button and "Apply" button at the bottom
- Results below the sticky bar as a 1-col (mobile) or 2-col (sm) grid

### Fake loader state

Shown for 1.8s after the page mounts (query present in URL):
- Hero-coloured background (vibe-navy)
- Animated steps appear sequentially with 400ms gaps:
  1. ✓ Reading your vibe...
  2. ✓ Scanning {n} spots across Ghana...
  3. ⏳ Ranking by {signal} score...
- After 1.8s: fade out loader, fade in results
- State: `const [loading, setLoading] = useState(true)` → `useEffect` with 1800ms timeout

### AI Answer Banner

Sticky below the navbar. Navy background.

```
✨ GETAWAY AI  |  Found 14 beach spots for couples under GHS 1,000 — 
                  Ada Foah, Busua & Kokrobite lead the pack. 🌊
                                              [New search ✕]
```

Clicking "New search ✕" clears the query and navigates back to `/`.

### Sidebar filters

Each filter section is a collapsible `<details>` element (open by default):

| Filter | Control | Notes |
|---|---|---|
| Region | Checkboxes with count | Only show regions present in results |
| Price/night | Dual-handle range slider | GHS 0 – max price in dataset |
| Type | Checkboxes | Hotel, Resort, Airbnb, Eco Retreat, Guesthouse, Lodge |
| Activities | Checkboxes (icons) | Beach, Nature, Hiking, Cultural, etc. |
| 🚗 Drive from | Radio buttons | Accra, Kumasi, Cape Coast, Takoradi, Ho, Tamale |
| Sort | Dropdown | Best match · Price low→high · Price high→low · Rating |

Filters are applied in real-time (no "Apply" button on desktop). Mobile has an "Apply" button in the drawer.

Active filter count shown on the mobile filter button: `⚙️ Filters (3)`

### Property cards

Reuse the existing `<PropertyCard>` component (already handles `fromCity` prop). Display in a 3-col grid (desktop) / 2-col (sm) / 1-col (mobile).

Top 3 results get a `#1 AI Pick`, `#2`, `#3` badge overlaid on the card image.

### Empty state

If filters reduce results to 0:
```
No spots match these filters.
Try removing a filter or [start a new search].
```

---

## 4. Navbar Update

The existing Navbar gains a compact search bar in the centre on the `/search` route (not on other pages). Clicking it focuses the input and lets the user refine the query and re-submit.

This is the same input pill, pre-filled with `searchParams.get('q')`, that on submit navigates to `/search?q=<new query>` (resetting the results and re-running the loader).

---

## 5. New Files

| File | Purpose |
|---|---|
| `src/utils/searchEngine.js` | Pure search/scoring function |
| `src/pages/SearchResults.jsx` | `/search` route — loader + sidebar + results |

## 6. Modified Files

| File | Change |
|---|---|
| `src/pages/VibeHome.jsx` | Add AI search bar + quick chips to hero |
| `src/App.jsx` | Add `/search` route |
| `src/components/Navbar.jsx` | Show compact search bar when on `/search` |

---

## Out of Scope (Phase 2+)

- Real Claude API calls
- Itinerary generator page
- Social sharing / WhatsApp share from results
- Saved searches
- "Hidden gems" curated section (can be an editorial pick for now)
