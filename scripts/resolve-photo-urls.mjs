#!/usr/bin/env node
/**
 * Resolves all /api/place-photo?ref=... proxy URLs to direct lh3.googleusercontent.com CDN URLs.
 * Run: node scripts/resolve-photo-urls.mjs
 *
 * Uses a checkpoint so it can resume if interrupted.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'

const KEY = 'AIzaSyDXa6CdwiN8M6tkYNbCOg5SOtslmABIQ5E'
const CHECKPOINT = './scripts/.photo-checkpoint.json'
const DELAY = 80  // ms between requests — fast, just following redirects

const sleep = ms => new Promise(r => setTimeout(r, ms))
const log = (...a) => process.stdout.write(a.join(' '))

async function resolveRef(ref) {
  await sleep(DELAY)
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${ref}&key=${KEY}`
  const r = await fetch(url, { redirect: 'manual' })
  const loc = r.headers.get('location')
  if (loc && loc.includes('googleusercontent.com')) return loc
  // Some refs return 200 directly with the image — extract from x-goog-* or just use the URL
  if (r.status === 200) return url  // keep proxy as last resort
  return null
}

function extractRefs(content) {
  const refs = new Set()
  const re = /\/api\/place-photo\?ref=([^&'\s]+)/g
  let m
  while ((m = re.exec(content)) !== null) refs.add(m[1])
  return [...refs]
}

// Load checkpoint
let resolved = {}
if (existsSync(CHECKPOINT)) {
  try { resolved = JSON.parse(readFileSync(CHECKPOINT, 'utf8')) } catch {}
}

// Collect all refs from both generated files
const imagesPath = new URL('../src/data/google-images.js', import.meta.url).pathname
const propsPath  = new URL('../src/data/google-properties.js', import.meta.url).pathname

const imagesContent = readFileSync(imagesPath, 'utf8')
const propsContent  = readFileSync(propsPath, 'utf8')

const allRefs = [...new Set([...extractRefs(imagesContent), ...extractRefs(propsContent)])]
const todo = allRefs.filter(r => !resolved[r])

console.log(`Total refs: ${allRefs.length} | Already resolved: ${allRefs.length - todo.length} | Remaining: ${todo.length}`)

// Resolve in batches of 10 (parallel)
const BATCH = 10
for (let i = 0; i < todo.length; i += BATCH) {
  const batch = todo.slice(i, i + BATCH)
  const results = await Promise.all(batch.map(ref =>
    resolveRef(ref).then(url => ({ ref, url })).catch(() => ({ ref, url: null }))
  ))
  for (const { ref, url } of results) {
    resolved[ref] = url
    log(url ? '.' : 'x')
  }
  writeFileSync(CHECKPOINT, JSON.stringify(resolved, null, 2))
  if (i % 100 === 0 && i > 0) console.log(` ${i}/${todo.length}`)
}
console.log(`\nResolved ${Object.values(resolved).filter(Boolean).length} / ${allRefs.length} refs`)

// Replace all proxy URLs in both files
function replaceUrls(content) {
  return content.replace(/\/api\/place-photo\?ref=([^&'\s]+)&maxwidth=1200/g, (match, ref) => {
    return resolved[ref] || match
  })
}

writeFileSync(imagesPath, replaceUrls(imagesContent))
writeFileSync(propsPath,  replaceUrls(propsContent))

console.log('Updated google-images.js and google-properties.js with direct CDN URLs')
console.log('The /api/place-photo proxy is no longer needed for stored images.')
