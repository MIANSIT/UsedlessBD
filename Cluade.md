# Cluade — Project Walkthrough

This document summarizes the `scrap-marketplace` project, its structure, important files, how to run it, and where key logic lives.

## Quick summary
- Framework: Next.js (React) application with TypeScript.
- Styling: Tailwind CSS.
- Backend integrations: Firebase (client and admin), server API routes for media handling.
- Purpose: A marketplace scrapper/listing app with localization and dashboard pages.

## Quick start
1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Build and start for production:

```bash
npm run build
npm run start
```

4. Helpful scripts (from `package.json`): `dev`, `build`, `start`, `lint`.

## High-level repo layout

- `package.json` — project metadata and scripts.
- `README.md` — project README (see for any additional notes).
- `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs` — framework and build configs.
- `public/media/` — static media assets.
- `src/` — main application source.

Inside `src/`:
- `proxy.ts` — proxy utilities (likely used for server-side requests to external scrapers or APIs).
- `app/` — Next.js App Router pages and layouts:
  - `globals.css`, `layout.tsx` — global layout and styles.
  - `[locale]/` — localized routes (per-locale layout and pages):
    - `dashboard/page.tsx` — user dashboard view.
    - `login/page.tsx`, `register/page.tsx` — auth pages.
    - `submit/page.tsx` — listing submission page.
- `actions/` — server actions or helper functions used by UI:
  - `auth.ts` — auth-related actions.
  - `listings.ts` — listing CRUD or scraping actions.
- `api/media/route.ts` — API route for handling media upload/processing (server-side).
- `components/` — UI components grouped by domain:
  - `auth/` — `LoginForm.tsx`, `RegisterForm.tsx`.
  - `dashboard/` — `ListingCard.tsx`.
  - `forms/` — `ScrapListingForm.tsx`.
  - `layout/` — `Footer.tsx`, `Header.tsx`.
  - `ui/` — small UI atoms: `Badge.tsx`, `Button.tsx`, `Input.tsx`, `LoadingSpinner.tsx`, `Select.tsx`, `Textarea.tsx`.
- `i18n/` — localization utilities and message catalogs:
  - `request.ts`, `routing.ts` and `messages/` with `bn.json`, `en.json`.
- `lib/` — shared libraries and integrations:
  - `firebase.ts` — client Firebase initialization.
  - `firebase-admin.ts` — server/admin Firebase initialization.
  - `navigation.ts`, `utils.ts` — helper utilities.

## Important dependencies and what they imply
- `firebase`, `firebase-admin` — both client and server Firebase usage (auth, storage, admin ops).
- `sharp` — image processing on server-side (likely used by `api/media/route.ts`).
- `next-intl` — internationalization with per-locale routing.
- `react-hook-form`, `zod`, `@hookform/resolvers` — form handling and validation.
- `tailwindcss`, `postcss`, `autoprefixer` — styling pipeline.

## Key places to look (by intent)
- Authentication: `src/actions/auth.ts`, `src/components/auth/*`, and `src/lib/firebase.ts`.
- Listing creation & scraping: `src/actions/listings.ts`, `src/forms/ScrapListingForm.tsx`, and `src/proxy.ts`.
- Media handling and optimization: `src/api/media/route.ts` and `public/media/` (server uses `sharp`).
- Layout and navigation: `src/app/layout.tsx`, `src/layout/Header.tsx`, `src/layout/Footer.tsx`, `src/lib/navigation.ts`.
- Localization: `src/i18n/*` and `src/app/[locale]/` routes.

## Notes about running / environment
- Ensure Firebase credentials for both client and admin are available in environment variables expected by `src/lib/firebase.ts` and `src/lib/firebase-admin.ts` (check those files for exact env var names).
- If the project uploads or processes images, make sure any server platform supports native modules required by `sharp` (install build tools or use the prebuilt binaries compatible with your Node version).

## Testing and linting
- Lint: `npm run lint` (uses the `next` ESLint config).
- There are no explicit test scripts in `package.json` — tests would need to be added.

## Maintenance tips and next steps
- Add a CONTRIBUTING or DEVELOPER.md describing env vars required for Firebase and any storage buckets.
- Add basic unit/integration tests for `actions/` logic and API routes.
- Document image size/format expectations for `api/media/route.ts` and any rate-limits for external scrapers.

## Where to find things (quick links)
- `package.json` — [package.json](package.json)
- Root README — [README.md](README.md)
- App entry/layout — [src/app/layout.tsx](src/app/layout.tsx)
- Localized routes — [src/app/[locale]/](src/app/%5Blocale%5D/)
- API media route — [src/api/media/route.ts](src/api/media/route.ts)
- Firebase libs — [src/lib/firebase.ts](src/lib/firebase.ts), [src/lib/firebase-admin.ts](src/lib/firebase-admin.ts)

---

If you want, I can:
- Add a short `DEVELOPMENT.md` listing exact env vars and local emulator instructions.
- Run a quick scan of `src/lib/firebase*.ts` to extract required env var names and add them to the docs.

Created by Cluade.md generator.
