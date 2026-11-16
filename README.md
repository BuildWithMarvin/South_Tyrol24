# Südtirol Advent Calendar

Next.js App Router (TypeScript) Advent calendar with a responsive four-language
frontend (DE/IT/EN/ZH). Door content is served by a single route handler and
locked server-side until the matching December date, so unreleased places never
reach the client.

## Getting started

```bash
npm install
cp .env.example .env.local   # set PREVIEW_SECRET, optionally the support URLs
npm run dev
```

Open <http://localhost:3000> for the calendar and
<http://localhost:3000/api/days> for the raw API.

## Frontend

- Illustrated Dolomites night scene (SVG mountains, moon, stars) with
  Cormorant Garamond and DM Sans. The 24 doors are the windows of eight
  houses in a deliberately shuffled order, in 2 columns on phones and 4 from
  640px. Windows are locked, ready, today (pulsing) or opened; 6, 13 and 20
  show a candle flame and 24 a star. Opened doors are remembered in
  `localStorage["suedtirol-opened-doors"]`.
- Gentle CSS falling snow in three depth layers, static dots under
  `prefers-reduced-motion`.
- Localized UI and door content with a DE/IT/EN/ZH switcher persisted in
  `localStorage["suedtirol-lang"]` (default German).
- Accessible dark door modal (bottom sheet on phones, centered card from
  640px) with the photo, a link to the place in Google Maps, the photo
  credit and the description. It has a focus trap and closes with Esc or a
  backdrop click.
- To review locked doors before December, open
  `http://localhost:3000/?preview=<PREVIEW_SECRET>`; the page forwards the
  secret to `/api/days`.
- Set `NEXT_PUBLIC_BUYMEACOFFEE_URL` and/or `NEXT_PUBLIC_PAYPAL_URL` to show
  optional support buttons in the footer and at the bottom of every opened
  door (side by side when both are set). Leave a variable empty to hide its
  button. Restart the dev server after changing them.

## Tests

```bash
npm test          # Node test runner: calendar, masking, dataset, village, snow, i18n, route
npm run test:ui   # Vitest + Testing Library (jsdom) component tests
npm run test:e2e  # Playwright (Chromium), starts its own server on port 3100
npm run test:all  # all three suites
npm run typecheck # tsc --noEmit
npm run build     # production build
```

The node suite covers the Europe/Rome unlock schedule, the locked/unlocked
shape of `toPublicDay` (including that `imageCredit` never leaks), the
`/api/days` route handler (preview bypass, `no-store`), and the integrity of
`data/suedtirol.json` and `public/images` (24 doors in order, four locales,
existing image files, plausible coordinates and consistent credits/licenses).
The component and e2e suites cover the village, modal, snow, language
switcher, localStorage and responsive layout. The e2e suite needs a Playwright
browser (`npx playwright install chromium`) and a free port 3100.

## Endpoint

### `GET /api/days`

Returns an array of all 24 doors in calendar order.

```jsonc
// Unlocked door
{
  "day": 1,
  "slug": "drei-zinnen",
  "imageUrl": "/images/Day-01-LnCW0HTc.webp",
  "imageCredit": {
    "author": "Sebastian Knoll",
    "source": "Unsplash",
    "sourceUrl": "https://unsplash.com/de/@skenb",
    "license": "Unsplash License",
    "licenseUrl": "https://unsplash.com/license"
  },
  "location": {
    "name": "Drei Zinnen",
    "lat": 46.6186,
    "lng": 12.3055,
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=46.6186,12.3055"
  },
  "content": {
    "de": { "title": "Drei Zinnen", "region": "Sextner Dolomiten", "description": "…" },
    "it": { "title": "Tre Cime di Lavaredo", "region": "Dolomiti di Sesto", "description": "…" },
    "en": { "title": "Three Peaks", "region": "Sexten Dolomites", "description": "…" },
    "zh": { "title": "三峰山", "region": "塞斯托多洛米蒂", "description": "…" }
  },
  "isLocked": false
}

// Locked door — content, location, imageUrl and imageCredit are removed entirely
{ "day": 17, "isLocked": true }
```

Locking rules (evaluated in `Europe/Rome`, the South Tyrol time zone):

| Server date      | Unlocked doors              |
| ---------------- | --------------------------- |
| 1–24 December    | day 1 through today         |
| 25–31 December   | all 24                      |
| Any other month  | none                        |

The season resets each year, so refresh `data/suedtirol.json` for the next one.

### Preview bypass

```bash
curl "http://localhost:3000/api/days?preview=$PREVIEW_SECRET"
```

A matching `preview` query parameter returns all doors unlocked regardless of
the date. The comparison is constant-time and the response is sent with
`Cache-Control: no-store`. Keep the secret server-side: a query-string secret
can appear in access logs and browser history, so use this for internal review
only.

Response headers include `X-Calendar-Date`, `X-Calendar-Unlocked-Through` and
`X-Calendar-Preview`.

## Project layout

| Path                          | Purpose                                                   |
| ----------------------------- | --------------------------------------------------------- |
| `app/page.tsx`                | Calendar page: API fetch, state, hero, village, footer    |
| `app/components/`             | Village, scene, snow, door modal, support buttons, photo credit, language switcher |
| `app/calendar.module.css`     | Night scene, village, modal and snow styles               |
| `app/api/days/route.ts`       | GET handler, preview bypass, response masking             |
| `lib/i18n.ts`                 | UI copy, locale labels and date formatting                |
| `lib/masking.ts`              | `toPublicDay`, the locked/unlocked transformation         |
| `lib/types.ts`                | `DayData`, localized content and API response types       |
| `lib/calendar.ts`             | Europe/Rome date logic and unlock calculation             |
| `lib/village.ts`              | House layout, window order and today's door               |
| `lib/snow.ts`                 | Snowflake generator (injectable random source)                         |
| `data/suedtirol.json`         | 24 doors (content, coordinates and image paths)           |
| `public/images/`              | Door images, served at `/images/<filename>.webp`          |
| `tests/`                      | Node tests, `components/` (Vitest) and `e2e/` (Playwright) |

Door images are stored in `public/images` and referenced from
`data/suedtirol.json` with root-relative paths such as
`/images/Day-01-LnCW0HTc.webp`. No external image host is used.
