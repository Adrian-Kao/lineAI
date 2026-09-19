# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

萬春宮文化探索 DEMO — a LINE MINI App (LIFF) front end in React + Vite + plain JavaScript (no TypeScript). Players explore a Taiwan temple map, then complete three ordered tasks at a temple (數位蓋章 stamp → 找點拍照 photo → 拼圖 puzzle). Docs and UI strings are Traditional Chinese; keep new user-facing text and error messages in Traditional Chinese.

Two app directories exist:

- `app/` — **the active codebase.** All recent work (map, temple data, tests) lives here.
- `my-react-app/` — the original skeleton. `readme.md`, `docs/project-guide.md` and `requirement.txt` still reference it, but it is superseded by `app/`. Do not add features there.

## Commands

Run from `app/` (Node 24.x / npm 11.x required by `engines`):

```sh
npm ci                 # install (use ci, not install — lockfile is authoritative)
npm run dev            # Vite dev server
npm run lint           # eslint .
npm test               # node --test src/utils/*.test.js
node --test src/utils/districtGeometry.test.js   # single test file
npm run build          # vite build → dist/
npm run preview
npm run data:temples   # re-import temple POI snapshot (needs network, see below)
node scripts/prepare-map.mjs   # regenerate derived geo files (see below)
```

Tests use Node's built-in `node:test` + `node:assert/strict`; only files matching `src/utils/*.test.js` are picked up, so put new pure-logic tests there (or extend the glob in `package.json`).

`.env.local` (copied from `.env.example`) holds `VITE_LIFF_ID` / `VITE_AUTH_MODE`, read via `config/env.js`. The map pages (`/map`, `/map/:county`, `/temples/...`) work without a LIFF ID; only routes wrapped in `RequireReady` need a LINE session. Deploy target is Vercel with Root Directory=`app`, SPA fallback in `app/vercel.json` (excludes `/demo/` and `/assets/`).

## Architecture

### Layering rule (from docs/project-guide.md §4)

畫面 → Provider → 規則 → 儲存／平台服務. Pages only emit user actions; `GameProvider` validates and persists; `state/gameRules.js` and `features/puzzle/puzzleRules.js` are pure (no storage, no navigation); services never import from `features/`.

### Routing and session

- `src/app/router.jsx` — two layout groups: public pages (map, temple detail, placeholder pages) and `RequireReady`-guarded pages (temple tasks, mission, story, collection, stampbook). `RequireReady` redirects to `/entry?next=…` when `session.status !== 'ready'`.
- `src/app/EntryPage.jsx` → `services/line.js` (LIFF init/login/profile) → `GameProvider.initializeSession(profile)`, which hydrates progress from `localStorage` keyed by LINE `userId`.
- `ROUTES` constants live in `src/config/routes.js`; always reference them rather than string literals. Several routes (journal, stamps, points, news, settings, friends, profile) are still `PlaceholderPage`s.

### Game state

- `src/state/GameProvider.jsx` holds `session` (memory only) and `progress` (reducer + `progressStorage.js` localStorage snapshot). `completeTask(result)` is the single write path: validate via `gameRules.validateTaskResult`, reduce, **save first, then dispatch**. A `submittingRef` blocks concurrent submits.
- Every task returns the same shape: `{ taskId, completedAt, evidence: { kind, ... } }` (`stamp` → `mockTouchConfirmed`, `photo` → `mediaId`, `puzzle` → `tileOrder`). Task order/unlocking is derived from `TASKS` in `src/data/temple.js` — task status is never stored, always computed (`getTaskStatus`).
- Photos: Blob goes to IndexedDB (`mediaStorage.js`) before progress is saved; `image.js` handles compress/crop/compose.

### Map (the largest subsystem)

- `features/map/MapPage.jsx` orchestrates: URL `:county` param ↔ selected county, loads county temples + district boundaries, derives `regionProgress` / `completedTempleIds` from game state, and renders `TaiwanTempleMap.jsx`.
- `TaiwanTempleMap.jsx` is an imperative **Leaflet** wrapper (leaflet + leaflet.markercluster, NLSC EMAP tiles). It keeps callbacks/props in refs to avoid re-creating the map; district polygons are colored by `regionStatus.js` (`locked` grey / `inProgress` yellow / `unlocked` orange).
- `features/map/TaiwanMap.jsx` is an older **deck.gl** implementation that is no longer imported by anything (deck.gl deps remain in `package.json`).
- `regionStatus.js` contains a dev-only color preview (`MAP_COLOR_PREVIEW`, `setCountyColorPreview`, `setTempleLightPreview`) applied only when `import.meta.env.DEV`. It is used for manual visual checks — don't let it leak into real progress logic.
- Region codes: 5-digit `COUNTYCODE`, 8-digit `TOWNCODE` (county code + 3 digits). Keep them as strings (金門 `09020` / 連江 `09007` have leading zeros).
- County names: source data uses 臺; display uses 台. Convert with `utils/countyNames.js` (`toSourceCountyName` / `toDisplayCountyName`) at boundaries; never hand-write either form in comparisons. `mapConfig.js` (`CITY_COORDS`, `MAP_LIMITS`, `COUNTY_ZOOM`) is keyed by display names.

### Static data pipelines (`app/public/`, generated — don't hand-edit)

- **Temples** `public/data/temples/<縣市>.json` + `manifest.json`: produced by `scripts/import-temples.mjs` from kiang/religion `data/poi`. Only features with 類型=寺廟 and 教別=道教/佛教 pass `utils/normalizeTemple.js`; the runtime (`services/templeData.js`) reads the local snapshot only and filters by `manifest.files[].status === 'success'`.
- **Geo** `public/geo/`: source TopoJSON snapshots (`taiwan-counties-20200820`, `taiwan-districts-20230317`, MIT, see `public/geo/README.md`). `scripts/prepare-map.mjs` derives `taiwan-districts-overview.topo.json` (simplified, 368 features), `taiwan-county-borders.geo.json`, and one `districts/<TOWNCODE>.topo.json` per district (loaded lazily on selection). Loaders in `services/geoData.js` assert feature counts (22 counties / 368 districts) and cache promises.

### Content/asset constraints

- `public/demo/README.md`: real licensed images (`temple.jpg`, `photo-target.jpg`, `puzzle.jpg`, `stamp.png`) are still pending; `map.svg` is a layout placeholder, not a real map. Do not create blank placeholder images that pose as real assets.
- Temple detail pages must not invent history or imagery — `STORIES` in `src/data/temple.js` and `templeContentById` / `missionEnabledTempleIds` in `src/data/templeContent.js` are intentionally empty until sourced content is provided. Per-temple content is keyed by the source POI UUID; a temple only shows the 探索 button when its id is in `missionEnabledTempleIds`. `TempleArtwork.jsx` renders a labelled "圖片待補" placeholder instead of any image.
- Anything simulated (OTP, AI similarity, LINE POINTS, rewards) must be visibly labelled as DEMO/模擬 in the UI; never present it as a real service.

## Reference docs

- `docs/project-guide.md` — MVP scope tables, full user-journey/flow diagrams, data shapes, team split. Note its file tree/setup sections still say `my-react-app/`.
- `requirement.txt` — teammate install steps (PowerShell-oriented).
- `app/README.md` — current status of the map phase.
