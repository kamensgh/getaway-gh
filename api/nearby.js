// Vercel serverless function — proxies Google Places Nearby Search
// keeping the API key server-side
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { lat, lng, radius = 2000 } = req.query
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' })

  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return res.status(500).json({ error: 'API key not configured' })

  const types = [
    'restaurant',
    'bar',
    'night_club',
    'hospital',
    'pharmacy',
    'atm',
    'bank',
    'park',
    'natural_feature',
  ]

  try {
    const results = await Promise.all(
      types.map(type =>
        fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${key}`
        ).then(r => r.json()).then(d => ({
          type,
          places: (d.results || []).slice(0, 5).map(p => ({
            name: p.name,
            rating: p.rating,
            user_ratings_total: p.user_ratings_total,
            vicinity: p.vicinity,
            photo: p.photos?.[0]?.photo_reference || null,
            place_id: p.place_id,
          })),
        }))
      )
    )

    res.json({ results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
