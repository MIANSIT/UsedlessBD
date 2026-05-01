# 🌿 Scrap Marketplace

A full-stack web application built with **Next.js 16 (App Router)** and **Payload CMS v3**, designed for the Bangladesh market. Users submit scrap listings, admins connect them with verified dealers — primarily via phone.

---

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| CMS / Backend | Payload CMS v3 (local API, same codebase) |
| Database | MongoDB |
| Auth | Payload built-in JWT auth |
| Styling | Tailwind CSS |
| i18n | next-intl 4 (English + Bengali) |
| Forms | React Hook Form + Zod validation |

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── (payload)/           # Payload CMS admin + API routes
│   │   ├── admin/[[...segments]]/
│   │   └── api/[...slug]/
│   ├── [locale]/            # Frontend pages (en / bn)
│   │   ├── page.tsx         # Home
│   │   ├── submit/          # Submit scrap listing
│   │   ├── dashboard/       # User dashboard
│   │   ├── login/
│   │   └── register/
│   └── actions/             # Next.js Server Actions
│       ├── auth.ts
│       └── listings.ts
├── collections/             # Payload CMS collection configs
│   ├── Users.ts
│   ├── ScrapListings.ts
│   ├── Dealers.ts
│   └── Media.ts
├── components/
│   ├── auth/                # LoginForm, RegisterForm
│   ├── dashboard/           # ListingCard
│   ├── forms/               # ScrapListingForm
│   ├── layout/              # Header, Footer
│   └── ui/                  # Button, Input, Badge, etc.
├── i18n/
│   ├── messages/en.json
│   ├── messages/bn.json
│   ├── routing.ts
│   └── request.ts
├── lib/
│   ├── navigation.ts        # next-intl locale-aware Link / router
│   ├── payload.ts
│   └── utils.ts
├── proxy.ts                 # Auth guard + i18n locale routing (Next.js 16)
└── payload.config.ts        # Payload CMS configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- MongoDB running locally or a MongoDB Atlas URI
- npm ≥ 10

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd scrapper_listing

npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# MongoDB connection string
DATABASE_URI=mongodb://127.0.0.1:27017/scrap-marketplace

# Strong random secret (generate with: openssl rand -base64 32)
PAYLOAD_SECRET=your-super-secret-key

# App URL (used for media URLs and API calls)
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### 3. Start MongoDB

**Option A – Docker Compose (recommended, included)**

Make sure Docker Desktop is running, then:

```bash
docker compose up -d
```

**Option B – Homebrew (macOS)**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Option C – MongoDB Atlas (cloud)**

Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com) and set `DATABASE_URI` in `.env`.

### 4. Run the development server

```bash
npm run dev
```

App available at:
- **Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin

### 5. Create the first admin user

Open http://localhost:3000/admin — Payload will prompt you to create the first admin account on first launch.

After creating it, go to the Payload admin panel and change the user's `role` to **admin** (it defaults to `user`).

---

## 🔐 Auth & Roles

| Role | Capabilities |
|---|---|
| `user` | Register, submit listings, view own listings |
| `admin` | Full Payload admin panel, assign dealers, change status |

Payload's JWT token is stored as an `httpOnly` cookie (`payload-token`). Middleware protects `/dashboard` and `/submit`.

---

## 📱 i18n – English & Bengali

The app supports two languages:

| Locale | URL | Language |
|---|---|---|
| `en` (default) | `/`, `/submit`, `/dashboard` | English |
| `bn` | `/bn/`, `/bn/submit`, `/bn/dashboard` | বাংলা |

A locale switcher in the header lets users switch between languages. All UI strings are in `src/i18n/messages/`.

---

## 🗄️ Payload CMS Collections

### `users`
- `name`, `email`, `password` (auth), `phone`, `role`

### `scrap-listings`
- `title`, `type`, `weight`, `description`, `location`
- `phone` ★ (primary contact for Bangladesh customers)
- `images` (upload, up to 5)
- `status` (pending → connected → completed / rejected)
- `assignedDealer` (relationship → dealers)

### `dealers`
- `name`, `phone`, `altPhone`, `address`, `area`
- `materialsAccepted` (multi-select)
- `isActive`

### `media`
- Image uploads stored in `public/media/`
- Auto-generates `thumbnail` (400×300) and `card` (768×576) sizes

---

## 🔄 Workflow

```
User registers / logs in
       ↓
Submits scrap listing (status: pending)
       ↓
Admin reviews in Payload dashboard (/admin)
       ↓
Admin assigns dealer → status: connected
       ↓
Admin / dealer contacts user via phone
       ↓
Deal completed → status: completed
```

---

## 🛠️ Admin Operations

1. **Navigate to** http://localhost:3000/admin
2. **Manage listings** → filter by status, type, location
3. **Assign a dealer**: Open a listing → sidebar → select dealer → change status to `Connected`
4. **Add dealers**: Collections → Dealers → Create

---

## 📦 Production Build

```bash
pnpm build
pnpm start
```

### Environment for production

```env
NODE_ENV=production
DATABASE_URI=mongodb+srv://...your-atlas-uri...
PAYLOAD_SECRET=<strong-random-64-char-secret>
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com.bd
```

---

## 🌐 Planned Features (Roadmap)

- [ ] SMS notification via bKash / Twilio when dealer is assigned
- [ ] Price estimation by scrap type and weight
- [ ] Location-based dealer suggestions (Dhaka, Chittagong, Sylhet…)
- [ ] WhatsApp / in-app chat between user and dealer
- [ ] Admin analytics dashboard
- [ ] PWA support for mobile-first experience in Bangladesh

---

## 📌 Bangladesh-Specific Notes

- **Phone number** is the **primary contact method** — prominently shown in forms and listings
- Phone validation accepts **Bangladeshi mobile numbers** (01X-XXXXXXXXX format)
- Bengali (`bn`) locale is fully translated for all UI strings
- Default locale is English; Bengali accessible at `/bn/` prefix
- Ready for BD domains (`.com.bd`) and bKash payment integration

---

## 📄 License

MIT © Scrap Marketplace

---

*Built with ❤️ for Bangladesh's circular economy*
