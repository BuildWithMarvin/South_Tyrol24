# South Tyrol Digital Advent Calendar

A modern, ad-free web application in a "Modern Alpine Boutique" aesthetic featuring 24 winter destinations, landmarks, and stories from South Tyrol.

## Why I Built This
I originally created this project as a personal, zero-budget Christmas gift for my grandfather (Opa). Instead of a store-bought chocolate calendar or cluttered apps full of ads and paywalls, I wanted to give him something thoughtful, calm, and easy to read on a smartphone—a small daily window into the mountains and villages of South Tyrol leading up to Christmas Eve.

## Features
- **24 Daily Doors:** Sequential unlocking from December 1st to 24th with `localStorage` progress tracking and a secret preview mode (`?preview=`).
- **Senior-Friendly & Accessible:** High-contrast typography, clean layout, and simple one-tap navigation without clutter.
- **Multi-Language Support:** Fully localized in German (`DE`), Italian (`IT`), English (`EN`), and Chinese (`ZH`).
- **Location Details & Maps:** High-resolution photography with proper artist attribution and embedded Google Maps views.
- **Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, deployed on Vercel.

## Local Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and configure your environment variables (`PREVIEW_SECRET`, and optionally `NEXT_PUBLIC_BUYMEACOFFEE_URL` and `NEXT_PUBLIC_PAYPAL_URL`):
   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
