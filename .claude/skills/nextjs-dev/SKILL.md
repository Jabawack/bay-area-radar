# Next.js Development Skill

## Quick Reference
- App Router: `src/app/` for pages
- Components: `src/components/` with 'use client' when needed
- API Routes: `src/app/api/` using Route Handlers

## Patterns Used in This Project
- Server Components by default
- Client Components for interactivity (ProgressTimeline, FilterBar)
- Vercel Postgres with @vercel/postgres

## File Structure
```
src/
├── app/
│   ├── page.tsx           # Dashboard (Server Component)
│   ├── resume/page.tsx    # Resume display
│   ├── jobs/page.tsx      # Job listings
│   └── api/
│       ├── jobs/route.ts  # Job search endpoint
│       └── cron/route.ts  # Cron trigger
├── components/
│   ├── JobCard.tsx        # Job display card
│   ├── Dashboard.tsx      # Main dashboard
│   ├── FilterBar.tsx      # Search filters (Client)
│   └── ProgressTimeline.tsx # Progress UI (Client)
└── lib/
    ├── db.ts              # Database client
    └── types.ts           # TypeScript types
```

## Resources (load on demand)
- [App Router Deep Dive](./resources/app-router.md)
- [Server Actions](./resources/server-actions.md)
- [Database Patterns](./resources/database.md)
