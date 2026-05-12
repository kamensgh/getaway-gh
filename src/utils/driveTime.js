function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Straight-line × road factor, then divide by typical speed for that distance range
export function estimateDriveTime(fromCoords, toCoords) {
  if (!fromCoords || !toCoords) return null
  const straight = haversineKm(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng)
  if (straight < 5) return '< 15m'
  const roadKm = straight * 1.35
  const speed = roadKm < 60 ? 35 : roadKm < 200 ? 60 : 70
  const hours = roadKm / speed
  const h = Math.floor(hours)
  const m = Math.round(((hours - h) * 60) / 5) * 5
  if (h === 0) return `~${m}m`
  if (m === 0) return `~${h}h`
  return `~${h}h ${m}m`
}

export const DEPARTURE_CITIES = [
  { id: 'Accra',       coords: { lat: 5.6037,  lng: -0.1870 } },
  { id: 'Kumasi',      coords: { lat: 6.6885,  lng: -1.6244 } },
  { id: 'Cape Coast',  coords: { lat: 5.1054,  lng: -1.2466 } },
  { id: 'Takoradi',    coords: { lat: 4.8845,  lng: -1.7554 } },
  { id: 'Ho',          coords: { lat: 6.6010,  lng:  0.4712 } },
  { id: 'Sunyani',     coords: { lat: 7.3349,  lng: -2.3284 } },
  { id: 'Tamale',      coords: { lat: 9.4034,  lng: -0.8424 } },
  { id: 'Bolgatanga',  coords: { lat: 10.7856, lng: -0.8519 } },
  { id: 'Wa',          coords: { lat: 10.0601, lng: -2.5099 } },
]
