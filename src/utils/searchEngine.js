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
