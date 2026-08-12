# Finch — Personal Finance Manager

A personal finance / money manager web app: track income, expenses, accounts, and
categories, with a dashboard of KPIs and charts. Built with Next.js (App Router) and
Supabase (Postgres + Auth + Row Level Security).

This is **Phase 1** of a two-phase build. See [Scope & limitations](#scope--limitations)
for what's included now vs. planned for Phase 2.

## Tech stack

- **Frontend**: Next.js 16 (App Router, Turbopack), TypeScript, React 19, Tailwind CSS v4, shadcn/ui, lucide-react
- **Data/forms**: TanStack Query, React Hook Form, Zod, Recharts, date-fns
- **Backend**: Supabase (Postgres, Auth, Row Level Security) — no separate API server
- **Testing**: Vitest (unit tests for financial calculation logic)
- **Hosting**: Vercel

## Project structure

```
app/
  (auth)/login, signup, reset-password, update-password   — auth pages
  (dashboard)/overview, transactions, accounts, categories — app pages
  (dashboard)/layout.tsx        — sidebar/nav shell, auth guard
  auth/confirm/route.ts         — Supabase email link handler
  proxy.ts (root)               — session refresh + route protection (Next 16's
                                   renamed "middleware")
components/
  ui/            — shadcn primitives
  dashboard/, charts/, transactions/, accounts/, categories/, layout/, auth/, shared/
lib/
  supabase/      — browser/server/proxy Supabase clients
  calculations/  — pure, unit-tested financial math (income, expenses, balances, net worth)
  formatters/    — currency (en-IN) and date formatting
  validations/   — Zod schemas for every form
  queries/       — typed Supabase query functions (one file per table)
  date-range/    — shared date-range preset logic
hooks/           — TanStack Query hooks wrapping lib/queries + lib/supabase/client
types/           — hand-authored Database type + camelCase domain types
supabase/
  migrations/    — numbered SQL migrations (schema, indexes, functions, RLS)
  seed.sql       — optional demo data for a user that already exists
__tests__/       — Vitest specs for lib/calculations
```

## Database schema

Defined across `supabase/migrations/*.sql`, applied in filename order:

1. `..._extensions_and_enums.sql` — enums for account/category/transaction/investment types
2. `..._tables.sql` — `profiles`, `accounts`, `categories`, `transactions`, `investments`,
   `investment_transactions`, `budgets`
3. `..._indexes.sql` — indexes on `user_id`, dates, and foreign keys
4. `..._functions_and_triggers.sql` — `updated_at` maintenance + a trigger that creates
   a `profiles` row and 22 default categories the moment a user signs up
5. `..._row_level_security.sql` — RLS enabled on every table, with
   select/insert/update/delete policies scoped to `auth.uid()`

All money columns are `numeric`, never floating point. Every user-owned table carries
`user_id` with cascading delete from `auth.users`. Transactions, and investment lots,
use `on delete restrict` on their foreign keys — the app never lets you hard-delete an
account/category that has history; it archives (`is_active = false`) instead.

The `investments`, `investment_transactions`, and `budgets` tables are created now so
the schema doesn't need to change later, even though their UI ships in Phase 2.

## Local setup

1. **Clone and install**
   ```bash
   npm install
   ```
2. **Create a Supabase project** at [supabase.com](https://supabase.com).
3. **Run the migrations** — open the SQL editor in your Supabase dashboard and run each
   file in `supabase/migrations/` in order (or use the Supabase CLI: `supabase link` then
   `supabase db push`).
4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
   Project Settings → API in your Supabase dashboard.
5. **Run locally**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`, sign up, and you'll land on a working (empty) dashboard.
6. **Optional: load demo data.** Sign up once, copy your user ID from
   Authentication → Users in the Supabase dashboard, paste it into the placeholder at
   the top of `supabase/seed.sql`, and run that file in the SQL editor. It adds 4
   accounts, ~8 months of transactions, 3 sample investment holdings, and 5 budgets —
   all clearly synthetic demo data, not real financial information.

## Testing

```bash
npm run test        # vitest run — calculation unit tests
npm run lint         # eslint
npx tsc --noEmit     # type-check
npm run build        # production build
```

`__tests__/` covers `lib/calculations`: income/expense/net-cash-flow totals, account
balances (including transfers netting to zero across accounts, negative/liability
balances), net worth, percentage-change trend logic, and the date-bucketing used by
the dashboard charts — including zero-transaction, same-day, and large-amount edge
cases.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it in Vercel.
3. Add the environment variables from `.env.example` in the Vercel project settings
   (set `NEXT_PUBLIC_SITE_URL` to your production URL — it's used to build the links in
   password-reset/signup-confirmation emails).
4. In your Supabase project, add the Vercel URL to Authentication → URL Configuration
   (Site URL + Redirect URLs), so `/auth/confirm` callbacks work in production.
5. Deploy. Build command and output are the Next.js defaults — no extra configuration
   needed.

## Architectural decisions

- **No separate backend.** Supabase is accessed directly from Server Components,
  Server Actions, and Route Handlers via `@supabase/ssr`, plus from Client Components
  via TanStack Query for the interactive pages (Transactions, Accounts, Categories).
  RLS is the actual authorization boundary — the UI hiding a button is a convenience,
  not a security control.
- **Money as `number` in the app, `numeric` in Postgres.** Supabase returns `numeric`
  columns as strings; `lib/queries/mappers.ts` parses them once at the query boundary
  so every component works with plain numbers. Never store a formatted currency string.
- **Transfers are not income or expense.** `lib/calculations` treats `type: "transfer"`
  as moving money between the user's own accounts — it's excluded from every
  income/expense aggregate, and nets to zero across the two accounts involved (see the
  `accountBalance` tests).
- **A flat Zod schema (not a discriminated union) for the transaction form.** The
  Add/Edit Transaction sheet is one form whose visible fields change with `type`;
  cross-field rules (category required for income/expense, transfer destination
  required and different from the source account) live in a single `superRefine`
  rather than a union of shapes, which is what React Hook Form actually wants to drive.
- **Archive, never hard-delete, for anything with history.** Enforced twice: the
  foreign keys use `on delete restrict` for transactions/investment lots, and the app
  only exposes delete for categories with zero transactions (`categoryHasTransactions`
  gates it) — everything else is `is_active = false`.
- **URL-synced filters/date-range**, not component state, for the dashboard date range
  and the transactions table filters — shareable/bookmarkable, and survives a refresh.

## Scope & limitations (Phase 1)

**Built:** auth (signup/login/logout/password reset), full database schema + RLS,
navigation shell with dark mode, Dashboard (KPIs with period-over-period comparison,
income vs. expenses, expense breakdown, spending trend, top categories), Transactions
(filterable/searchable/paginated table + mobile cards, Add/Edit sheet with a quick-add
button), Accounts (cards, add/edit/archive, opening balance, per-account detail +
history), Categories (income/expense management with icon/color, archive-on-history).

**Deferred to Phase 2:** Calendar view, Budgets UI, Investments dashboard (the
`investments`/`investment_transactions` tables and the ledger's `investment` transaction
type already exist — only the dedicated UI is missing), Reports/CSV export, Settings
page, CSV import, and a broader RLS/security-focused test suite. The dashboard's Net
Worth figure currently reflects account balances only (assets minus credit
card/loan debt); it will include investment holdings once that module ships.

**Not verified in this environment:** there was no live Supabase project available
while building this, and Docker wasn't available to run the Supabase CLI locally
either — so the auth flow, RLS policies, and live dashboard data have been verified by
type-checking, linting, a production build, and the calculation unit tests, but not by
clicking through the app against a real database. After you wire up your Supabase
project per [Local setup](#local-setup), walk through: sign up → add an account → add
a transaction → confirm the dashboard/balances update → try logging in as a second
account and confirm you can't see the first account's data.
