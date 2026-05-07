# 🌿 Scrap Marketplace

A full-stack web application built with **Next.js 16 (App Router)** and **Firebase**, designed for the Bangladesh market. Users submit scrap listings, admins connect them with verified dealers — primarily via phone.

---

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | Firebase Firestore |
| Auth | Firebase Auth + session cookies |
| Storage | Firebase Storage |
| Styling | Tailwind CSS |
| i18n | next-intl 4 (English + Bengali) |
| Forms | React Hook Form + Zod validation |

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── [locale]/            # Frontend pages (en / bn)
│   │   ├── page.tsx         # Home
│   │   ├── submit/          # Submit scrap listing
│   │   ├── dashboard/       # User dashboard
│   │   ├── login/
│   │   └── register/
│   ├── actions/             # Next.js Server Actions
│   │   ├── auth.ts
│   │   └── listings.ts
│   └── api/
│       └── media/           # Image upload endpoint
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
│   ├── firebase.ts          # Firebase client SDK
│   ├── firebase-admin.ts    # Firebase Admin SDK
│   ├── navigation.ts        # next-intl locale-aware Link / router
│   └── utils.ts
└── proxy.ts                 # Auth guard + i18n locale routing
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- Firebase project with Auth, Firestore, and Storage enabled
- npm ≥ 10

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd scrapper_listing

npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Firebase client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin SDK — generate from Firebase Console → Project Settings → Service Accounts
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# App URL
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### 3. Run the development server

```bash
npm run dev
```

App available at **http://localhost:3000**.

---

## 🔐 Auth & Roles

| Role | Capabilities |
|---|---|
| `user` | Register, submit listings, view own listings |
| `admin` | Manage listings via Firebase Console, assign dealers, change status |

Firebase Auth ID tokens are exchanged for a server-side `session` httpOnly cookie. Middleware protects `/dashboard` and `/submit`.

---

## 📱 i18n – English & Bengali

The app supports two languages:

| Locale | URL | Language |
|---|---|---|
| `en` (default) | `/`, `/submit`, `/dashboard` | English |
| `bn` | `/bn/`, `/bn/submit`, `/bn/dashboard` | বাংলা |

A locale switcher in the header lets users switch between languages. All UI strings are in `src/i18n/messages/`.

---

## 🗄️ Firestore Collections

### `users`
- `name`, `email`, `phone`, `role`, `createdAt`

### `listings`
- `title`, `type`, `weight`, `description`, `location`
- `phone` ★ (primary contact for Bangladesh customers)
- `images` (up to 5, stored in Firebase Storage)
- `status` (pending → connected → completed / rejected)
- `userId` (reference to user)

---

## 🔄 Workflow

```
User registers / logs in
       ↓
Submits scrap listing (status: pending)
       ↓
Admin reviews in Firebase Console / custom admin page
       ↓
Admin assigns dealer → status: connected
       ↓
Admin / dealer contacts user via phone
       ↓
Deal completed → status: completed
```

---

## 🛠️ Admin Operations

Manage listings and users directly via the **Firebase Console** (Firestore database view) or build a custom admin page.

---

## 📦 Production Build

```bash
pnpm build
pnpm start
```

### Environment for production

```env
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_API_KEY=...
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="..."
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
