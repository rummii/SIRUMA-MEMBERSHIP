# Siruma Highlands Beach Resort & Leisure Club

Membership & Operations Platform for Siruma Highlands Beach Resort & Leisure Club — built with **Next.js 16 (App Router)**, **Prisma ORM**, **PostgreSQL**, **Auth.js (NextAuth v5)**, **Tailwind CSS v4**, **qrcode.react**, and **@zxing/library**.

## Membership tiers

| | **PREMIUM** | **VIP** |
| --- | --- | --- |
| Membership fee | ₱100,000 | ₱150,000 |
| Accommodation discount | 20% | 30% |
| Complimentary stays | 3 nights / year | 5 nights / year |
| Complimentary entrance | Member + 4 guests | Member + 8 guests |
| Privilege credits | ₱20,000 | ₱35,000 |
| Priority booking | 30 days | 60 days (first priority) |
| Flexible check-in/out | +1 hour | +2 hours |
| Upgrades | Preferred member rates | Complimentary (subject to availability) |

Member numbers follow the `SHB-XXXXX` format (e.g. `SHB-00001`).

## Modules

- **Public site** — tier comparison and online application (`/register`).
- **Auth** — credentials login with bcrypt hashes, JWT sessions, and role-based routing:
  `MEMBER → /portal`, `STAFF`/`ADMIN → /desk`.
- **Member portal (`/portal`)** — silver digital membership card with QR token, credit wallet vs. tier allowance, free-night tracker, guest allowance, booking-window indicator, reservation history, and credit ledger.
- **Front desk (`/desk`)** — live QR camera scanner (`@zxing/library`) plus SHB-number lookup, instant member summary, privilege-deduction modal, and arrival/check-in validator that enforces guest quotas, complimentary-night balances, flexible hour limits, and VIP-only complimentary upgrades.
- **Admin (`/admin`)** — member directory with tier/status/search filters, manual card issuing, credit adjustments (top-up / refund / deduction with atomic balance guards), status and renewal controls, transaction audit trail, and reservation logs.

## Getting started

```bash
npm install
cp .env.example .env   # set DATABASE_URL and AUTH_SECRET
npx prisma db push     # create tables
npm run db:seed        # seed demo members and staff
npm run dev
```

Open http://localhost:3000.

### Seeded accounts

| Role      | Email               | Password        | Membership |
| --------- | ------------------- | --------------- | ---------- |
| Admin     | `admin@siruma.ph`   | `Admin123!`     | —          |
| Front desk| `frontdesk@siruma.ph` | `Frontdesk123!` | —        |
| Member    | `premium@siruma.ph` | `Member123!`    | PREMIUM · SHB-00001 |
| Member    | `vip@siruma.ph`     | `Member123!`    | VIP · SHB-00002 |

The VIP demo account includes a completed complimentary stay and cabana credit usage; the Premium account has an upcoming confirmed reservation.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:seed` | Seed demo members and staff |

## Deploying to Railway

1. Add a **PostgreSQL** service to your Railway project.
2. Deploy this repository as a service and set:
   - `DATABASE_URL` → `${{Postgres.DATABASE_URL}}`
   - `AUTH_SECRET` → `openssl rand -base64 32`
3. `npm install` triggers `prisma generate`; the build runs `next build`; `railway.json` runs `prisma db push` as the pre-deploy step.
4. Seed once with `railway run npm run db:seed`.

## Data model

- `User` — `id, name, email, passwordHash, role (MEMBER|STAFF|ADMIN), createdAt, updatedAt`
- `Membership` — `memberNumber (SHB-XXXXX), qrToken, tier (PREMIUM|VIP), validFrom, validUntil, creditBalance, complimentaryStayQuota/Used, freeGuestQuota, discountPercent, advanceBookingDays, status`
- `Transaction` — `type (CREDIT_DEDUCTION|REFUND|TOP_UP), amount, outlet (RESTAURANT|CABANA|ACTIVITIES|ENTRANCE|ROOM), note, processedByStaffId, createdAt`
- `Reservation` — `checkIn, checkOut, guestCount, isComplimentaryStay, discountApplied, upgradeStatus, earlyCheckinHours, lateCheckoutHours, status`

## Security notes

- Passwords are bcrypt-hashed (cost 12); sessions are signed JWTs.
- Credit deductions use conditional `updateMany` guards inside transactions to prevent overdrafts under concurrency.
- Complimentary-night redemption uses an atomic guard so two front-desk terminals cannot redeem the same nights.
- QR payloads carry an unguessable 24-byte token that is verified against the membership record.
- Never commit `.env`; configure secrets through Railway variables.

