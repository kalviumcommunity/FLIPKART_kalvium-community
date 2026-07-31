# Flipkart — Smart Wishlist Management System

Next.js (App Router) + PostgreSQL implementation of the Smart Wishlist Management System
described in the PRD: automatic stock synchronization for wishlisted products every 30
seconds, optimistic "Move to Cart", and server-side stock validation before checkout.

## Stack

- **Next.js 14** (App Router, Server Components, Server Actions, Route Handlers)
- **NextAuth.js** — Credentials login + optional Google Sign-In
- **Prisma ORM** + **PostgreSQL**
- **Tailwind CSS**, **lucide-react** icons

## Getting started

1. **Install dependencies** (requires network access):
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Fill in `DATABASE_URL` with your PostgreSQL connection string and generate a
   `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`).

3. **Create the database schema**:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed sample data** (6 products, a demo customer, and an admin account):
   ```bash
   npm run prisma:seed
   ```
   - Demo customer login: `demo@flipkart.test` / `password123`
   - Admin login (visits `/admin`): `admin@flipkart.test` / `password123`

5. **Run the dev server**:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000.

## How the core feature works

- **`/wishlist`** is a Server Component that loads the user's wishlist once on
  navigation, then hands off to `WishlistClient` (Client Component).
- `WishlistClient` polls `GET /api/wishlist/sync` every 30 seconds
  (`NEXT_PUBLIC_WISHLIST_SYNC_INTERVAL_MS`). That endpoint returns stock/price only
  for the products in *that user's* wishlist — not the whole catalog — which is what
  keeps polling cheap (FR-17/FR-32).
- **Move to Cart** removes the card from the UI immediately (optimistic update),
  fires a toast, then calls the `moveToCartAction` Server Action, which re-validates
  stock inside a single Prisma transaction before writing to the cart. If stock ran
  out in the meantime, the item is restored to the wishlist and an error toast is shown.
- **Admin → Inventory Management** (`/admin`, ADMIN role only) lets you toggle stock or
  edit quantities; every change is written to `StockUpdateLog` and shown in "Recent
  Stock Updates," and instantly reflected the next time any user's wishlist polls.

## Project structure

```
prisma/schema.prisma       Database models (User, Product, Wishlist, CartItem, Order, StockUpdateLog)
prisma/seed.ts             Sample data
src/app/                   Routes (login, home, product/[id], wishlist, cart, profile, admin)
src/app/api/                Route handlers (NextAuth, wishlist stock sync)
src/lib/actions/            Server Actions (wishlist, cart, admin, auth)
src/lib/auth.ts             NextAuth configuration
src/lib/prisma.ts           Prisma client singleton
src/components/             UI components (Server + Client)
```

## Notes

- This was generated from a browser-only prototype (React + react-router + an
  in-memory store) and rewired onto Next.js App Router with a real Prisma/PostgreSQL
  backend, NextAuth sessions, and Server Actions in place of the client-only store.
- Payment/checkout, WebSocket-based stock push, and seller inventory APIs are out of
  scope for the MVP per the PRD (Section 11) — `PLACE ORDER` is currently a stub.


///comments added for commit check