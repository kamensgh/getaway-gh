#!/usr/bin/env node
/**
 * Enriches getaway-gh with Google Places data.
 * Run: node scripts/enrich-google.mjs
 *
 * Outputs:
 *   src/data/google-images.js     — propertyId → ['/api/place-photo?ref=...']
 *   src/data/google-properties.js — new lodging places discovered via Nearby Search
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { createRequire } from 'module'

const KEY = 'AIzaSyDXa6CdwiN8M6tkYNbCOg5SOtslmABIQ5E'
const PROXY = '/api/place-photo'
const MAX_PHOTOS = 8
const DELAY = 300  // ms between calls to stay under rate limits
const CHECKPOINT = './scripts/.checkpoint.json'

const sleep = ms => new Promise(r => setTimeout(r, ms))
const log = (...a) => console.log(new Date().toISOString().slice(11,19), ...a)

// ─── API helpers ────────────────────────────────────────────────────────────

async function gfetch(url) {
  await sleep(DELAY)
  const r = await fetch(url)
  const text = await r.text()
  try { return JSON.parse(text) }
  catch { console.error('Non-JSON response:', text.slice(0, 200)); return null }
}

async function findPlace(name, lat, lng) {
  const p = new URLSearchParams({
    input: `${name} Ghana`,
    inputtype: 'textquery',
    locationbias: `circle:8000@${lat},${lng}`,
    fields: 'place_id,name,photos,rating,geometry',
    key: KEY,
  })
  const d = await gfetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${p}`)
  return d?.candidates?.[0] || null
}

async function getDetails(placeId) {
  const p = new URLSearchParams({
    place_id: placeId,
    fields: 'name,rating,photos,geometry,price_level,types,formatted_address',
    key: KEY,
  })
  const d = await gfetch(`https://maps.googleapis.com/maps/api/place/details/json?${p}`)
  return d?.result || null
}

async function nearbySearch(lat, lng, radius = 8000, pagetoken = null) {
  if (pagetoken) await sleep(2500) // Google requires delay before using next_page_token
  const p = new URLSearchParams({ location: `${lat},${lng}`, radius, type: 'lodging', key: KEY })
  if (pagetoken) p.set('pagetoken', pagetoken)
  return gfetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${p}`)
}

function photoUrls(photos = []) {
  return photos.slice(0, MAX_PHOTOS).map(ph =>
    `${PROXY}?ref=${ph.photo_reference}&maxwidth=1200`
  )
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CITY_REGION = {
  'Accra': 'Greater Accra', 'Tema': 'Greater Accra', 'Kokrobite': 'Greater Accra',
  'Ada Foah': 'Greater Accra', 'Prampram': 'Greater Accra', 'Weija': 'Greater Accra',
  'Kumasi': 'Ashanti', 'Lake Bosomtwe': 'Ashanti', 'Obuasi': 'Ashanti', 'Konongo': 'Ashanti',
  'Cape Coast': 'Central', 'Elmina': 'Central', 'Saltpond': 'Central', 'Kakum': 'Central', 'Mankessim': 'Central',
  'Takoradi': 'Western', 'Busua': 'Western', 'Axim': 'Western', 'Half Assini': 'Western', 'Dixcove': 'Western',
  'Ho': 'Volta', 'Hohoe': 'Volta', 'Sogakope': 'Volta', 'Keta': 'Volta', 'Denu': 'Volta', 'Aflao': 'Volta',
  'Tamale': 'Northern', 'Damongo': 'Savannah', 'Salaga': 'Savannah', 'Mole': 'Savannah',
  'Bolgatanga': 'Upper East', 'Navrongo': 'Upper East', 'Bawku': 'Upper East', 'Tongo': 'Upper East',
  'Wa': 'Upper West', 'Lawra': 'Upper West', 'Jirapa': 'Upper West',
  'Koforidua': 'Eastern', 'Akosombo': 'Eastern', 'Aburi': 'Eastern', 'Somanya': 'Eastern',
  'Sunyani': 'Bono', 'Techiman': 'Bono East', 'Kintampo': 'Bono East',
}

// Cities to discover new properties in, with center coords
const DISCOVER_CITIES = [
  { city: 'Accra',        region: 'Greater Accra', lat: 5.6037,  lng: -0.1870 },
  { city: 'Kumasi',       region: 'Ashanti',        lat: 6.6885,  lng: -1.6244 },
  { city: 'Cape Coast',   region: 'Central',        lat: 5.1054,  lng: -1.2466 },
  { city: 'Takoradi',     region: 'Western',        lat: 4.9343,  lng: -1.7144 },
  { city: 'Busua',        region: 'Western',        lat: 4.8088,  lng: -1.9361 },
  { city: 'Elmina',       region: 'Central',        lat: 5.0844,  lng: -1.3495 },
  { city: 'Ada Foah',     region: 'Greater Accra',  lat: 5.7818,  lng: 0.6273  },
  { city: 'Kokrobite',    region: 'Greater Accra',  lat: 5.5337,  lng: -0.4243 },
  { city: 'Ho',           region: 'Volta',          lat: 6.6000,  lng: 0.4700  },
  { city: 'Hohoe',        region: 'Volta',          lat: 7.1525,  lng: 0.4694  },
  { city: 'Sogakope',     region: 'Volta',          lat: 5.8667,  lng: 0.5833  },
  { city: 'Tamale',       region: 'Northern',       lat: 9.4034,  lng: -0.8424 },
  { city: 'Bolgatanga',   region: 'Upper East',     lat: 10.7856, lng: -0.8519 },
  { city: 'Navrongo',     region: 'Upper East',     lat: 10.8944, lng: -1.0927 },
  { city: 'Wa',           region: 'Upper West',     lat: 10.0601, lng: -2.5099 },
  { city: 'Koforidua',    region: 'Eastern',        lat: 6.0940,  lng: -0.2617 },
  { city: 'Akosombo',     region: 'Eastern',        lat: 6.2992,  lng: 0.0570  },
  { city: 'Sunyani',      region: 'Bono',           lat: 7.3349,  lng: -2.3267 },
  { city: 'Lake Bosomtwe',region: 'Ashanti',        lat: 6.5017,  lng: -1.4145 },
  { city: 'Mole',         region: 'Savannah',       lat: 9.5000,  lng: -1.8500 },
]

const GOOGLE_TYPE_TO_PROP_TYPE = {
  'resort': 'Resort', 'hotel': 'Hotel', 'motel': 'Hotel',
  'lodge': 'Lodge', 'hostel': 'Hostel', 'campground': 'Eco Camp',
  'bed_and_breakfast': 'Guest House', 'extended_stay_hotel': 'Guest House',
}

function inferType(types = []) {
  for (const t of types) {
    const mapped = GOOGLE_TYPE_TO_PROP_TYPE[t]
    if (mapped) return mapped
  }
  return 'Lodge'
}

function inferPrice(priceLevel) {
  // price_level: 0=free,1=$,2=$$,3=$$$,4=$$$$
  const map = { 0: 350, 1: 450, 2: 850, 3: 1600, 4: 3000 }
  return map[priceLevel] ?? 750
}

function inferRegion(vicinity = '', cityHint = '') {
  for (const [city, region] of Object.entries(CITY_REGION)) {
    if (vicinity.includes(city) || cityHint === city) return region
  }
  return 'Greater Accra' // fallback
}

// ─── Checkpoint helpers ──────────────────────────────────────────────────────

function loadCheckpoint() {
  if (existsSync(CHECKPOINT)) {
    try { return JSON.parse(readFileSync(CHECKPOINT, 'utf8')) }
    catch {}
  }
  return { images: {}, newPlaceIds: [] }
}

function saveCheckpoint(cp) {
  writeFileSync(CHECKPOINT, JSON.stringify(cp, null, 2))
}

// ─── Main ────────────────────────────────────────────────────────────────────

const require = createRequire(import.meta.url)

async function main() {
  // Dynamic import of existing properties
  const propPath = new URL('../src/data/properties.js', import.meta.url).pathname
  const { properties } = await import(propPath + '?v=' + Date.now())

  log(`Loaded ${properties.length} existing properties`)

  const cp = loadCheckpoint()
  log(`Checkpoint: ${Object.keys(cp.images).length} enriched, ${cp.newPlaceIds.length} discovered`)

  // ── Step 1: Enrich existing properties with Google Place photos ─────────────

  for (const prop of properties) {
    if (cp.images[prop.id] !== undefined) continue // already done
    if (!prop.coords) { cp.images[prop.id] = []; continue }

    try {
      const found = await findPlace(prop.name, prop.coords.lat, prop.coords.lng)
      if (!found) {
        log(`  ✗ Not found: ${prop.name}`)
        cp.images[prop.id] = []
        saveCheckpoint(cp)
        continue
      }

      // Get details for more photos
      let photos = found.photos || []
      if (found.place_id && photos.length < 3) {
        const details = await getDetails(found.place_id)
        if (details?.photos) photos = details.photos
      }

      const urls = photoUrls(photos)
      cp.images[prop.id] = urls
      log(`  ✓ [${prop.id}] ${prop.name} → ${urls.length} photos`)
    } catch (e) {
      log(`  ✗ Error for ${prop.name}:`, e.message)
      cp.images[prop.id] = []
    }

    saveCheckpoint(cp)
  }

  log('\nStep 1 complete. Writing google-images.js...')

  // Write google-images.js
  const imageEntries = Object.entries(cp.images)
    .filter(([, urls]) => urls.length > 0)
    .map(([id, urls]) => `  ${id}: [\n${urls.map(u => `    '${u}'`).join(',\n')}\n  ]`)
    .join(',\n')

  const enrichedCount = Object.values(cp.images).filter(u => u.length > 0).length
  writeFileSync(
    new URL('../src/data/google-images.js', import.meta.url).pathname,
    `// Auto-generated by scripts/enrich-google.mjs — ${new Date().toISOString()}\n// ${enrichedCount} of ${properties.length} properties enriched\nexport const googleImages = {\n${imageEntries}\n}\n`
  )
  log(`Wrote google-images.js (${enrichedCount} enriched)`)

  // ── Step 2: Discover new lodging via Nearby Search ──────────────────────────

  const existingNames = new Set(properties.map(p => p.name.toLowerCase().replace(/[^a-z0-9]/g, '')))
  const newPlaceIdSet = new Set(cp.newPlaceIds)
  const newProps = []
  let nextId = Math.max(...properties.map(p => p.id)) + 1

  for (const { city, region, lat, lng } of DISCOVER_CITIES) {
    log(`\nDiscovering lodging near ${city}...`)
    let pagetoken = null
    let pageCount = 0

    do {
      const data = await nearbySearch(lat, lng, 8000, pagetoken)
      if (!data?.results) break

      for (const place of data.results) {
        if (newPlaceIdSet.has(place.place_id)) continue

        const normName = place.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (existingNames.has(normName)) { newPlaceIdSet.add(place.place_id); continue }

        // Skip places with very few ratings (likely not real lodging)
        if ((place.user_ratings_total || 0) < 3) continue

        const photos = photoUrls(place.photos || [])
        if (photos.length === 0) continue // skip if no photos

        const propType = inferType(place.types || [])
        const priceGHS = inferPrice(place.price_level)

        newProps.push({
          id: nextId++,
          name: place.name,
          type: propType,
          region,
          district: city,
          city,
          coords: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
          priceGHS,
          rating: place.rating || 4.0,
          reviewCount: place.user_ratings_total || 0,
          images: photos,
          description: `${place.name} is a ${propType.toLowerCase()} located in ${city}, ${region} Region, Ghana.`,
          activities: [],
          amenities: [],
          bestMonths: ['Nov','Dec','Jan','Feb','Mar'],
          googlePlaceId: place.place_id,
        })

        newPlaceIdSet.add(place.place_id)
        existingNames.add(normName)
        log(`  + [${nextId - 1}] ${place.name} (${propType}, ★${place.rating})`)
      }

      pagetoken = data.next_page_token || null
      pageCount++
    } while (pagetoken && pageCount < 2)
  }

  cp.newPlaceIds = [...newPlaceIdSet]
  saveCheckpoint(cp)

  // Write google-properties.js
  const propsJs = newProps.map(p => {
    const imgs = p.images.map(u => `      '${u}'`).join(',\n')
    return `  {
    id: ${p.id},
    name: '${p.name.replace(/'/g, "\\'")}',
    type: '${p.type}',
    region: '${p.region}',
    district: '${p.district}',
    city: '${p.city}',
    coords: { lat: ${p.coords.lat}, lng: ${p.coords.lng} },
    priceGHS: ${p.priceGHS},
    rating: ${p.rating},
    reviewCount: ${p.reviewCount},
    images: [\n${imgs}\n    ],
    description: '${p.description.replace(/'/g, "\\'")}',
    activities: [],
    amenities: [],
    bestMonths: ['Nov','Dec','Jan','Feb','Mar'],
    googlePlaceId: '${p.googlePlaceId}',
  }`
  }).join(',\n')

  writeFileSync(
    new URL('../src/data/google-properties.js', import.meta.url).pathname,
    `// Auto-generated by scripts/enrich-google.mjs — ${new Date().toISOString()}\n// ${newProps.length} new properties discovered via Google Places Nearby Search\nexport const googleProperties = [\n${propsJs}\n]\n`
  )

  log(`\n✅ Done!`)
  log(`   Enriched photos: ${enrichedCount} existing properties`)
  log(`   New properties discovered: ${newProps.length}`)
  log(`\nNext: run 'npm run build && npx vercel --prod --yes'`)
}

main().catch(e => { console.error(e); process.exit(1) })
