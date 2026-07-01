# Subdiu

Modern, minimal **subscription tracker**. Add your subscriptions, see your monthly & yearly spend at a glance, and never miss an upcoming payment.

## Tech stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Supabase** — Auth + Postgres with Row Level Security
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives)
- **Recharts** (charts), **Motion** (animations), **react-hook-form + zod**

## Features

- Email/password + Google/Apple (OAuth) authentication
- Dashboard: monthly/yearly totals, category breakdown, upcoming payments
- Full subscription CRUD with popular-service quick picker
- Search, filter & sort; dark / light / system theme
- Protected routes with session refresh via `proxy.ts`

## Getting started

### 1. Install

```bash
npm install
```

### 2. Set up the database

In the **Supabase SQL Editor**, run the schema in [`supabase/schema.sql`](supabase/schema.sql)
(tables, the `subscriptions_view`, RLS policies and triggers).

### 3. Environment variables

Copy the example and fill in your Supabase values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → **Publishable** key |

> The publishable key is public-safe — access is protected by RLS. Never use the secret key here.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new) (Next.js is auto-detected).
2. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables.
3. Deploy, then add your production URL to **Supabase → Authentication → URL Configuration**
   (Site URL + Redirect URLs) so OAuth and email confirmation links work in production.
