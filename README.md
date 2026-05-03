# Getaway.gh — Your Next Ghana Adventure

Discover the best weekend escapes, beach fronts, mountain retreats, and hidden gems across Ghana. From Accra to Ada, from Boti to Busua — find your perfect getaway.

**[→ Live Demo](https://getaway-gh.vercel.app)**

![Getaway.gh Home](screenshots/home.png)

---

## Features

- **Curated listings** — beach fronts, mountain lodges, lakeside stays, nature retreats
- **Smart filters** — filter by region, type, group size, duration, and price
- **Activity tags** — find spots by vibe: beach, hiking, cultural, nightlife, and more
- **Trip Board** — save and plan your Ghana escape
- **Regions explorer** — browse destinations across Greater Accra, Volta, Western, and more
- **Editorial picks** — hand-curated properties from the Getaway team
- Responsive across mobile, tablet, and desktop

## Regions Explorer

![Getaway.gh Explore](screenshots/explore.png)

## Tech Stack

| Tool | Version |
|------|---------|
| [Vite](https://vitejs.dev) | 6 |
| [React](https://react.dev) | 18 |
| [React Router](https://reactrouter.com) | 6 |
| [Tailwind CSS](https://tailwindcss.com) | 3 |
| [Vercel](https://vercel.com) | — |

## Getting Started

```bash
# Clone the repo
git clone https://github.com/kamensgh/getaway-gh.git
cd getaway-gh

# Install dependencies (requires Node 20+)
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

> **Note:** Requires Node 20. If you use nvm: `nvm use 20`

## Project Structure

```
src/
├── components/
│   ├── ActivityFilter.jsx   # Multi-select activity tag filter
│   ├── HeroBanner.jsx       # Animated rotating tagline hero
│   ├── Navbar.jsx           # Pill-style fixed navbar
│   ├── PropertyCard.jsx     # Listing card with quick-save
│   └── SearchBar.jsx        # Location/keyword search
├── context/
│   └── TripBoardContext.jsx # Saved trips global state
├── data/
│   └── properties.js        # Listings data with regions & metadata
└── pages/
    ├── VibeHome.jsx          # Homepage with filters & listings grid
    ├── PropertyDetail.jsx    # Individual listing page
    ├── ExploreGhana.jsx      # Regions map & discovery
    └── TripBoard.jsx         # Saved trip planner
```

## Destinations

| Region | Highlights |
|--------|-----------|
| Greater Accra | Labadi Beach, Kokrobite, Coco Beach |
| Volta Region | Wli Waterfalls, Boti Falls, Volta Lake |
| Western Region | Busua Beach, Cape Three Points, Ankobra |
| Eastern Region | Aburi Botanical Gardens, Tetteh Quarshie Farm |
| Central Region | Cape Coast Castle, Elmina, Kakum Forest |

## Design

- **Colour palette** — coral red (`#E84422`), navy (`#0E1C40`), sunshine yellow (`#F5C842`)
- **Typography** — Black Han Sans (display) + Nunito (body)
- **Style** — bold, energetic, and playful — built to match Ghana's travel spirit

## License

MIT — free to use, fork, and build upon.

---

Built with ♥ for Ghana's travel community.
