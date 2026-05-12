/**
 * For all properties with empty nearby data:
 * 1. Look up correct coords via Places text search
 * 2. If coords differ significantly, update properties.js and nearby-data.js
 * 3. If genuinely remote, leave as-is
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT  = join(__dir, '..')
const KEY   = readFileSync(join(ROOT, '.env.local'), 'utf8').match(/GOOGLE_PLACES_API_KEY=(.+)/)?.[1].trim()

if (!KEY) { console.error('No API key'); process.exit(1) }

const TYPES = ['restaurant','bar','night_club','hospital','pharmacy','atm','bank','park','natural_feature']
const CATS  = {
  restaurant: ['restaurant'], nightlife: ['bar','night_club'],
  medical: ['hospital','pharmacy'], atm: ['atm','bank'], nature: ['park','natural_feature'],
}

// Properties with empty nearby data and their current coords
const toCheck = [
  { id: 1,   name: 'Boti Falls Eco Lodge',        city: 'Somanya',    lat: 6.1938,  lng: -0.2186 },
  { id: 6,   name: 'Nzulezu Stilt Village Stay',   city: 'Half Assini', lat: 4.9450,  lng: -2.4640 },
  { id: 10,  name: 'Volta Lake Canopy Villa',       city: 'Sogakope',   lat: 5.9980,  lng: 0.3000  },
  { id: 16,  name: 'Volta Hills Eco Camp',          city: 'Ho',         lat: 6.9600,  lng: 0.4200  },
  { id: 18,  name: 'Green Turtle Lodge',            city: 'Axim',       lat: 4.8000,  lng: -2.0800 },
  { id: 19,  name: 'Bunso Eco Park Retreat',        city: 'Akim Oda',   lat: 6.2800,  lng: -0.4200 },
  { id: 37,  name: 'Stone Lodge',                   city: 'Somanya',    lat: 6.0024,  lng: 0.1020  },
  { id: 71,  name: 'Zaina Lodge',                   city: 'Damongo',    lat: 9.5217,  lng: -2.0348 },
  { id: 81,  name: 'Buipe Bridge Lodge',            city: 'Buipe',      lat: 8.9867,  lng: -1.0734 },
  { id: 84,  name: 'Cocoa Village Guesthouse',      city: 'Konongo',    lat: 6.4521,  lng: -1.2189 },
  { id: 96,  name: 'Anomabo Beach Resort',          city: 'Saltpond',   lat: 5.1612,  lng: -1.0823 },
  { id: 97,  name: 'Biriwa Beach Hotel',            city: 'Saltpond',   lat: 5.1798,  lng: -1.0412 },
  { id: 103, name: 'Ayikoo Beach House',            city: 'Saltpond',   lat: 5.1423,  lng: -1.0645 },
  { id: 110, name: 'Tongo Hills Guesthouse',        city: 'Tongo',      lat: 10.8234, lng: -0.7912 },
  { id: 118, name: 'Zuarungu Country Lodge',        city: 'Bolgatanga', lat: 10.8123, lng: -0.8234 },
  { id: 128, name: 'Jirapa Heritage Guesthouse',    city: 'Jirapa',     lat: 10.5867, lng: -2.9589 },
  { id: 129, name: 'Sissala Lodge',                 city: 'Tumu',       lat: 10.8234, lng: -2.5612 },
  { id: 135, name: 'Grumah Crocodile Camp',         city: 'Nadowli',    lat: 10.7612, lng: -2.7023 },
  { id: 156, name: 'Eliason Hotel Half Assini',     city: 'Half Assini', lat: 5.0633, lng: -2.7782 },
  { id: 158, name: 'Cyson Lodge Half Assini',       city: 'Half Assini', lat: 5.0327, lng: -2.7978 },
  { id: 421, name: 'Dzidzorfe hotel and restaurant',city: 'Sogakope',   lat: 5.8967,  lng: 0.6347  },
  { id: 424, name: 'Royal Riverside Lodge',         city: 'Sogakope',   lat: 5.8645,  lng: 0.6156  },
  { id: 585, name: 'Grand Eco Cabanas Resort',      city: 'Lake Bosomtwe', lat: 6.5314, lng: -1.3902 },
]

async function findCorrectCoords(name, city) {
  const query = encodeURIComponent(`${name} ${city} Ghana`)
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=geometry,name&key=${KEY}`
  const d = await fetch(url).then(r => r.json())
  if (d.candidates?.[0]?.geometry?.location) {
    return d.candidates[0].geometry.location
  }
  // Fallback: search city only
  const cityUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(city + ' Ghana')}&inputtype=textquery&fields=geometry,name&key=${KEY}`
  const d2 = await fetch(cityUrl).then(r => r.json())
  return d2.candidates?.[0]?.geometry?.location || null
}

async function fetchNearby(lat, lng) {
  const results = []
  for (const type of TYPES) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&type=${type}&key=${KEY}`
    const d = await fetch(url).then(r => r.json())
    const places = (d.results || []).slice(0, 5).map(p => ({
      name: p.name, rating: p.rating || null,
      vicinity: p.vicinity || null, place_id: p.place_id,
    }))
    results.push({ type, places })
    await new Promise(r => setTimeout(r, 120))
  }
  return results
}

function groupResults(raw) {
  const g = Object.fromEntries(Object.keys(CATS).map(k => [k, []]))
  for (const { type, places } of raw) {
    for (const [cat, types] of Object.entries(CATS)) {
      if (types.includes(type)) { g[cat].push(...places); break }
    }
  }
  for (const cat of Object.keys(g)) {
    const seen = new Set()
    g[cat] = g[cat].filter(p => seen.has(p.name) ? false : seen.add(p.name))
  }
  return g
}

function totalResults(grouped) {
  return Object.values(grouped).reduce((s, a) => s + a.length, 0)
}

// Load nearby-data.js
const dataPath = join(ROOT, 'src/data/nearby-data.js')
const nearbyRaw = readFileSync(dataPath, 'utf8')
  .replace(/^\/\/[^\n]*\n/, '').replace('export const nearbyData =', '').trim().replace(/;?\s*$/, '')
const nearbyData = JSON.parse(nearbyRaw)

// Load both property files as text for coord patching
let coreText   = readFileSync(join(ROOT, 'src/data/properties.js'), 'utf8')
let googleText = readFileSync(join(ROOT, 'src/data/google-properties.js'), 'utf8')

const coordFixes = []  // { id, oldLat, oldLng, newLat, newLng }

for (const prop of toCheck) {
  process.stdout.write(`[${prop.id}] ${prop.name} ... `)

  // First try with existing coords at 3km
  const existing = await fetchNearby(prop.lat, prop.lng)
  const existingTotal = totalResults(groupResults(existing))

  if (existingTotal > 0) {
    console.log(`✓ ${existingTotal} results at existing coords`)
    nearbyData[String(prop.id)] = groupResults(existing)
    await new Promise(r => setTimeout(r, 200))
    continue
  }

  // Look up correct coords
  const correct = await findCorrectCoords(prop.name, prop.city)
  await new Promise(r => setTimeout(r, 200))

  if (!correct) {
    console.log('✗ no coords found — genuinely remote')
    continue
  }

  const dist = Math.sqrt(Math.pow(correct.lat - prop.lat, 2) + Math.pow(correct.lng - prop.lng, 2))
  process.stdout.write(`corrected coords (${correct.lat.toFixed(4)},${correct.lng.toFixed(4)}) dist=${dist.toFixed(3)} ... `)

  const fresh = await fetchNearby(correct.lat, correct.lng)
  const freshTotal = totalResults(groupResults(fresh))

  if (freshTotal > 0) {
    console.log(`✓ ${freshTotal} results`)
    nearbyData[String(prop.id)] = groupResults(fresh)
    coordFixes.push({ id: prop.id, oldLat: prop.lat, oldLng: prop.lng, newLat: correct.lat, newLng: correct.lng })
  } else {
    console.log('genuinely remote / unmapped')
  }
  await new Promise(r => setTimeout(r, 300))
}

// Write updated nearby-data.js
writeFileSync(dataPath, `// Auto-generated by scripts/prebake-nearby.mjs — do not edit manually\nexport const nearbyData = ${JSON.stringify(nearbyData)}\n`)
console.log(`\nUpdated nearby-data.js`)

// Patch coords in property files
for (const { id, oldLat, oldLng, newLat, newLng } of coordFixes) {
  const oldStr = `coords: { lat: ${oldLat}, lng: ${oldLng} }`

  // Try exact match first, then approximate
  const tryReplace = (src, file) => {
    if (src.includes(oldStr)) return src.replace(oldStr, `coords: { lat: ${newLat}, lng: ${newLng} }`)
    // Fuzzy: look for id block and replace nearest coords
    const idRe = new RegExp(`id:\\s*${id},[\\s\\S]{0,2000}?(coords:\\s*\\{\\s*lat:\\s*[\\d.-]+,\\s*lng:\\s*[\\d.-]+\\s*\\})`)
    const m = src.match(idRe)
    if (m) return src.replace(m[1], `coords: { lat: ${newLat}, lng: ${newLng} }`)
    return src
  }

  const newCore = tryReplace(coreText, 'properties.js')
  if (newCore !== coreText) { coreText = newCore; console.log(`  Patched coords for id ${id} in properties.js`) }
  else {
    const newGoogle = tryReplace(googleText, 'google-properties.js')
    if (newGoogle !== googleText) { googleText = newGoogle; console.log(`  Patched coords for id ${id} in google-properties.js`) }
  }
}

writeFileSync(join(ROOT, 'src/data/properties.js'), coreText)
writeFileSync(join(ROOT, 'src/data/google-properties.js'), googleText)
console.log(`\nDone. ${coordFixes.length} coord fixes applied.`)
console.log('Fixes:', coordFixes.map(f => `${f.id}:(${f.oldLat},${f.oldLng})→(${f.newLat.toFixed(4)},${f.newLng.toFixed(4)})`).join('\n       '))
