# 🛍️ Roshni — E-Commerce Platform Handover

## Project Overview
Premium women's fashion e-commerce (shoes, bags, accessories) for Bangladesh. Built with Next.js 16 + PostgreSQL.

---

## 🔗 Quick Links

| What | URL |
|------|-----|
| **Live Site** | https://roshni-ecommerce.vercel.app |
| **GitHub** | https://github.com/neloy559/roshni-ecommerce |
| **Admin Login** | https://roshni-ecommerce.vercel.app → Header → "Admin" |

---

## 🔐 Credentials (Dev/Staging Only)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@roshni.com` | `admin123` |
| **Test Customer** | `nusrat@example.com` | `customer123` |

---

## ⚙️ Tech Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui (Radix UI)
- **State:** Zustand (persisted) + TanStack React Query
- **Database:** PostgreSQL 16 via Prisma 6 ORM
- **Auth:** Custom email/phone + bcryptjs (no NextAuth)
- **Images:** Cloudinary CDN
- **Animations:** Framer Motion 12
- **Payments:** bKash/Nagad UI mock (not integrated)
- **Hosting:** Vercel (Next.js) + Railway (PostgreSQL only)

---

## 🏗️ Architecture

```
Browser → Vercel (Next.js API + Frontend) → Railway (PostgreSQL via TCP Proxy)
```

All API routes run inside Next.js on Vercel. Railway only hosts the database.

---

## ✅ What's Built (MVP Complete)

### Customer Pages (SPA on `/`)
- **Homepage** — Banner carousel, category grid, trending/new arrivals, testimonials, trust badges
- **Products** — 18 products × 3 categories (Shoes/Handbags/Accessories) + 9 subcategories. Filters, sort, grid view toggle
- **Product Detail** — Image zoom, size/color variants, size guide, tabs, share, related products
- **Cart** — Slide-over drawer + full page. Promo codes, shipping progress bar, savings banner
- **Checkout** — 3-step flow: Address → Payment (bKash/Nagad) → Review
- **Orders** — Success page with confetti. Order history with status badges
- **Auth** — Login/Register with email or phone
- **Account** — Profile editing, address management, order history
- **Wishlist** — Client-side (Zustand persist), quick view modal, recently viewed
- **Dark Mode** — System detection + toggle, full dark theme
- **WhatsApp** — Floating chat button
- **Cookie Consent** — Glassmorphism banner with localStorage
- **Search** — Live search with dropdown results in header
- **Back-to-Top** — Scroll progress ring animation

### Admin Dashboard
- Overview stats + charts
- Products CRUD
- Categories CRUD (hierarchical)
- Orders management
- Banners CRUD (drag reorder)
- Store settings

### Database (10 tables)
User, Category, Product, ProductVariant, CartItem, Order, Payment, Banner, PromoCode, StoreSetting

---

## ⚠️ Known Bugs & Issues

### High Priority
1. **Wishlist is client-side only** — Lost on localStorage clear or device switch. Needs backend API.
2. **WhatsApp number is placeholder** — `WhatsAppButton.tsx` needs real business number.
3. **No payment gateway** — bKash/Nagad is UI mock only. Needs SSLCommerz integration for real payments.
4. **No order confirmation emails** — `POST /api/orders` doesn't send any notification.
5. **`log: ['query']` enabled in production** — `db.ts` logs all SQL queries to stdout.

### Medium Priority
6. **No JWT/sessions** — Auth returns plain JSON stored in Zustand. No httpOnly cookies, no token refresh.
7. **No rate limiting** — All API routes unprotected.
8. **No API input validation** — Manual checks only, no Zod schemas on API inputs.
9. **Hard delete everywhere** — No soft delete (`deletedAt`) on any model.
10. **`ignoreBuildErrors: true`** — `next.config.ts` allows TS errors into production builds.
11. **Cloudinary URLs have duplicated paths** — `seed.ts` URLs work but have extra `/roshni/products/` segments.

### Low Priority
12. **No search API** — Search is client-side filtering of full product list.
13. **No product reviews/ratings** — Not in schema or UI.
14. **No per-page SEO metadata** — All pages share one layout metadata.
15. **No sitemap/robots.txt** — Poor crawler support.
16. **No error boundary** — Unhandled errors crash the whole SPA.

---

## 🗺️ Roadmap

### Phase 1: Production Ready (Now)
- [ ] SSLCommerz payment integration (real bKash/Nagad)
- [ ] Wishlist backend API
- [ ] Order confirmation emails
- [ ] Update WhatsApp number
- [ ] Remove query logging in production
- [ ] Enable TypeScript strict mode

### Phase 2: Security (Next)
- [ ] JWT auth with httpOnly cookies + refresh tokens
- [ ] Rate limiting
- [ ] Zod input validation on all API routes
- [ ] Soft delete implementation
- [ ] Audit logging

### Phase 3: Features (Soon)
- [ ] Full-text search API
- [ ] Product reviews & star ratings
- [ ] Order tracking timeline
- [ ] Product comparison
- [ ] Bengali language (i18n)
- [ ] SEO (JSON-LD, sitemap, per-page meta)

### Phase 4: Polish
- [ ] Sentry error monitoring
- [ ] Google Analytics
- [ ] Test suite (Vitest + Playwright)
- [ ] Next.js Image optimization
- [ ] Lighthouse performance audit

---

## 🗂️ Key Files

```
src/
├── app/page.tsx              ← SPA shell + routing
├── app/layout.tsx             ← Root layout + metadata
├── app/api/*                  ← All API routes (products, cart, orders, auth, admin...)
├── components/store/          ← Customer pages (HomePage, ProductsPage, CartPage, CheckoutPage...)
├── components/admin/          ← AdminDashboard
├── components/ui/             ← 40+ shadcn components
├── lib/store.ts               ← Zustand (600+ lines: cart, auth, UI, wishlist, dark mode)
└── lib/db.ts                  ← Prisma client singleton
prisma/schema.prisma           ← Database schema (10 models)
seed.ts                        ← Seed script (18 products, 2 users, banners, promo codes)
next.config.ts                 ← Build config
```

---

## 💻 Local Dev Setup

```bash
git clone https://github.com/neloy559/roshni-ecommerce.git
cd roshni-ecommerce
npm install
# Get DATABASE_URL from project owner (Railway TCP Proxy)
npx prisma generate
npm run dev
```

---

## 🚀 Deployment Commands

```bash
# Deploy frontend + API to Vercel
vercel --prod

# Reseed database (⚠️ erases all data)
railway run npx prisma db push --accept-data-loss
railway run npx tsx seed.ts
```

---

## 👤 Contact

**Owner:** F.S. Neloy — seyasbro@gmail.com
**GitHub:** https://github.com/neloy559
