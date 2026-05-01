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
| Framework | Next.js 15 (App Router, Turbopack) |
| CMS / Backend | Payload CMS v3 (co-located) |
| Database | MongoDB |
| Auth | Payload JWT (httpOnly cookie, 7-day) |
| Styling | Tailwind CSS |
| i18n | next-intl v4 — `en` + `bn` |
| Forms | React Hook Form + Zod |
| Images | Payload Upload + sharp (5 MB cap) |
| Language | TypeScript throughout |
| Infra | Docker Compose (local dev) |

Key file locations:
- Collections (data models): `src/collections/`
- Server actions: `src/app/actions/`
- i18n strings: `src/i18n/messages/`
- Routing helpers: `src/lib/navigation.ts`
- Payload config: `src/payload.config.ts`

---

## 3. Data Models (Collections)

### Users
| Field | Type | Notes |
|---|---|---|
| name | text | required |
| email | email | built-in |
| phone | text | required; BD format `^(\+880\|880\|0)1[3-9]\d{8}$` |
| role | select | `user` (default) \| `admin`; role cannot be self-assigned |

### ScrapListings
| Field | Type | Notes |
|---|---|---|
| title | text | required |
| type | select | `metal \| plastic \| electronics \| paper \| glass \| other` |
| weight | number | kg, min 0.1 |
| description | textarea | optional |
| phone | text | BD format; required |
| location | text | thana / district |
| images | upload[] | optional; up to 5 |
| status | select | `pending` → `connected` → `completed \| rejected`; admin-only change |
| assignedDealer | relation | → Dealers; admin-only |
| adminNotes | textarea | admin-only read/write |
| user | relation | → Users; auto-set on creation |

### Dealers
| Field | Type | Notes |
|---|---|---|
| name | text | required |
| phone / altPhone | text | required |
| address | text | required |
| area | text | service thana/district |
| materialsAccepted | multi-select | mirrors listing `type` options |
| isActive | checkbox | inactive dealers excluded from assignment |
| notes | textarea | internal |

### Media
Standard Payload upload collection. 5 MB file size limit.

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
- [ ] **Production environment config** — `PAYLOAD_SECRET`, `MONGODB_URI`, `NEXT_PUBLIC_SERVER_URL` in `.env.production`
- [ ] **Production Docker Compose or hosting** — deploy to a real server (Railway, DigitalOcean, Vercel + MongoDB Atlas, etc.)
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
| Role assignment has no invite/approval flow | First admin must be created via CLI or MongoDB directly | Document the procedure |
| Images stored on local filesystem by default | Will be lost on server restart/redeploy | Use cloud storage (S3/Cloudflare R2) in production |

---

## 8. Environment Variables Required

```env
# Payload / App
PAYLOAD_SECRET=           # strong random string, min 32 chars
MONGODB_URI=              # mongodb+srv://... (Atlas) or mongodb://mongo:27017/scrapbd (Docker)
NEXT_PUBLIC_SERVER_URL=   # https://yourdomain.com.bd

# Optional (add when implementing notifications)
RESEND_API_KEY=           # or SMTP credentials for email
SMS_API_KEY=              # e.g. SSL Wireless or Twilio for BD SMS
```

---

## 9. Coding Conventions (for AI agents)

- **Locale-aware links:** Always use `Link` from `@/lib/navigation` (wraps next-intl), not `next/link`
- **Server actions** live in `src/app/actions/`; they use `getPayload()` from `@/lib/payload` and `getLocale()` / `getTranslations()` from `next-intl/server`
- **Phone validation regex:** `^(\+880|880|0)1[3-9]\d{8}$` — use this consistently for any new BD phone field
- **i18n strings:** Never hardcode user-visible text; add keys to both `en.json` and `bn.json`
- **Access control:** Enforce at the Payload collection level, not only in UI
- **Status flow:** `pending → connected → completed | rejected` — do not skip states
- **Image uploads:** Use Payload's Media collection; reference by ID in other collections

---

*Last updated: April 2026*
