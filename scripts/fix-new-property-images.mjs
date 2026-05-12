// Fix broken image URLs in newly-added properties (IDs 597–679)
// Uses verified working Wikimedia Commons images from existing core properties
import { readFileSync, writeFileSync } from 'fs'

// Verified working image pools per region
const IMAGES = {
  Savannah: [
    'https://upload.wikimedia.org/wikipedia/commons/1/19/Mole_National_Park_%286%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/47/Mole_National_Park%2C_West_Gonja_%28P1100380-Pano%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/1b/MOLE_PARK_%283%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/6/60/Mole_National_Park%2C_West_Gonja_%28P1100410%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/de/Elephants_at_Mole_National_Park_01.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/70/Elephant_at_Mole_National_Park_03.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f9/Elephant_at_Mole_National_Park_02.jpg',
  ],
  Oti: [
    'https://upload.wikimedia.org/wikipedia/commons/5/58/Lake_Volta_07.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e0/Volta_River_Adomi.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/18/Agumatsa_Dorfkreuzung_2010_B002b.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/8/86/Wasserfall_-_panoramio_%286%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/98/Lower_Wli_Falls.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/a/a4/Lower_Wli.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/75/Wli_Falls01.jpg',
  ],
  'Western North': [
    'https://upload.wikimedia.org/wikipedia/commons/1/18/Agumatsa_Dorfkreuzung_2010_B002b.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/8/86/Wasserfall_-_panoramio_%286%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/98/Lower_Wli_Falls.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/a/a4/Lower_Wli.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/3d/Wli_Agumatse_Waterfall_aerial_view.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/2/25/Wli_Agumatse_Waterfall_%28Close_view%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/75/Wli_Falls01.jpg',
  ],
  'Bono East': [
    'https://upload.wikimedia.org/wikipedia/commons/e/e0/Volta_bridge_Atimpoku_Ghana.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/58/Lake_Volta_07.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e0/Volta_River_Adomi.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c4/Adome_Bridge%2C_Ghana.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/48/Adome_Bridge_2010.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/95/Adomi_Bridge%2C_Atimpoku_%28P1100005%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/a/ae/Akosombo_Dam_is_spilling_water%2C_Ghana.JPG',
  ],
  Ahafo: [
    'https://upload.wikimedia.org/wikipedia/commons/1/18/Agumatsa_Dorfkreuzung_2010_B002b.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/75/Wli_Falls01.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/2/23/Wli_waterfalls.JPG',
    'https://upload.wikimedia.org/wikipedia/commons/8/86/Wasserfall_-_panoramio_%286%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/98/Lower_Wli_Falls.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/a/a4/Lower_Wli.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/3d/Wli_Agumatse_Waterfall_aerial_view.jpg',
  ],
  'North East': [
    'https://upload.wikimedia.org/wikipedia/commons/4/47/Mole_National_Park%2C_West_Gonja_%28P1100380-Pano%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/19/Mole_National_Park_%286%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/1b/MOLE_PARK_%283%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/6/60/Mole_National_Park%2C_West_Gonja_%28P1100410%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e9/Tricycle_LIFAN_RY200ZH_Bolgatanga_2013_B003.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/a/a9/Mole_National_Park%2C_West_Gonja_%28P1100486%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/2/2e/Mole_National_Park%2C_West_Gonja_%28P1100405%29.jpg',
  ],
}

// Which properties belong to which region
const REGION_ID_RANGES = {
  Savannah:       [597, 605],
  Oti:            [606, 619],
  'Western North':[620, 634],
  'Bono East':    [635, 649],
  Ahafo:          [650, 664],
  'North East':   [665, 679],
}

const filePath = '/Users/mac/Documents/projects/getaway/src/data/google-properties.js'
let content = readFileSync(filePath, 'utf8')

let fixCount = 0

for (const [region, [startId, endId]] of Object.entries(REGION_ID_RANGES)) {
  const pool = IMAGES[region]
  let poolIdx = 0

  for (let id = startId; id <= endId; id++) {
    // Find the broken image pattern for this property
    // Pattern: images: ["https://upload.wikimedia.org/...broken-url..."]
    const brokenPatterns = [
      /("Ghana_rain_forest\.jpg[^"]*")/g,
      /("Tano_River_Ghana\.jpg[^"]*")/g,
      /("Gambaga_Escarpment\.jpg[^"]*")/g,
      /("Kintampo_Falls\.jpg[^"]*")/g,
    ]

    // Find this property block by id and replace its images array
    const propRegex = new RegExp(
      `(\\{[^{}]*"id":\\s*${id},[^{}]*"images":\\s*\\[)"([^"]+)"(\\])`,
      's'
    )
    const match = content.match(propRegex)
    if (match) {
      const img = pool[poolIdx % pool.length]
      poolIdx++
      const replacement = `${match[1]}"${img}"${match[3]}`
      content = content.replace(match[0], replacement)
      fixCount++
      console.log(`  ✓ ID ${id}: ${img.split('/').pop()}`)
    } else {
      console.warn(`  ✗ ID ${id}: property block not found`)
    }
  }
}

writeFileSync(filePath, content, 'utf8')
console.log(`\nDone — fixed images for ${fixCount} properties`)
