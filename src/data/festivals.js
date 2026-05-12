// Festivals and special occasions keyed by property ID.
// Each entry lists recurring annual events near that location.
// month: calendar month name(s) when the event occurs.

export const FESTIVALS = {
  // ── Eastern Region ──────────────────────────────────────────────────────────
  1: [ // Boti Falls Eco Lodge — Yilo Krobo
    { name: 'Krobo Dipo Festival', month: 'June', emoji: '💃', description: 'Coming-of-age rite of the Krobo people — colourful beads, drumming, and processions through the valley.' },
    { name: 'Kloyosikplem Harvest', month: 'November', emoji: '🌾', description: 'Yilo Krobo thanksgiving harvest — fresh palm wine, homecoming, and communal feasting.' },
    { name: 'Odwira Festival', month: 'October', emoji: '🥁', description: 'Akwapim and Krobo purification festival — ancestral rites, fresh yam eating, and street celebrations.' },
  ],
  9: [ // Aburi Mountain Retreat — Akuapem North
    { name: 'Odwira Festival', month: 'October', emoji: '🥁', description: 'The great Akuapem purification festival centred in Akropong — each town celebrates in turn over several weeks.' },
    { name: 'Akuapem Hiking Festival', month: 'January', emoji: '🥾', description: 'Annual community hike along the Akuapem ridge — one of the most scenic festival walks in Ghana.' },
    { name: 'Eastern Easter Camp', month: 'April', emoji: '⛺', description: 'Aburi Gardens becomes a hub for Easter campers, concerts, and outdoor markets across the long weekend.' },
  ],
  14: [ // Akosombo Riverside Lodge — Eastern
    { name: 'Volta Basin Festival', month: 'March', emoji: '⛵', description: 'Boat processions, fishing competitions, and lakeside concerts celebrating the Volta River communities.' },
    { name: 'Odwira', month: 'October', emoji: '🥁', description: 'Akyem and Akan communities along the Volta celebrate harvest with drumming and ancestral ceremonies.' },
  ],
  19: [ // Bunso Eco Forest — East Akim
    { name: 'Akyem Kotoku Festival', month: 'September', emoji: '🌳', description: 'Royal Akyem Kotoku traditional festival — durbar of chiefs, cultural displays, and forest thanksgiving.' },
    { name: 'Odwira', month: 'October', emoji: '🥁', description: 'East Akim communities celebrate Odwira with fresh yam, libations, and colourful processions.' },
  ],

  // ── Volta Region ─────────────────────────────────────────────────────────────
  2: [ // Wli Waterfall Retreat — Hohoe
    { name: 'Agbamevoza', month: 'September', emoji: '🎵', description: 'Ewe harvest and thanksgiving — the hills echo with kpanlogo drumming and volta dance performances.' },
    { name: 'Hogbetsotso Za', month: 'November', emoji: '⚓', description: 'Anlo Ewe migration festival (Anloga) — a colourful weekend of war dances, canoe races, and durbar.' },
    { name: 'Bafoem Kpodzi', month: 'December', emoji: '🌊', description: 'Hohoe homecoming festival — music, food, and a massive community gathering to close the year.' },
  ],
  10: [ // Volta Canopy Villa — Kpando
    { name: 'Agbamevoza', month: 'September', emoji: '🎵', description: 'Ewe communities along Lake Volta celebrate harvest with drumming and night-long celebrations.' },
    { name: 'Kpando Water Festival', month: 'April', emoji: '⛵', description: 'Fishing communities launch traditional dugout canoe races on the lake with festive music and food.' },
  ],
  16: [ // Volta Hills Eco Camp
    { name: 'Hogbetsotso Za', month: 'November', emoji: '⚓', description: 'One of Ghana\'s most spectacular festivals — Anlo Ewe migration commemoration with war dances and a grand durbar.' },
    { name: 'Volta Hills Music', month: 'December', emoji: '🎶', description: 'Open-air music and arts gathering in the Volta hills — local and regional artists, camping, and bonfire nights.' },
  ],

  // ── Greater Accra ────────────────────────────────────────────────────────────
  3: [ // Labadi Beach Hotel — La Dade-Kotopon
    { name: 'Homowo', month: 'August', emoji: '🥁', description: 'The Ga people\'s most sacred festival — "hooting at hunger." Families gather for kpokpoi (palm nut soup), drumming, and pouring of libations across Accra.' },
    { name: 'Chale Wote Street Art Festival', month: 'August', emoji: '🎨', description: 'Jamestown transforms into an open-air gallery — murals, performance art, afrobeats, and the wildest creative crowd in West Africa.' },
    { name: 'Afrochella / AFRONATION', month: 'December', emoji: '🎉', description: 'Year-end mega festivals drawing African diaspora home — world-class lineups, beachside vibes, and unmatched energy.' },
  ],
  11: [ // Kokrobite Beach Hideout
    { name: 'Homowo', month: 'August', emoji: '🥁', description: 'Ga harvest festival reaches Kokrobite with community feasting, drumming, and beach bonfires.' },
    { name: 'Kokrobite Carnival', month: 'December', emoji: '🎊', description: 'Annual New Year countdown on the beach — DJs, fire dancers, and the whole Accra crowd descending on the shore.' },
    { name: 'Big Milly\'s Friday Bonfire', month: 'Year-round', emoji: '🔥', description: 'Every Friday night at the legendary Big Milly\'s Backyard — fire dancers, beach drums, and Ghana\'s most famous backpacker gathering.' },
  ],
  15: [ // Ada Estuary Resort
    { name: 'Ada Foah Carnival', month: 'December – January', emoji: '🎆', description: 'Ghana\'s biggest beach festival runs through New Year — live concerts, boat rides on the estuary, water slides, and tens of thousands of revellers.' },
    { name: 'Homowo', month: 'August', emoji: '🥁', description: 'Ga communities around Ada celebrate with boat processions along the estuary and communal feasting.' },
  ],

  // ── Ashanti Region ───────────────────────────────────────────────────────────
  4: [ // Lake Bosomtwe Guesthouse
    { name: 'Akwasidae Festival', month: 'Every 6 weeks', emoji: '👑', description: 'Asante royal celebration at Manhyia Palace, Kumasi (30 min away) — chiefs in kente, fontomfrom drums, and the Asantehene holding court.' },
    { name: 'Apo / Odwira', month: 'October', emoji: '🥁', description: 'Asante harvest and purification — the lake village communities gather for ancestral rites and fresh yam celebration.' },
    { name: 'Asanteman Festival', month: 'October', emoji: '🏆', description: 'Grand reunion of the Asante nation — massive durbar, kente displays, and cultural pride on full show in Kumasi.' },
  ],

  // ── Central Region ───────────────────────────────────────────────────────────
  5: [ // Kakum Tree House — Central/Cape Coast adjacent
    { name: 'Bakatue', month: 'July', emoji: '🎣', description: 'Elmina\'s fishing festival — first Tuesday of July, the Benya Lagoon is opened for fishing with a royal canoe procession and gun salutes.' },
    { name: 'Fetu Afahye', month: 'September', emoji: '🎉', description: 'Cape Coast\'s biggest annual festival (first Saturday of September) — street processions, traditional dances, and a colourful durbar of chiefs.' },
    { name: 'PANAFEST', month: 'July – August', emoji: '✊', description: 'Pan African Historical Theatre Festival (biennial) — African diaspora homecoming, concerts, and heritage tours at the Cape Coast Castle.' },
    { name: 'Emancipation Day', month: 'August 1', emoji: '🕊️', description: 'National public holiday — candlelight ceremony at Assin Manso Slave River and wreath-laying at the Cape Coast Castle dungeons.' },
  ],
  13: [ // Cape Coast Castle View
    { name: 'Fetu Afahye', month: 'September', emoji: '🎉', description: 'Cape Coast\'s landmark festival (first Saturday of September) — the town centre fills with kente, drumming, and a grand durbar of Fante chiefs.' },
    { name: 'PANAFEST', month: 'July – August', emoji: '✊', description: 'One of Africa\'s most moving diaspora events — heritage walks through the castle dungeons, then outdoor concerts and community healing.' },
    { name: 'Emancipation Day', month: 'August 1', emoji: '🕊️', description: 'Ghana\'s most significant commemorative day — memorial services at the castle and Assin Manso Slave River, a solemn and powerful experience.' },
    { name: 'Bakatue', month: 'July', emoji: '🎣', description: 'Just 15 minutes away in Elmina — the lagoon-opening canoe procession is one of Ghana\'s most photogenic traditional events.' },
  ],

  // ── Western Region ───────────────────────────────────────────────────────────
  6: [ // Nzulezu Stilt Village — Jomoro
    { name: 'Kundum', month: 'August – October', emoji: '🌾', description: 'Nzema and Ahanta harvest festival — rotates through towns across Western Region with night drumming, feasting, and ancestral dances.' },
    { name: 'Nzema Mmarade', month: 'August', emoji: '🎊', description: 'Nzema homecoming — diaspora Nzema people return to the villages for a long weekend of music, food, and cultural pride.' },
  ],
  8: [ // Busua Beach House — Ahanta West
    { name: 'Kundum Festival', month: 'September – October', emoji: '🌾', description: 'Ahanta harvest festival celebrated in Busua and nearby towns — week-long drumming, community feasting, and street parades.' },
    { name: 'Dixcove Boat Festival', month: 'October', emoji: '⛵', description: 'Fishing community thanksgiving — decorated canoes parade offshore while crowds watch from the historic Dutch fort above.' },
  ],
  17: [ // Dixcove Beach Cottage
    { name: 'Kundum Festival', month: 'September – October', emoji: '🌾', description: 'Ahanta harvest festival — right in Dixcove with drumming processions past the Dutch Fort and beach bonfires.' },
    { name: 'Dixcove Boat Festival', month: 'October', emoji: '⛵', description: 'Decorated canoes parade along the cove — one of the most visually stunning local festivals on the coast.' },
    { name: 'Kakum Canopy Walk Anniversary', month: 'April', emoji: '🌳', description: 'Annual conservation event drawing eco-tourists to the Western Region with forest walks and wildlife talks.' },
  ],
  18: [ // Green Turtle Lodge — Ellembelle
    { name: 'Kundum', month: 'August – October', emoji: '🌾', description: 'The Nzema Kundum moves through Ellembelle District towns — the lodge gets transformed into a base for festival-goers.' },
    { name: 'Sea Turtle Nesting Season', month: 'October – February', emoji: '🐢', description: 'Olive ridley and leatherback turtles nest on the beach in front of the lodge — guided night watches are unforgettable.' },
  ],

  // ── Upper East Region ────────────────────────────────────────────────────────
  7: [ // Paga Crocodile Pond — Paga
    { name: 'Paga Nabie Festival', month: 'April', emoji: '🐊', description: 'Paga community festival honouring the sacred crocodiles — processions to the ponds with offerings and ancestral rites.' },
    { name: 'Fezoa Festival', month: 'November', emoji: '🥁', description: 'Kasena-Nankana harvest and warrior festival — war dances, guinea fowl feasting, and chief\'s durbar in traditional smock attire.' },
    { name: 'Bogobiri (Bawku)', month: 'July', emoji: '🏹', description: 'One of Upper East\'s biggest celebrations (30 min from Paga) — horse-mounted warriors, traditional archery, and a spectacular durbar.' },
  ],

  // ── Northern Region ──────────────────────────────────────────────────────────
  12: [ // Mole Safari Lodge — West Gonja
    { name: 'Damba Festival', month: 'Varies (Islamic calendar)', emoji: '🥁', description: 'Dagomba and Gonja royal festival — horse-riding warriors, royal drumming, and the chief\'s durbar in colourful northern smocks.' },
    { name: 'Bugum (Fire Festival)', month: 'Varies (Islamic calendar)', emoji: '🔥', description: 'Dagomba new year — the night sky over Damongo lights up with flaming torches as families chase away evil spirits.' },
    { name: 'Tamale Cultural Festival', month: 'October', emoji: '🎭', description: 'Northern Region arts and culture showcase — music, food, craft markets, and traditional dance competitions (1.5 hrs from Mole).' },
  ],
  20: [ // Tamale City Hostel
    { name: 'Damba Festival', month: 'Varies (Islamic calendar)', emoji: '🥁', description: 'Tamale\'s grandest tradition — mounted warriors in battle gear, royal drumming, and the Ya-Na (king) holding a massive open-air durbar.' },
    { name: 'Bugum (Fire Festival)', month: 'Varies (Islamic calendar)', emoji: '🔥', description: 'Dagomba new year celebration — the entire city takes to the streets with burning torches in a spectacular night procession.' },
    { name: 'Tamale International Cultural Festival', month: 'October', emoji: '🎭', description: 'Three-day arts festival celebrating northern Ghanaian culture — dance groups from 10+ ethnic groups, craft markets, and live music.' },
    { name: 'Eid al-Fitr & Eid al-Adha', month: 'Varies', emoji: '🌙', description: 'Tamale is Ghana\'s Muslim heartland — Eid celebrations here are extraordinary with morning prayers for 100,000+, feasting, and horse processions.' },
  ],
}

// Returns festivals for a given property id, or empty array if none.
export function getFestivals(id) {
  return FESTIVALS[id] || []
}

// ── National Festival Calendar ────────────────────────────────────────────────
// Major annual festivals with fixed 2026/2027 dates for the festival calendar page.

export const NATIONAL_FESTIVALS = [
  {
    id: 'bakatue',
    name: 'Bakatue Festival',
    region: 'Central',
    location: 'Elmina',
    date: '2026-07-07',
    displayDate: 'July 7, 2026',
    month: 7,
    emoji: '🎣',
    color: 'bg-blue-600',
    tagline: 'Opening of the fishing season',
    description: 'The Bakatue marks the start of the fishing season in Elmina. The Paramount Chief ritually opens the Benya Lagoon, followed by canoe races, drumming, and a massive community feast. One of the oldest coastal festivals in Ghana.',
    tips: ['Arrive early — the lagoon ceremony starts at dawn', 'Elmina Castle is steps away, combine both in one trip', 'Fresh grilled fish straight from the boats after the ceremony'],
  },
  {
    id: 'damba',
    name: 'Damba Festival',
    region: 'Northern',
    location: 'Tamale & Yendi',
    date: '2026-07-18',
    displayDate: 'July 2026',
    month: 7,
    emoji: '🐎',
    color: 'bg-amber-700',
    tagline: 'Dagomba & Gonja horse parade',
    description: 'Damba celebrates the birth and naming of the Prophet Muhammad and is observed by the Dagomba, Gonja, and Mamprusi peoples. Expect spectacular horse parades, royal drumming, traditional dances, and chiefs in full regalia.',
    tips: ['Yendi has the most elaborate ceremonies — worth the extra drive', 'Horse parades happen in the afternoon', 'Pair with a Mole National Park safari nearby'],
  },
  {
    id: 'chale-wote',
    name: 'Chale Wote Street Art Festival',
    region: 'Greater Accra',
    location: 'James Town, Accra',
    date: '2026-08-15',
    displayDate: 'August 2026',
    month: 8,
    emoji: '🎨',
    color: 'bg-purple-600',
    tagline: "Accra's wildest street art and culture week",
    description: "Chale Wote transforms the historic streets of James Town into a living gallery. Murals, performance art, skateboarding, Afrobeats stages, spoken word, and food trucks collide in one of West Africa's most electric events.",
    tips: ['Wear comfortable shoes — the entire neighbourhood is the venue', 'Best murals are in the backstreets off High Street', 'Evening performances at the beach are unmissable'],
  },
  {
    id: 'homowo',
    name: 'Homowo Festival',
    region: 'Greater Accra',
    location: 'Accra & surrounds',
    date: '2026-08-22',
    displayDate: 'August 2026',
    month: 8,
    emoji: '🍲',
    color: 'bg-orange-500',
    tagline: 'The Ga "hooting at hunger" harvest feast',
    description: "Homowo — meaning 'to hoot at hunger' — is the Ga people's harvest thanksgiving. Families reunite, palm nut soup (kpokpoi) is prepared in every home, and libations are poured for ancestors. A deeply communal celebration of abundance.",
    tips: ["You'll be invited to eat if you visit a Ga family — accept graciously", 'The festival spans multiple weeks across different Ga towns', "Avoid scheduling long drives out of Accra that weekend — roads are busy"],
  },
  {
    id: 'fetu-afahye',
    name: 'Fetu Afahye',
    region: 'Central',
    location: 'Cape Coast',
    date: '2026-09-05',
    displayDate: 'September 6, 2026',
    month: 9,
    emoji: '👑',
    color: 'bg-green-700',
    tagline: "Cape Coast's grand Fanti harvest festival",
    description: "Fetu Afahye is the annual thanksgiving of the Oguaa Fanti people. The Paramount Chief is carried in a palanquin through Cape Coast in full regalia, chiefs from surrounding areas converge, and traditional dances fill the streets for days.",
    tips: ['Book accommodation 2–3 weeks ahead — Cape Coast fills up fast', "The chief's procession through town is the main event — stake your spot early", 'Visit Cape Coast Castle the day before to set the historical context'],
  },
  {
    id: 'odwira',
    name: 'Odwira Festival',
    region: 'Ashanti',
    location: 'Kumasi & Akropong',
    date: '2026-09-25',
    displayDate: 'September / October 2026',
    month: 9,
    emoji: '🌽',
    color: 'bg-yellow-600',
    tagline: 'Ashanti purification and ancestor reverence',
    description: 'Odwira is the most sacred festival in the Akan calendar — a week of soul-cleansing, ancestor remembrance, and communal renewal. In Kumasi, the Asantehene holds open-air durbars with hundreds of sub-chiefs in gold regalia.',
    tips: ['The Kumasi Manhyia Palace durbar is the centrepiece — arrive early', 'Photography of the Asantehene requires prior permission', 'Akropong in Eastern Region holds a quieter, equally rich version'],
  },
  {
    id: 'kundum',
    name: 'Kundum Festival',
    region: 'Western',
    location: 'Axim & Busua area',
    date: '2026-10-10',
    displayDate: 'October – November 2026',
    month: 10,
    emoji: '🥁',
    color: 'bg-red-700',
    tagline: 'Nzema & Ahanta ancestral harvest celebration',
    description: 'Kundum is a rolling festival lasting up to eight weeks across Nzema and Ahanta towns in the Western Region. Marked by sacred drumming that must not stop, fire-lit processions, and offerings to ward off evil spirits before the harvest.',
    tips: ['Different towns hold Kundum on different weekends — check the local schedule', 'The drumming goes through the night — embrace it', 'Pair with a stay on the pristine beaches near Busua or Axim'],
  },
  {
    id: 'hogbetsotso',
    name: 'Hogbetsotso Festival',
    region: 'Volta',
    location: 'Anloga',
    date: '2026-11-07',
    displayDate: 'November 7, 2026',
    month: 11,
    emoji: '🌊',
    color: 'bg-teal-600',
    tagline: 'Anlo-Ewe unity and remembrance',
    description: "Hogbetsotso — 'the exodus from Notsie' — commemorates the Anlo-Ewe people's escape from oppression. Held annually in Anloga, it brings together Ewe communities worldwide for durbar, music, the sacred Atsiagbekor war dance, and a sea purification ceremony.",
    tips: ['The Atsiagbekor dance is one of the most dramatic traditional performances in Ghana', 'Keta Lagoon nearby is spectacular — combine with a boat trip', 'Book stays in Ho early as hotels fill across the Volta Region'],
  },
  {
    id: 'fire-festival',
    name: 'Bugum Fire Festival',
    region: 'Northern',
    location: 'Tamale & Dagbon',
    date: '2027-01-22',
    displayDate: 'January 2027',
    month: 1,
    emoji: '🔥',
    color: 'bg-orange-700',
    tagline: 'Dagomba fire-lighting ritual at dusk',
    description: "Bugum (the Fire Festival) marks the Islamic New Year for the Dagomba. After sunset, every household lights a torch and marches through town in a spectacular procession to drive away evil spirits, ending at the chief's palace.",
    tips: ['The procession starts at dusk — no need to rush there early', 'Whole families participate, including children with small torches', 'Tamale-based hotels fill up — book at least a month ahead'],
  },
]

export function getUpcomingFestivals(count = 3) {
  const today = new Date()
  const sorted = [...NATIONAL_FESTIVALS].sort((a, b) => new Date(a.date) - new Date(b.date))
  const upcoming = sorted.filter(f => new Date(f.date) >= today)
  return (upcoming.length >= count ? upcoming : sorted).slice(0, count)
}
