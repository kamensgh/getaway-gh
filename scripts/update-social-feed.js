#!/usr/bin/env node
// Runs in GitHub Actions daily. Calls Apify REST API to scrape TikTok + Instagram
// Ghana travel posts, merges results, and writes src/data/social-feed.json.
// Requires env vars: APIFY_API_TOKEN

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '../src/data/social-feed.json')
const TOKEN = process.env.APIFY_API_TOKEN
const BASE = 'https://api.apify.com/v2'

if (!TOKEN) {
  console.error('Missing APIFY_API_TOKEN')
  process.exit(1)
}

async function runActor(actorId, input) {
  console.log(`Starting actor ${actorId}...`)
  const run = await fetch(`${BASE}/acts/${actorId}/runs?token=${TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then(r => r.json())

  const runId = run.data?.id
  if (!runId) throw new Error(`Failed to start actor ${actorId}: ${JSON.stringify(run)}`)

  // Poll until finished (max 5 min)
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const status = await fetch(`${BASE}/actor-runs/${runId}?token=${TOKEN}`).then(r => r.json())
    const s = status.data?.status
    console.log(`  ${actorId} status: ${s}`)
    if (s === 'SUCCEEDED') break
    if (s === 'FAILED' || s === 'ABORTED' || s === 'TIMED-OUT') {
      throw new Error(`Actor ${actorId} ended with status ${s}`)
    }
  }

  const items = await fetch(`${BASE}/actor-runs/${runId}/dataset/items?token=${TOKEN}&clean=true&limit=50`)
    .then(r => r.json())
  return items
}

function normalizeTikTok(item) {
  const url = item.webVideoUrl || item.videoUrl || `https://www.tiktok.com/@${item.authorMeta?.name}/video/${item.id}`
  const thumbnail = item.covers?.default || item.videoMeta?.coverUrl || item.cover
  if (!thumbnail) return null
  return {
    id: `tt_${item.id}`,
    platform: 'tiktok',
    url,
    thumbnail,
    creator: item.authorMeta?.name || item.author || 'unknown',
    caption: (item.text || '').slice(0, 120),
    likes: item.diggCount || item.stats?.diggCount || 0,
    hashtags: (item.hashtags || []).map(h => h.name || h),
    postedAt: item.createTime ? new Date(item.createTime * 1000).toISOString() : null,
  }
}

function normalizeInstagram(item) {
  const thumbnail = item.displayUrl || item.thumbnailUrl || item.previewUrl
  if (!thumbnail) return null
  return {
    id: `ig_${item.shortCode || item.id}`,
    platform: 'instagram',
    url: item.url || `https://www.instagram.com/p/${item.shortCode}/`,
    thumbnail,
    creator: item.ownerUsername || item.username || 'unknown',
    caption: (item.caption || item.text || '').slice(0, 120),
    likes: item.likesCount || item.likes || 0,
    hashtags: (item.hashtags || []),
    postedAt: item.timestamp || item.takenAtTimestamp || null,
  }
}

async function main() {
  const allPosts = []

  // ── TikTok scrape ────────────────────────────────────────────────────────────
  try {
    const tiktokItems = await runActor('clockworks~tiktok-scraper', {
      hashtags: ['GhanaTravel', 'VisitGhana', 'GhanaBeach', 'GhanaGetaway', 'GhanaVacation'],
      resultsPerPage: 12,
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
    })
    const normalized = tiktokItems.flatMap(item => {
      const n = normalizeTikTok(item)
      return n ? [n] : []
    })
    console.log(`TikTok: ${normalized.length} valid posts`)
    allPosts.push(...normalized)
  } catch (e) {
    console.warn('TikTok scrape failed:', e.message)
  }

  // ── Instagram scrape ─────────────────────────────────────────────────────────
  const igHashtags = ['ghanatravel', 'visitghana', 'ghanabeach', 'ghanagetaway']
  for (const hashtag of igHashtags) {
    try {
      const igItems = await runActor('breathtaking_anthem~instagram-hashtag-posts-scraper', {
        hashtag,
        scrape_type: 'recent',
        max_items: 10,
      })
      const normalized = igItems.flatMap(item => {
        const n = normalizeInstagram(item)
        return n ? [n] : []
      })
      console.log(`Instagram #${hashtag}: ${normalized.length} valid posts`)
      allPosts.push(...normalized)
    } catch (e) {
      console.warn(`Instagram #${hashtag} failed:`, e.message)
    }
  }

  // ── Web / blog scrape ────────────────────────────────────────────────────────
  // (Lightweight: we parse Apify's RAG browser for Ghana travel news)
  const webSearches = [
    'Ghana travel guide 2025 hidden gems',
    'Ghana beach holiday things to do 2025',
  ]
  for (const query of webSearches) {
    try {
      const results = await runActor('apify~rag-web-browser', {
        query,
        maxResults: 3,
        outputFormats: ['markdown'],
      })
      for (const r of results) {
        if (!r.screenshot) continue
        allPosts.push({
          id: `web_${Buffer.from(r.url || query).toString('base64').slice(0, 16)}`,
          platform: 'web',
          url: r.url || '#',
          thumbnail: r.screenshot,
          creator: new URL(r.url || 'https://example.com').hostname.replace('www.', ''),
          caption: (r.markdown || r.text || '').replace(/#+/g, '').trim().slice(0, 120),
          likes: 0,
          hashtags: [],
          postedAt: null,
        })
      }
    } catch (e) {
      console.warn(`Web search failed for "${query}":`, e.message)
    }
  }

  if (allPosts.length === 0) {
    console.warn('No posts collected — keeping existing feed.')
    process.exit(0)
  }

  // ── Deduplicate & rank ───────────────────────────────────────────────────────
  const seen = new Set()
  const unique = allPosts.filter(p => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })

  unique.sort((a, b) => (b.likes || 0) - (a.likes || 0))
  const top = unique.slice(0, 30)

  const feed = {
    lastUpdated: new Date().toISOString(),
    posts: top,
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(feed, null, 2))
  console.log(`✓ Wrote ${top.length} posts to social-feed.json`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
