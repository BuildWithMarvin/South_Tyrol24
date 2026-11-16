# Südtirol Advent Calendar

Next.js App Router (TypeScript) Advent calendar with a responsive four-language
frontend (DE/IT/EN/ZH). Door content is served by a single route handler and
locked server-side until the matching December date, so unreleased places never
reach the client.

## Getting started

```bash
npm install
cp .env.example .env.local   # set PREVIEW_SECRET
npm run dev
```

Open <http://localhost:3000> for the calendar and
<http://localhost:3000/api/days> for the raw API.

## Frontend

- Bright "Alpine Editorial & Bento" design (alabaster, terracotta and pine)
  with Plus Jakarta Sans and Instrument Serif, a bento grid and a centered
  finale card for day 24.
- 24-door grid (2 columns on phones, 4 on tablets, 6 on desktop) with locked,
  available and opened states. Opened doors are remembered in
  `localStorage["suedtirol-opened-doors"]`.
- Localized UI and door content with a DE/IT/EN/ZH switcher persisted in
  `localStorage["suedtirol-lang"]` (default German).
- Accessible door modal with the photo, its credit, the description, an
  embedded Google Map and a link to open the place in Google Maps.
- To review locked doors before December, open
  `http://localhost:3000/?preview=<PREVIEW_SECRET>`; the page forwards the
  secret to `/api/days`.
- Set `NEXT_PUBLIC_BUYMEACOFFEE_URL` to show optional support links in the
  footer and in every opened door. Leave it empty to hide them.

## Tests

```bash
npm test          # Node test runner: calendar, masking and dataset checks
npm run typecheck # tsc --noEmit
npm run build     # production build
```

The suite covers the Europe/Rome unlock schedule, the locked/unlocked shape of
`toPublicDay` (including that `imageCredit` never leaks), and the integrity of
`data/suedtirol.json` and `public/images` (24 doors in order, four locales,
existing image files, plausible coordinates and consistent credits/licenses).

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

| Path                          | Purpose                                              |
| ----------------------------- | ---------------------------------------------------- |
| `app/page.tsx`                | Calendar page: API fetch, state, grid and modal       |
| `app/components/`             | Door card, modal, photo credit and language switcher  |
| `app/calendar.module.css`     | Responsive calendar and modal styles                 |
| `app/api/days/route.ts`       | GET handler, preview bypass, response masking        |
| `lib/i18n.ts`                 | UI copy, locale labels and date formatting           |
| `lib/masking.ts`              | `toPublicDay`, the locked/unlocked transformation    |
| `lib/types.ts`                | `DayData`, localized content and API response types  |
| `lib/calendar.ts`             | Europe/Rome date logic and unlock calculation        |
| `data/suedtirol.json`         | 24 doors (content, coordinates and image paths)     |
| `public/images/`              | Door images, served at `/images/<filename>.webp`    |
| `tests/`                      | Node tests for calendar, masking and the dataset     |

Door images are stored in `public/images` and referenced from
`data/suedtirol.json` with root-relative paths such as
`/images/Day-01-LnCW0HTc.webp`. No external image host is used.
