import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { properties, getTagClass, TYPES } from '../data/properties'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// 'best' = peak dry season, 'good' = shoulder, 'wet' = rainy season, 'harmattan' = dry/hazy harmattan
const REGION_DATA = [
  {
    id: 'Greater Accra',
    label: 'Greater Accra',
    emoji: '🌆',
    color: 'bg-vibe-blue',
    tagline: 'The capital, the coast, the chaos — all in one.',
    description: "Accra doesn't sleep. By day it's Labadi Beach, the Bojo lagoon, and the fishing villages of Ada — by night it's rooftop bars in East Legon and bonfire sessions at Kokrobite. The stretch from Accra to Ada Foah is Ghana's most accessible coastal escape.",
    highlights: ['Labadi Beach', 'Kokrobite', 'Ada Estuary', 'Bojo Beach'],
    bestTime: 'Nov–Feb & Jul–Aug',
    weather: ['best','best','good','wet','wet','wet','good','best','wet','wet','good','best'],
    tips: ['Book Ada Foah Easter weekend months ahead','Kokrobite is a 45-min tro-tro from Kaneshie','Avoid Labadi on public holidays — it gets packed'],
  },
  {
    id: 'Eastern',
    label: 'Eastern Region',
    emoji: '⛰️',
    color: 'bg-amber-700',
    tagline: 'Waterfalls, mountains, and butterfly forests.',
    description: "Boti Falls plunges 30m into an emerald pool. Aburi's botanical gardens sit in cool highland mist. The Volta River snakes through Akosombo. Eastern Region is where Accra people go when they need to breathe — close enough for a weekend, wild enough to feel like an escape.",
    highlights: ['Boti Falls', 'Aburi Gardens', 'Akosombo Dam', 'Bunso Arboretum'],
    bestTime: 'Nov–Feb & Jul–Aug',
    weather: ['best','best','good','wet','wet','wet','good','best','wet','wet','good','best'],
    tips: ['Boti Falls is twin-falls in September — double the flow','Aburi temperature is 5°C cooler than Accra','Akosombo boat cruises run Friday–Sunday'],
  },
  {
    id: 'Volta',
    label: 'Volta Region',
    emoji: '🌊',
    color: 'bg-sky-600',
    tagline: "Ghana's most dramatic — waterfalls, lake, mountain.",
    description: "Wli Waterfall is West Africa's tallest. Mount Afadjato is Ghana's highest peak. Volta Lake is the world's largest artificial lake by surface area. The region packs extraordinary variety — from the misty Hohoe highlands to the flat, glassy Lake Volta. This is where Ghana's adventure crowd comes.",
    highlights: ['Wli Waterfall', 'Mount Afadjato', 'Volta Lake', 'Hohoe'],
    bestTime: 'Nov–Feb',
    weather: ['best','best','good','wet','wet','wet','wet','wet','wet','good','good','best'],
    tips: ['Wli hike is 45 mins each way — start early','The lake kayaking at Dodi Island is unmissable','Mt. Afadjato summit is best Jan–March for clear views'],
  },
  {
    id: 'Ashanti',
    label: 'Ashanti Region',
    emoji: '👑',
    color: 'bg-yellow-600',
    tagline: 'Cultural heartland — kente, gold, and Lake Bosomtwe.',
    description: "Ashanti is Ghana's cultural core — the seat of the Asante Kingdom, home to Lake Bosomtwe (a sacred meteorite crater lake), and the source of kente weaving villages that've existed for centuries. Kumasi's Central Market is one of West Africa's largest. If you want to understand Ghana, start here.",
    highlights: ['Lake Bosomtwe', 'Kumasi Market', 'Kente Villages', 'Manhyia Palace'],
    bestTime: 'Nov–Feb & Jul–Aug',
    weather: ['best','best','good','wet','wet','wet','good','best','wet','wet','good','best'],
    tips: ['Bosomtwe lake fishing is banned — but canoes allowed','Kente weaving villages: Bonwire is most accessible','Kumasi Art Centre for craft shopping, not touristy prices'],
  },
  {
    id: 'Western',
    label: 'Western Region',
    emoji: '🏄',
    color: 'bg-teal-600',
    tagline: 'The surf coast — Busua, Nzulezu, and raw Ghana vibes.',
    description: "Busua has the best surf in Ghana — consistent beach break, a backpacker scene, and cold Club Beers at sunset. Nzulezu is an entire village built on stilts in a lagoon. Green Turtle Lodge is Ghana's original eco-retreat. The Western Region takes longer to reach but rewards you for the effort.",
    highlights: ['Busua Beach', 'Nzulezu Stilt Village', 'Green Turtle Lodge', 'Dixcove'],
    bestTime: 'Nov–Feb',
    weather: ['best','best','good','wet','wet','wet','wet','wet','wet','wet','good','best'],
    tips: ['Western has the longest rainy season — book Nov–Feb','Surf lessons at Busua from GHS 120','Nzulezu village tour requires a guide — GHS 50–80'],
  },
  {
    id: 'Central',
    label: 'Central Region',
    emoji: '🏰',
    color: 'bg-orange-700',
    tagline: 'History, castles, and canopy walks over rainforest.',
    description: "Cape Coast and Elmina Castles are UNESCO World Heritage Sites — haunting, necessary, unforgettable. Kakum National Park's canopy walk strings 350m of rope bridges through primary rainforest 30m above the ground. Hans Cottage Botel has crocodiles at lunch. Central Region is Ghana's most visited region for good reason.",
    highlights: ['Cape Coast Castle', 'Kakum Canopy Walk', 'Elmina Castle', 'Hans Cottage'],
    bestTime: 'Nov–Feb & Jul–Aug',
    weather: ['best','best','good','wet','wet','good','good','best','wet','wet','good','best'],
    tips: ['Cape Coast Castle tours run hourly — book morning slots','Kakum canopy walk requires advance booking on weekends','Elmina is smaller but more emotionally impactful than Cape Coast'],
  },
  {
    id: 'Northern',
    label: 'Northern Region',
    emoji: '🐘',
    color: 'bg-green-700',
    tagline: 'Mole elephants, Larabanga mosque, and wide open savanna.',
    description: "Mole National Park is Ghana's largest — and home to West Africa's largest elephant population. You can walk with elephants at dawn on a guided safari. Larabanga Mosque dates to the 14th century and is one of West Africa's oldest. Tamale has the best fufu in Ghana, full stop.",
    highlights: ['Mole National Park', 'Larabanga Mosque', 'Tamale', 'Damongo'],
    bestTime: 'Nov–Apr',
    weather: ['best','best','best','good','good','wet','wet','wet','wet','good','best','best'],
    tips: ['Book Mole lodge months ahead for dry season','Walking safaris at 6:30am before heat sets in','Harmattan haze December–February can limit visibility'],
  },
  {
    id: 'Upper East',
    label: 'Upper East',
    emoji: '🐊',
    color: 'bg-red-700',
    tagline: 'Sacred crocodiles, ancient mud architecture, market culture.',
    description: "Paga Crocodile Pond is one of Ghana's most surreal experiences — sacred crocodiles that let villagers sit on them. Bolgatanga's weekly market is a riot of colour, baskets, and smoked fish. Navrongo Cathedral blends colonial architecture with local mud-brick tradition. The Upper East rewards slow travel.",
    highlights: ['Paga Croc Pond', 'Bolgatanga Market', 'Navrongo', 'Tongo Hills'],
    bestTime: 'Oct–Apr',
    weather: ['best','best','best','good','good','good','wet','wet','good','best','best','best'],
    tips: ['Paga crocodile experience: sit on the sacred croc (with guide)','Bolgatanga market is Friday — build your trip around it','Harmattan winds in Dec-Jan are dusty but skies are dramatic'],
  },
  {
    id: 'Upper West',
    label: 'Upper West',
    emoji: '🌅',
    color: 'bg-purple-700',
    tagline: "Ghana's last frontier — hippos, savanna, zero crowds.",
    description: "Wechiau Hippo Sanctuary is one of the best hippo encounters in West Africa — canoe at dusk and you'll hear them before you see them. Wa's palace complex is 300 years old. Nkoranza has traditional festivals that draw the whole community. Upper West is for travellers, not tourists.",
    highlights: ['Wechiau Hippos', 'Wa Palace', 'Tumu', 'Lawra'],
    bestTime: 'Nov–Apr',
    weather: ['best','best','best','good','good','wet','wet','wet','wet','good','best','best'],
    tips: ['Wechiau hippo canoe trip is best at dusk or dawn','Combine with Mole for a northern Ghana loop','Accommodation is basic — book guesthouses ahead'],
  },
  {
    id: 'Savannah',
    label: 'Savannah Region',
    emoji: '🦒',
    color: 'bg-lime-700',
    tagline: 'Mole elephants, Larabanga mosque, and wide open plains.',
    description: "Created in 2019 from the former Northern Region, Savannah is home to Mole National Park — Ghana's largest protected area and the best place in West Africa to walk with elephants at dawn. Larabanga Mosque, one of the oldest in West Africa, sits just outside the park gates. The Gonja people's heartland stretches across this vast, beautiful region.",
    highlights: ['Mole National Park', 'Larabanga Mosque', 'Damongo', 'Salaga'],
    bestTime: 'Nov–Apr',
    weather: ['best','best','best','good','good','wet','wet','wet','wet','good','best','best'],
    tips: ['Book Mole lodge months ahead for peak dry season','Walking safaris start at 6:30am — worth the early rise','Salaga slave market is a sobering but important historical site'],
  },
  {
    id: 'Oti',
    label: 'Oti Region',
    emoji: '🌿',
    color: 'bg-emerald-700',
    tagline: 'Forested hills and Volta tributaries — off the beaten track.',
    description: "One of Ghana's newest regions (2019), Oti was carved from the former Volta Region. It covers the forested hills and river valleys north of Hohoe, stretching to the Togo border. The Kpandai area is the gateway — a quiet, unhurried corner of Ghana that rewards those who make the trip.",
    highlights: ['Kpandai', 'Nkwanta Hills', 'Oti River', 'Dambai'],
    bestTime: 'Nov–Feb',
    weather: ['best','best','good','wet','wet','wet','wet','wet','wet','good','good','best'],
    tips: ['Roads to Nkwanta can be rough — a 4WD is recommended in rainy season','Combine with Volta Region highlights in Hohoe','Very few tourists — a genuine off-the-beaten-path experience'],
  },
  {
    id: 'Western North',
    label: 'Western North',
    emoji: '🪵',
    color: 'bg-stone-600',
    tagline: 'Cocoa country, gold mines, and untouched forest reserves.',
    description: "Separated from the Western Region in 2019, Western North is dominated by lush forest reserves, cocoa and rubber plantations, and the gold-mining towns of Bibiani and Sefwi Wiawso. Less visited than coastal Western Region, it offers a quieter, more authentic glimpse of Ghana's interior forest belt.",
    highlights: ['Sefwi Wiawso', 'Bibiani Gold Town', 'Bia Conservation Area', 'Aowin'],
    bestTime: 'Nov–Feb',
    weather: ['best','best','good','wet','wet','wet','wet','wet','wet','wet','good','best'],
    tips: ['Bia Conservation Area has chimpanzees — guided forest walks available','Roads improve significantly in dry season','Sefwi Wiawso market is best on weekends'],
  },
  {
    id: 'Bono',
    label: 'Bono Region',
    emoji: '🌾',
    color: 'bg-yellow-700',
    tagline: 'Sunyani, festivals, and the cocoa heartland.',
    description: "Formerly the western half of the old Brong-Ahafo Region, Bono takes its name from the ancient Bono Kingdom — one of the oldest Akan states. The regional capital Sunyani is a relaxed, tree-lined city. Dormaa near the Côte d'Ivoire border has a vibrant yam and kola nut market culture.",
    highlights: ['Sunyani', 'Dormaa', 'Wenchi', 'Berekum'],
    bestTime: 'Nov–Feb & Jul–Aug',
    weather: ['best','best','good','wet','wet','wet','good','best','wet','wet','good','best'],
    tips: ['Sunyani is a pleasant base for exploring the region','Dormaa festival season is September–November','Roads are generally good throughout the region'],
  },
  {
    id: 'Bono East',
    label: 'Bono East Region',
    emoji: '🐒',
    color: 'bg-orange-600',
    tagline: 'Kintampo Falls, monkey sanctuaries, and Techiman market.',
    description: "Bono East covers the central middle belt of Ghana. Kintampo Falls is one of the most dramatic waterfalls in the country — wide, thundering, and hidden behind jungle. Boabeng-Fiema Monkey Sanctuary protects sacred black-and-white colobus monkeys that walk freely through the village.",
    highlights: ['Kintampo Falls', 'Boabeng-Fiema Monkey Sanctuary', 'Techiman Market', 'Atebubu'],
    bestTime: 'Nov–Feb & Jul–Aug',
    weather: ['best','best','good','wet','wet','wet','good','best','wet','wet','good','best'],
    tips: ['Kintampo Falls: swim in the pools below the main cascade','Boabeng-Fiema monkeys are habituated — they approach visitors','Techiman has one of Ghana\'s largest weekly markets (Monday)'],
  },
  {
    id: 'Ahafo',
    label: 'Ahafo Region',
    emoji: '🌳',
    color: 'bg-green-800',
    tagline: "Ghana's quiet forest interior — cocoa and conservation.",
    description: "Ahafo — meaning 'people of the forest' — is one of Ghana's newest and least-visited regions. Carved from the old Brong-Ahafo, it covers deep forest territory southwest of Kumasi. The Tano Sacred Grove near Techiman protects ancient trees and wildlife. Goaso is the unhurried regional capital.",
    highlights: ['Goaso', 'Tano Sacred Grove', 'Kenyasi', 'Bechem'],
    bestTime: 'Nov–Feb',
    weather: ['best','best','good','wet','wet','wet','wet','wet','wet','wet','good','best'],
    tips: ['Tano Sacred Grove is one of Ghana\'s most serene nature experiences','Forest roads can be challenging in the rainy season','Combine with a Kumasi or Western trip for a broader loop'],
  },
  {
    id: 'North East',
    label: 'North East Region',
    emoji: '🏇',
    color: 'bg-red-800',
    tagline: 'Ancient kingdoms, horse festivals, and open grasslands.',
    description: "The North East was split from Northern Region in 2019 and is centred on the ancient Mamprugu Kingdom. Nalerigu, the old royal capital, has a 13th-century palace. The Gambaga escarpment offers dramatic views across the savanna. Horse-mounted warriors remain a living tradition at the region's festivals.",
    highlights: ['Nalerigu Palace', 'Gambaga Escarpment', 'Bunkpurugu', 'Chereponi'],
    bestTime: 'Oct–Apr',
    weather: ['best','best','best','good','good','good','wet','wet','good','best','best','best'],
    tips: ['Nalerigu palace is open to respectful visitors — announce yourself','Gambaga is a 1-hour drive from Tamale — combine with a northern loop','Very few tourist facilities — bring supplies from Tamale'],
  },
]

const WEATHER_COLORS = {
  best:      { bg: 'bg-vibe-navy',   text: 'text-white', label: 'Peak' },
  good:      { bg: 'bg-vibe-yellow', text: 'text-vibe-navy', label: 'Good' },
  wet:       { bg: 'bg-sky-200',     text: 'text-sky-800', label: 'Rainy' },
  harmattan: { bg: 'bg-amber-100',   text: 'text-amber-800', label: 'Dry/Hazy' },
}

function WeatherCalendar({ weather }) {
  return (
    <div className="mt-4">
      <p className="font-body font-extrabold text-xs text-white/70 uppercase tracking-wider mb-2">Best time to visit</p>
      <div className="grid grid-cols-12 gap-0.5">
        {MONTHS.map((m, i) => {
          const type = weather[i] || 'good'
          const c = WEATHER_COLORS[type]
          return (
            <div key={m} className="flex flex-col items-center gap-0.5">
              <div className={`w-full h-6 rounded-sm ${c.bg} flex items-center justify-center`}>
                <span className={`font-body font-black text-[9px] ${c.text} leading-none`}>{m[0]}</span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-3 mt-2 flex-wrap">
        {Object.entries(WEATHER_COLORS).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1 font-body text-xs text-white/70">
            <span className={`w-3 h-3 rounded-sm inline-block ${v.bg}`}/>
            {v.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ExploreGhana() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedRegion = searchParams.get('region') || null
  const filterCity    = searchParams.get('city') || ''
  const filterType    = searchParams.get('type') || ''
  const visible       = Number(searchParams.get('show') || 11)

  const setSelectedRegion = (region) => setSearchParams(p => {
    const next = new URLSearchParams(p)
    if (region) { next.set('region', region); next.delete('city'); next.delete('type'); next.set('show', '11') }
    else { next.delete('region'); next.delete('city'); next.delete('type'); next.delete('show') }
    return next
  }, { replace: true })

  const setFilterCity = (city) => setSearchParams(p => {
    const next = new URLSearchParams(p)
    city ? next.set('city', city) : next.delete('city')
    next.set('show', '11')
    return next
  }, { replace: true })

  const setFilterType = (type) => setSearchParams(p => {
    const next = new URLSearchParams(p)
    type ? next.set('type', type) : next.delete('type')
    next.set('show', '11')
    return next
  }, { replace: true })

  const setVisible = (fn) => setSearchParams(p => {
    const next = new URLSearchParams(p)
    const current = Number(p.get('show') || 11)
    next.set('show', String(typeof fn === 'function' ? fn(current) : fn))
    return next
  }, { replace: true })

  const active = REGION_DATA.find(r => r.id === selectedRegion)

  const regionProperties = useMemo(() => {
    if (!selectedRegion) return []
    return properties.filter(p => {
      if (p.region !== selectedRegion) return false
      if (filterCity && p.city !== filterCity) return false
      if (filterType && p.type !== filterType) return false
      return true
    })
  }, [selectedRegion, filterCity, filterType])

  const cityOptions = useMemo(() => {
    if (!selectedRegion) return []
    const counts = {}
    properties.filter(p => p.region === selectedRegion).forEach(p => {
      if (p.city) counts[p.city] = (counts[p.city] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([c]) => c)
  }, [selectedRegion])

  const detailRef = useRef(null)

  useEffect(() => {
    if (selectedRegion && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedRegion])

  return (
    <div className="min-h-screen bg-vibe-red page-enter">
      {/* Header */}
      <div className="pt-28 pb-8 px-4 text-center">
        <p className="font-cursive text-vibe-yellow text-2xl mb-2">tap a region to explore</p>
        <h1 className="font-display text-5xl sm:text-6xl text-white uppercase leading-tight mb-4">
          GHANA BY REGION
        </h1>
        <p className="font-body font-bold text-white/70 max-w-md mx-auto">
          From the beaches of the West to the elephants of the North — Ghana has a vibe for everyone.
        </p>
      </div>

      {/* Region grid */}
      <section className="px-4 pb-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {REGION_DATA.map(r => {
            const count = properties.filter(p => p.region === r.id).length
            const isActive = selectedRegion === r.id
            return (
              <button key={r.id} onClick={() => setSelectedRegion(isActive ? null : r.id)}
                className={`region-card rounded-2xl border-2 border-vibe-navy p-5 text-left transition-all ${isActive ? `${r.color} shadow-card-hover` : 'bg-white shadow-card hover:bg-vibe-yellow'}`}>
                <span className="text-3xl block mb-2">{r.emoji}</span>
                <h3 className={`font-display text-base uppercase leading-tight mb-1 ${isActive ? 'text-white' : 'text-vibe-navy'}`}>{r.label}</h3>
                <p className={`font-body text-xs font-bold mb-1 leading-snug ${isActive ? 'text-white/80' : 'text-gray-500'}`}>{r.tagline}</p>
                <p className={`font-body text-xs mb-3 leading-snug ${isActive ? 'text-white/60' : 'text-gray-400'}`}>📅 Best: {r.bestTime}</p>
                <span className={`font-display text-xs px-2.5 py-1 rounded-full border border-vibe-navy ${isActive ? 'bg-white/20 text-white' : 'bg-vibe-navy text-white'}`}>
                  {count} spot{count !== 1 ? 's' : ''}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Region detail */}
      {selectedRegion && active && (
        <section ref={detailRef} className="px-4 pb-16 max-w-5xl mx-auto scroll-mt-24">
          <div className={`${active.color} rounded-2xl border-2 border-vibe-navy shadow-card p-6 mb-8`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-4xl">{active.emoji}</span>
                <h2 className="font-display text-3xl text-white uppercase mt-1">{active.label}</h2>
                <p className="font-cursive text-white/80 text-lg mt-0.5">{active.tagline}</p>
              </div>
              <button onClick={() => setSelectedRegion(null)}
                className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white font-bold transition-colors shrink-0">✕</button>
            </div>

            <p className="font-body font-bold text-white/90 mb-4 leading-relaxed">{active.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {active.highlights.map(h => (
                <span key={h} className="font-body text-xs font-bold bg-white/20 text-white px-3 py-1.5 rounded-full border border-white/30">
                  📍 {h}
                </span>
              ))}
            </div>

            {/* Insider tips */}
            {active.tips && (
              <div className="bg-white/10 rounded-xl p-4 mb-4 border border-white/20">
                <p className="font-body font-extrabold text-white text-xs uppercase tracking-wider mb-2">💡 Insider Tips</p>
                <ul className="space-y-1">
                  {active.tips.map((tip, i) => (
                    <li key={i} className="font-body text-xs text-white/85 flex items-start gap-2">
                      <span className="text-white/40 mt-0.5 shrink-0">—</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weather calendar */}
            <WeatherCalendar weather={active.weather} />
          </div>

          {properties.filter(p => p.region === selectedRegion).length > 0 ? (
            <>
              <p className="font-cursive text-vibe-yellow text-xl mb-4">spots in {active.label}</p>

              {/* Filter bar — no region selector */}
              <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-white rounded-2xl border-2 border-vibe-navy shadow-card">
                <div>
                  <label className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider block mb-1.5">City</label>
                  <select value={filterCity} onChange={e => setFilterCity(e.target.value)}
                    className="w-full border-2 border-vibe-navy rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-vibe-blue">
                    <option value="">All cities</option>
                    {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-body font-extrabold text-xs text-vibe-navy uppercase tracking-wider block mb-1.5">Type</label>
                  <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="w-full border-2 border-vibe-navy rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-vibe-blue">
                    <option value="">All types</option>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {regionProperties.length === 0 ? (
                <div className="text-center py-10">
                  <p className="font-display text-2xl text-white uppercase mb-3">No spots match</p>
                  <button onClick={() => setSearchParams(p => { const n = new URLSearchParams(p); n.delete('city'); n.delete('type'); n.set('show','11'); return n }, { replace: true })}
                    className="font-body font-bold text-sm text-vibe-navy bg-vibe-yellow px-5 py-2 rounded-full border-2 border-vibe-navy">
                    Clear filters
                  </button>
                </div>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {regionProperties.slice(0, visible).map(p => {
                  const img = p.image || p.images?.[0] || ''
                  const tags = p.tags || []
                  return (
                    <div key={p.id} className="property-card bg-white rounded-xl2 border-2 border-vibe-navy shadow-card overflow-hidden"
                      style={p.rotate ? { transform: `rotate(${p.rotate})` } : undefined}>
                      <Link to={`/property/${p.id}`}>
                        <div className="relative h-44 overflow-hidden border-b-2 border-vibe-navy">
                          <img src={img} alt={p.name} className="card-img w-full h-full object-cover" />
                          {p.priceGHS && p.priceTag && (
                            <span className={`absolute top-2 right-2 ${p.priceTag} font-display text-xs px-2 py-0.5 rounded-full border border-vibe-navy`}>
                              GHS {p.priceGHS.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-display text-base text-vibe-navy uppercase leading-tight mb-1">{p.name}</h3>
                          <p className="font-body text-xs text-vibe-blue font-bold uppercase tracking-wide mb-2">{p.city || p.district}</p>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {tags.slice(0, 2).map(tag => (
                              <span key={tag} className={`${getTagClass(tag)} font-body text-xs font-bold px-2 py-0.5 rounded-full`}>{tag}</span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-body text-xs text-gray-500">{p.type}</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )
                })}

                {/* See more card */}
                {visible < regionProperties.length && (
                  <button
                    onClick={() => setVisible(v => v + 9)}
                    className="bg-vibe-yellow rounded-xl2 border-2 border-vibe-navy shadow-card p-8 flex flex-col items-center justify-center text-center min-h-[280px] hover:bg-white transition-colors group">
                    <span className="font-display text-4xl mb-3 group-hover:scale-110 transition-transform block">+</span>
                    <p className="font-display text-xl text-vibe-navy uppercase leading-tight mb-1">See more</p>
                    <p className="font-body text-xs text-vibe-navy/60">
                      {regionProperties.length - visible} more spot{regionProperties.length - visible !== 1 ? 's' : ''}
                    </p>
                  </button>
                )}
              </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="font-display text-3xl text-white uppercase mb-3">More spots coming soon</p>
              <p className="font-body text-white/70">We're adding more locations to this region.</p>
            </div>
          )}
        </section>
      )}

      <footer className="bg-vibe-navy py-6 text-center mt-4">
        <p className="font-body font-bold text-white/60 text-sm">Getaway.gh — Discover Ghana © 2025</p>
      </footer>
    </div>
  )
}
