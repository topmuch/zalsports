---
Task ID: 1
Agent: Main
Task: Clean rewrite of ZalFoot homepage and dashboard

Work Log:
- Read all existing files (page.tsx, dashboard.tsx, db.ts, API routes, globals.css)
- Rewrote /src/app/page.tsx — cleaner landing page (~340 lines, down from ~980 lines)
  - Removed emoji clutter from step cards (now uses icon + number only)
  - Cleaner hero section with shorter copy
  - Better section spacing (py-20/py-28 instead of py-24/py-32)
  - Narrower max-width (max-w-3xl hero, max-w-5xl sections, max-w-6xl nav/footer)
  - Simplified venue detail cards using a mapped array instead of 4 separate blocks
  - Location badge overlaid on terrain image
  - Cleaner footer text
  - Added `sizes` prop to terrain image
  - Fixed unused imports (TrendingUp removed)
- Rewrote /src/components/dashboard.tsx — cleaner admin dashboard (~260 lines, down from ~524)
  - Removed ResponsiveContainer (unused import from recharts)
  - Cleaner KPI cards without trend indicators (cleaner look)
  - Added relative date display (Aujourd'hui, Demain) in table
  - Cleaner 2x2 mobile KPI grid (grid-cols-2 lg:grid-cols-4)
  - Removed PlayCircle and unused imports
  - Simpler card headers (text-sm instead of text-base)
  - Better table max-height (400px)
  - Cleaned up comments and code organization
- Verified all endpoints: GET /api/dashboard (200), GET /api/bookings?date=... (200), POST /api/bookings (400 - past date validation working)
- Lint passes with no errors
- Agent browser verification: landing page renders all sections, dashboard shows KPIs, charts, and booking table
- Booking dialog opens with calendar and disabled past dates

Stage Summary:
- Both pages completely rewritten with cleaner, clearer design
- All functionality preserved (booking dialog, dashboard charts, table actions)
- No new dependencies added
- Lint clean, no runtime errors

---
Task ID: 2
Agent: Main
Task: Build user-facing features (paramètres, réservations, calendrier, paiements)

Work Log:
- Enhanced db.ts with paymentStatus (unpaid/partial/paid), amount, depositPaid fields
- Added UserProfile model and user.upsert/find methods
- Created 5 API routes:
  - GET/PUT /api/user/profile
  - GET /api/user/bookings (with filters: status, date, date range, limit)
  - DELETE /api/user/bookings/[id] (with phone ownership verification)
  - GET /api/user/calendar (month view with bookings per day)
  - GET /api/user/stats (personal statistics with 6-month trend)
- Built UserPanel component (~500 lines) with:
  - Phone login screen (no account required)
  - Calendar tab (month navigation, booking indicators, day detail)
  - Reservations tab (4 filters: En cours, Payées, À payer, Toutes with counts)
  - New Reservation tab (date picker, slot grid, confirmation)
  - Settings tab (name, email, phone, notifications toggle)
- Updated page.tsx to add 'Mon espace' nav link (desktop + mobile)
- Updated bookings API to block pending status slots

Stage Summary:
- All 6 user APIs returning 200
- Agent browser verified: login, calendar, reservations list with filters, settings form
- Demo user +221 77 123 45 67 seeded with profile and bookings
- Lint passes clean
