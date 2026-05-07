# ScrapBD — AI Reference Document

> **Purpose:** This file is the authoritative reference for AI agents (GitHub Copilot, Cursor, Claude, etc.) working on this codebase. It captures business context, MVP scope, architecture decisions, and the launch plan so any AI can contribute meaningfully without repeating discovery work.

---

## 1. What This App Is

**ScrapBD** is a Bangladesh-focused scrap trading marketplace. Households and small businesses submit scrap listings online; a platform admin reviews them, assigns a registered dealer, and the deal is closed by phone call. The platform's tagline is **"Turn Your Scrap Into Cash."**

- **Market:** Bangladesh only (BD phone validation enforced; Bengali + English i18n)
- **Model:** Admin-mediated matchmaking — no direct user-to-dealer chat
- **Phase:** Pre-launch MVP

---

## 2. Tech Stack (Quick Reference)

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | Firebase Firestore |
| Auth | Firebase Auth + Admin session cookies (httpOnly, 7-day) |
| Storage | Firebase Storage (images, 5 MB cap) |
| Styling | Tailwind CSS |
| i18n | next-intl v4 — `en` + `bn` |
| Forms | React Hook Form + Zod |
| Language | TypeScript throughout |
| Infra | Firebase (no Docker / local DB required) |

Key file locations:
- Server actions: `src/app/actions/`
- Firebase client init: `src/lib/firebase.ts`
- Firebase Admin SDK: `src/lib/firebase-admin.ts`
- Media upload API: `src/app/api/media/route.ts`
- i18n strings: `src/i18n/messages/`
- Routing helpers: `src/lib/navigation.ts`

---

## 3. Data Models (Firestore Collections)

### `users/{uid}`
| Field | Type | Notes |
|---|---|---|
| name | string | required |
| email | string | from Firebase Auth |
| phone | string | required; BD format `^(\+880\|880\|0)1[3-9]\d{8}$` |
| role | string | `user` (default) \| `admin` |
| createdAt | ISO string | set on registration |

### `listings/{id}`
| Field | Type | Notes |
|---|---|---|
| title | string | required |
| type | string | `metal \| plastic \| electronics \| paper \| glass \| other` |
| weight | number | kg, min 0.1 |
| description | string | optional |
| phone | string | BD format; required |
| location | string | thana / district |
| images | `{url: string}[]` | optional; up to 5; stored as Firebase Storage URLs |
| status | string | `pending` → `connected` → `completed \| rejected`; admin-only change |
| assignedDealer | map | `{name, phone}` set by admin; optional |
| adminNotes | string | admin-only |
| userId | string | Firebase Auth UID of submitter |
| createdAt | Timestamp | Firestore server timestamp |

### `dealers/{id}`
| Field | Type | Notes |
|---|---|---|
| name | string | required |
| phone / altPhone | string | required |
| address | string | required |
| area | string | service thana/district |
| materialsAccepted | string[] | mirrors listing `type` options |
| isActive | boolean | inactive dealers excluded from assignment |
| notes | string | internal |

---

## 4. Core Workflows

```
User registers → auto-login → submit listing (pending)
                                        ↓
                              Admin reviews in Payload admin UI
                                        ↓
                   Admin assigns dealer + sets status → connected
                                        ↓
                        Dealer calls user, deal done → completed
                                        (or rejected)
```

**Access control summary:**
- Users see only their own listings
- Only admins can change `status`, assign dealers, or read `adminNotes`
- Admin role cannot be self-assigned by any user

---

## 5. MVP — What Must Be Done Before Launch

The following items are the minimum requirements for the business to operate and generate its first transactions:

### 5.1 Core Product (Must Have)
- [x] User registration & login with BD phone validation
- [x] Submit scrap listing form (type, weight, location, photos)
- [x] User dashboard showing own listings and their status
- [x] Payload admin panel for managing listings and dealers
- [x] Dealer management (add / deactivate dealers)
- [x] Admin workflow: review → assign dealer → update status
- [x] Bengali + English i18n
- [ ] **Status notification to user** — Email or SMS when listing moves to `connected` (user must know a dealer will call them)
- [ ] **Basic SEO** — `<title>`, `description`, Open Graph meta per page
- [ ] **Error pages** — proper 404 and error boundaries
      - [ ] **Production environment config** — Firebase Admin credentials + `NEXT_PUBLIC_SERVER_URL` in `.env.production`
      - [ ] **Production hosting** — deploy to Vercel (recommended); Firebase project already cloud-hosted
- [ ] **Domain & SSL** — public `.com.bd` or `.bd` domain with HTTPS
- [ ] **Admin account created** — first admin user seeded or created manually before removing public registration (or lock `role: admin` creation behind invite)
- [ ] **Legal pages** — Privacy Policy and Terms of Service (required for user data collection in BD)

### 5.2 Operational (Must Have Before Taking Real Users)
- [ ] At least **5–10 verified dealers** entered into the system across Dhaka/Chittagong before launch so incoming listings can be fulfilled
- [ ] Define **response SLA** — how fast admin reviews a listing and connects a dealer (target: same business day)
- [ ] **Admin notification** — alert the admin (email/Telegram/WhatsApp) when a new listing is submitted so they don't have to poll the panel
- [ ] Internal playbook: what admin does when no dealer covers the listing's area or materials

### 5.3 Nice to Have (Post-MVP)
- [ ] Dealer-facing portal (dealers log in, see their assigned listings)
- [ ] Real-time price guide per scrap type (per kg rates)
- [ ] User listing edit / delete (currently no UI exists)
- [ ] Push/SMS notifications via SSL Commerz / Twilio / bKash SMS
- [ ] Analytics dashboard (listings per day, conversion rate, popular materials)
- [ ] Dealer rating by user after deal is completed
- [ ] Photo compression on the client before upload

---

## 6. Marketing & Initial Launch Plan

### 6.1 Positioning
- **Primary message:** "Sell your scrap from home. We find you a buyer and they come to you."
- **Value prop for users:** No haggling, no searching — one form, one call.
- **Differentiator:** Bilingual (Bangla-first), mobile-friendly, free to use.

### 6.2 Target Segments (Priority Order)
1. **Urban housewives / families** in Dhaka, Chittagong — have accumulated metal, paper, old electronics
2. **Small shops & offices** — regular source of cardboard, plastic, e-waste
3. **Construction sites / workshops** — heavy metal scrap (high value per deal)

### 6.3 Pre-Launch Checklist
- [ ] Recruit and verify 10+ dealers in at least 2 cities (Dhaka, Chittagong)
- [ ] Create 10–20 demo listings (real ones from friends/family) to seed credibility
- [ ] Produce 2–3 short Bangla-language explainer videos (TikTok / Facebook Reels format)
- [ ] Set up Facebook Page + Facebook Group ("ScrapBD Community")
- [ ] Build WhatsApp Business number for support queries
- [ ] Prepare a simple press kit (logo, screenshots, one-liner)

### 6.4 Launch Channels (Week 1–4)

| Channel | Tactic | Cost |
|---|---|---|
| Facebook Ads | Geo-targeted to Dhaka/CTG; "কত টাকা পাবেন?" (How much will you get?) creative | Low budget ৳500–1000/day |
| Facebook Groups | Post in local buy/sell groups, neighbourhood groups | Free |
| TikTok / Reels | Short videos: "See how much I got for my old fridge" | Free (organic) |
| WhatsApp / Telegram | Share link in family & community groups | Free |
| Dealer word-of-mouth | Ask registered dealers to refer users — they benefit from more leads | Free |
| Local microinfluencers | 1–2 Bangladeshi lifestyle/household creators | Nominal fee |

### 6.5 Growth Metrics to Track Week 1
- Number of listings submitted
- Listing → Connected conversion rate (target: >60%)
- Connected → Completed conversion rate (target: >40%)
- User registration to listing submission rate
- Bounce rate on landing page

### 6.6 Post-Launch Iteration (Month 1–3)
- If conversion rate is low → interview 5 users to find friction
- If dealers can't fulfill → expand dealer network before scaling ads
- If Bengali UI has issues → user test with non-tech Bangla speakers
- Add scrap price estimates per kg once you have enough data to publish

---

## 7. Known Technical Debt & Risks

| Item | Risk | Priority |
|---|---|---|
| Stats on homepage are hard-coded (500+ listings, 50+ dealers) | Misleads users before real numbers match | Fix before launch |
| No email/SMS notification to user on status change | Users don't know to expect a call → friction, missed deals | High |
| No rate limiting on listing submission | Spam/abuse possible | Medium |
| Admin notification on new listing is absent | Admin must manually poll the panel | High |
| No user ability to edit or delete own listing | User frustration | Low (post-MVP) |
| Role assignment has no invite/approval flow | First admin must be created via Firebase Console → Authentication → set custom claim or set `role: admin` in Firestore | Document the procedure |
| Images stored in Firebase Storage | Public read is enabled via `makePublic()`; ensure Storage rules are set appropriately before launch | Review before production |

---

## 8. Environment Variables Required

```env
# Firebase client (safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin SDK — generate from Firebase Console → Project Settings → Service Accounts
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=     # include full -----BEGIN/END PRIVATE KEY-----; \n as literal \n

NEXT_PUBLIC_SERVER_URL=         # https://yourdomain.com.bd

# Optional (add when implementing notifications)
RESEND_API_KEY=                 # or SMTP credentials for email
SMS_API_KEY=                    # e.g. SSL Wireless or Twilio for BD SMS
```

---

## 9. Coding Conventions (for AI agents)

- **Locale-aware links:** Always use `Link` from `@/lib/navigation` (wraps next-intl), not `next/link`
- **Server actions** live in `src/app/actions/`; they use `adminDb` / `adminAuth` from `@/lib/firebase-admin` and verify the `session` httpOnly cookie
- **Auth helper:** call `getCurrentUser()` from `@/app/actions/auth` (or inline `getSessionUser()`) in any server action that needs the logged-in user
- **Phone validation regex:** `^(\+880|880|0)1[3-9]\d{8}$` — use this consistently for any new BD phone field
- **i18n strings:** Never hardcode user-visible text; add keys to both `en.json` and `bn.json`
- **Access control:** Verify session cookie in every server action; role checks done against the `users` Firestore doc
- **Status flow:** `pending → connected → completed | rejected` — do not skip states
- **Image uploads:** POST multipart to `/api/media`; returns `{ id: url, url }`; store as `images: [{url}]` in Firestore
- **Admin operations:** Manage listings/dealers directly via Firebase Console or build a custom admin page; no Payload admin panel
- **Session cookie name:** `session` (httpOnly, 7-day Firebase session cookie)

---

*Last updated: May 2026*
