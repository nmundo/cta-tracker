# CTA Tracker - AI Coding Agent Instructions

## Project Overview

CTA Tracker is a Svelte 5 + SvelteKit 2 web app for Chicago Transit Authority (CTA) real-time train arrival data. It's a learning project exploring Svelte fundamentals with a focus on simple, clean interactions around favorites management and station search.

**Core Purpose**: Display arrival times at a selected CTA station, manage favorites, and search stations with autocomplete.

## Architecture & Data Flow

### Frontend Stack

- **Framework**: SvelteKit 2 (full-stack) with Svelte 5 runes (`$state`, `$derived`, `$effect`)
- **Styling**: Tailwind CSS 4 + DaisyUI for UI components (cards, lists, buttons)
- **Deployment**: Static adapter (`@sveltejs/adapter-static`) → GitHub Pages with base path `/cta-tracker`

### Data Architecture

```
Remote API (trains.remote.ts)
    ├── getStations() → dummyData.js (StationStop[])
    └── getTrainTimes(mapId) → CTA API (TrainTrackerResponse)

Component Hierarchy
+layout.svelte (prerender enabled)
└── +page.svelte
    ├── SearchBar.svelte (station search with debounce + keyboard nav)
    ├── StationLogo.svelte (favorites tile, visual line indicators)
    └── train list display (destination, arrival time, line color)
```

### Key Data Types (in `app.d.ts` globals, not shown but inferred)

- `StationStop`: `{ map_id, station_descriptive_name, [line flags like "pnk", "red", "blue"] }`
- `TrainData`/`TrainTrackerResponse`: `{ eta: Array<{ staId, staNm, destNm, arrT, rt (line), stpDe, ... }>, errNm? }`
- `StationInfo` (favorites): `{ staId, staNm, lines: LineKey[] }`
- `LineKey`: Union of line codes: `"Red" | "Blue" | "Brn" | "G" | "Org" | "P" | "Pink" | "Y"`

## Critical Development Workflows

### Build & Deploy

```bash
npm run build     # Vite build → static site in build/
npm run dev       # Hot reload on localhost:5173
npm run deploy    # build + gh-pages push to gh-pages branch
npm run lint      # prettier + eslint (svelte-check too)
npm run check     # svelte-kit sync + svelte-check
```

### Remote Functions Pattern (SvelteKit Experimental)

`trains.remote.ts` uses SvelteKit's **experimental remote functions** (`query()` wrapper):

- `getStations()`: Async data fetch, **server-side only** (returns dummy data, not real API)
- `getTrainTimes(mapId)`: Async server function called from client via `$app/server`
- CTA API key injected via `$env/static/private` (TRAIN_API_KEY), **never exposed to client**
- **Key**: Remote functions execute on server; client calls them like normal async functions but they're isolated

### Type Safety & Checking

- **Strict TypeScript** enabled (`"strict": true`)
- Use `svelte-check` before commits; ESLint via Prettier integration
- Svelte 5 runes are properly typed; avoid older store patterns (`readable`, `writable`)

## Component Patterns

### SearchBar.svelte

- **Custom autocomplete** (no external autocomplete lib; `svelte-typeahead` is unused)
- **Debounce logic**: 200ms input delay to avoid excessive filtering
- **Keyboard navigation**: Arrow Up/Down to navigate, Enter to select, Escape to close
- **Styling**: Glass morphism design (backdrop-filter blur, specific pink/gray palette)
- **Props**: `data: StationStop[]`, `onSelect: (mapId: string) => void`
- When integrating SearchBar elsewhere, ensure data prop contains `station_descriptive_name` and `map_id`

### StationLogo.svelte

- **Visual design**: 100px×75px card with station letter + colored line bars
- **Props**: `staNm`, `lines: LineKey[]`, `changeStation: () => void`
- Hover effect uses 3D transform (`rotateX`, `rotateY`, `scale`)
- Displays line colors vertically by mapping `lines` to `LINES` constant hex values

### +page.svelte (Main Page)

- **Reactive patterns**: Uses `$state` for `mapId`, `trainData`, `favorites`, `loading`
- **Derived state**: `$derived` for `isFavorite()` — re-computes when `trainData` or `favorites` change
- **Side effects**: `$effect` for localStorage persistence and API calls
- **Local storage schema**: `localStorage['favorites']` = `JSON.stringify(StationInfo[])`
- **Layout scrolling**: Custom fade gradient logic for favorites scroll (showLeftFade, showRightFade)

## Important Conventions

### Remote API Calls

- Wrap data fetches in `trains.remote.ts` using the `query()` pattern
- Server-side only: CTA API integration, environment variable access
- Client cannot call fetch directly against CTA endpoints (key is private)
- Pattern: `export const functionName = query(async (params) => { ... })`

### Local Favorites Storage

- Read on mount: `browser && JSON.parse(localStorage.getItem('favorites') || '[]')`
- Write on change via `$effect`
- Do NOT use server-side store; favor client-side state + localStorage

### Line Colors

- All line colors defined in `src/lib/constants.ts` → `LINES` Record
- Use `LINES[lineKey].hex` for any color display
- Line keys match CTA API response `rt` field exactly (e.g., "Red", "Pink", "Brn", not "Brown")

### CSS & Styling

- Tailwind + DaisyUI classes for layout (card, bg-base-200, shadow-md, etc.)
- Custom Svelte `<style>` blocks for component-specific effects (glass morphism, animations)
- Responsive design assumed; test on mobile (e.g., full-width SearchBar)
- Icons embedded as inline SVGs, not external icon libraries

### Environment & Secrets

- `TRAIN_API_KEY` must be set in `.env.local` (not in Git)
- `PUBLIC_` prefix = exposed to browser; `PRIVATE_` prefix = server-only
- SvelteKit syntax: `import { TRAIN_API_KEY } from '$env/static/private'`

## Common Gotchas

1. **Remote Functions are Experimental**: If debugging data fetches, confirm `remoteFunctions: true` in `svelte.config.js`
2. **Base Path in Production**: App runs at `/cta-tracker/` on GitHub Pages; Vite config adjusts paths dynamically
3. **Favorites are Client-Side**: Clearing browser storage = losing favorites; no backend persistence
4. **Station Data is Dummy**: Real stations API endpoint commented out; replace with real API if needed
5. **Svelte 5 Syntax**: No `let x = $state()` in scripts with `$props()`; use destructuring instead
6. **CSS Custom Properties**: DaisyUI colors (e.g., `bg-base-200`) depend on default theme; dark mode may need adjustment

## Testing & Validation

- No test suite currently; use `npm run check:watch` for TypeScript/Svelte validation during development
- Manual testing in browser (F12 DevTools for Network, Console, localStorage inspection)
- Vite dev server: `npm run dev` with hot reload enabled

## Next Steps from TODO

- [ ] Real geolocation integration (get user's nearest station)
- [ ] Bus stops support
- [ ] Search/favorites UI refinement (delete button, drag-to-reorder?)
- [ ] Animations & a11y polish
- [ ] Station colors from dedicated API (not arrivals API)
- [ ] Dark mode fix for SearchBar
