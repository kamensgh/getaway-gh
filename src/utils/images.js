// Google Place Photo links are short-lived signed CDN URLs. The ones baked into
// src/data/google-images.js and google-properties.js by scripts/resolve-photo-urls.mjs
// have long since expired, so every lh3 /place-photos/ and /places/ URL now fails to
// load. Filter them out of the data and fall back to a local placeholder instead.
const DEAD_PATHS = ['/place-photos/', '/places/']

export const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23E84422'/%3E%3Cpath d='M0 210l90-70 70 55 80-95 160 120v80H0z' fill='%230E1C40' opacity='.25'/%3E%3Ccircle cx='312' cy='72' r='30' fill='%23FFD23F'/%3E%3Ctext x='200' y='168' text-anchor='middle' font-family='system-ui,sans-serif' font-size='22' font-weight='800' fill='%230E1C40'%3EPhoto coming soon%3C/text%3E%3C/svg%3E"

export function isUsableImage(url) {
  if (!url || typeof url !== 'string') return false
  return !DEAD_PATHS.some(p => url.includes('lh3.googleusercontent.com') && url.includes(p))
}

// Keeps the usable URLs of a list, in order, without duplicates.
export function usableImages(urls) {
  return [...new Set((urls || []).filter(isUsableImage))]
}

// Last line of defence: any image that still fails at runtime swaps to the placeholder.
export function onImgError(e) {
  const img = e.currentTarget
  if (img.dataset.fallback) return
  img.dataset.fallback = '1'
  img.src = PLACEHOLDER_IMG
}
