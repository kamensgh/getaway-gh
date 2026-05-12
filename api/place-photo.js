// Proxies Google Place Photos so the API key stays server-side
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { ref, maxwidth = 800 } = req.query
  if (!ref) return res.status(400).json({ error: 'ref required' })

  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return res.status(500).json({ error: 'API key not configured' })

  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${ref}&key=${key}`
  const r = await fetch(url)
  if (!r.ok) return res.status(r.status).end()

  res.setHeader('Content-Type', r.headers.get('content-type') || 'image/jpeg')
  res.setHeader('Cache-Control', 'public, max-age=86400')
  const buf = await r.arrayBuffer()
  res.send(Buffer.from(buf))
}
