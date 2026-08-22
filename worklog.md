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
