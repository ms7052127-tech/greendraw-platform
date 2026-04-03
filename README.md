<!-- # GreenDraw — Golf Charity Subscription Platform

> **Golf. Give. Win.** — A subscription platform combining golf performance tracking, monthly prize draws, and charitable giving.

## Live Demo
- **User login:** user@greendraw.com / GreenDraw123!
- **Admin login:** admin@greendraw.com / AdminGreen123!

## Features
- ✅ Stripe subscriptions (Monthly £9.99 / Yearly £89.99)
- ✅ Stableford score tracking (rolling 5-score system via DB trigger)
- ✅ Monthly prize draw (random + algorithmic modes)
- ✅ Jackpot rollover when no 5-match winner
- ✅ Charity selection (10–50% contribution)
- ✅ Winner verification + proof upload
- ✅ Full user dashboard + admin panel
- ✅ RLS-protected Supabase backend
- ✅ Mobile-first, emotion-driven UI

## Setup

### 1. Install
```bash
npm install
cp .env.example .env.local
# Fill in all values
```

### 2. Supabase
1. New project at supabase.com
2. SQL Editor → run `supabase/schema.sql` then `supabase/migrations.sql`
3. Copy URL + keys to .env.local

### 3. Stripe
1. Create two prices: Monthly £9.99, Yearly £89.99
2. Webhook: `https://your-domain.com/api/stripe/webhook`
3. Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
4. Copy price IDs + webhook secret to .env.local

### 4. Create Admin User
```sql
-- In Supabase SQL Editor after signing up:
UPDATE profiles SET role = 'admin' WHERE email = 'admin@greendraw.com';
```

### 5. Deploy to Vercel
1. Push to new GitHub repo
2. New Vercel account → import repo
3. Add all env vars
4. Deploy

## Project Structure
```
app/                  Next.js App Router pages
├── (auth)/login      Login page
├── (auth)/signup     Signup page
├── subscribe/        3-step subscription flow
├── charities/        Public charity directory
├── dashboard/        User dashboard (scores, draws, charity, subscription)
├── admin/            Admin panel (users, draws, charities, winners, analytics)
└── api/              API routes (Stripe, draws, scores, auth)
lib/
├── supabase/         Browser + server clients
├── stripe.ts         Stripe client
├── draw-engine.ts    Draw algorithms
└── utils.ts          Helpers
supabase/
├── schema.sql        Full DB schema
└── migrations.sql    Triggers, RPC functions, storage
``` -->
# GreenDraw — Golf Charity Subscription Platform

> **Golf. Give. Win.** — A subscription platform combining golf performance tracking, monthly prize draws, and charitable giving.

## Live Demo
- **User login:** user@greendraw.com / GreenDraw123!
- **Admin login:** admin@greendraw.com / AdminGreen123!

## Features
- ✅ Razorpay subscriptions (Monthly £9.99 / Yearly £89.99) — PCI DSS Compliant
- ✅ Stableford score tracking (rolling 5-score system via DB trigger)
- ✅ Monthly prize draw (random + algorithmic modes)
- ✅ Jackpot rollover when no 5-match winner
- ✅ Charity selection (10–50% contribution)
- ✅ Winner verification + proof upload
- ✅ Full user dashboard + admin panel
- ✅ Supabase backend (PostgreSQL + Auth + Storage)
- ✅ Mobile-first, emotion-driven UI

## Setup

### 1. Install
```bash
npm install
cp .env.example .env.local
# Fill in all values
```

### 2. Supabase
1. New project at supabase.com
2. SQL Editor → run `supabase/schema.sql` then `supabase/migrations.sql`
3. Copy URL + keys to .env.local

### 3. Razorpay (PCI-Compliant Payment Gateway)
1. Create account at razorpay.com
2. Get test keys: Dashboard → Settings → API Keys
3. Copy Key ID + Key Secret to .env.local

```env
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
```

### 4. Create Admin User
```sql
-- In Supabase SQL Editor after signing up:
UPDATE profiles SET role = 'admin' WHERE email = 'admin@greendraw.com';
```

### 5. Deploy to Vercel (New Account)
1. Push to new GitHub repo
2. New Vercel account → import repo
3. Add all env vars
4. Deploy

## Project Structure
```
app/                  Next.js App Router pages
├── (auth)/login      Login page
├── (auth)/signup     Signup page
├── subscribe/        3-step subscription flow (Razorpay)
├── charities/        Public charity directory
├── dashboard/        User dashboard (scores, draws, charity, subscription)
├── admin/            Admin panel (users, draws, charities, winners, analytics)
└── api/              API routes (Razorpay, draws, scores, auth)
lib/
├── supabase/         Browser + server clients
├── draw-engine.ts    Draw algorithms
└── utils.ts          Helpers
supabase/
├── schema.sql        Full DB schema
└── migrations.sql    Triggers, RPC functions, storage
```

## Payment Flow
1. User selects plan (Monthly £9.99 / Yearly £89.99)
2. User selects charity + contribution %
3. Razorpay checkout opens (PCI DSS compliant)
4. Payment verified server-side
5. Subscription activated in database
6. User redirected to dashboard

## Draw Engine
- **Random Mode:** Standard lottery-style 5 number draw
- **Algorithmic Mode:** Weighted by score frequency
- **Prize Tiers:** 5-match (40% Jackpot), 4-match (35%), 3-match (25%)
- **Jackpot Rollover:** No 5-match winner → jackpot carries to next month

## Tech Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Payments:** Razorpay (PCI DSS Compliant)
- **Deployment:** Vercel

Built for Digital Heroes Full-Stack Trainee Selection Process.