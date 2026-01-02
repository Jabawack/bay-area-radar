# Job Search Dashboard - Plan

## Architecture
- Next.js 14 App Router (frontend)
- LangGraph (streaming pipeline)
- Vercel Postgres (storage)
- Upstage AI (skill extraction)

## Key Files
- `backend/graph.py` - Main LangGraph pipeline
- `src/app/page.tsx` - Dashboard home
- `api/stream.py` - SSE streaming endpoint
- `api/cron.py` - Hourly job fetch trigger

## Data Flow
1. Cron triggers hourly job fetch
2. LangGraph pipeline fetches from all sources in parallel
3. Jobs processed with Upstage AI (skills, summaries)
4. Distance calculated from 95118 (Almaden)
5. Stored in Vercel Postgres
6. Dashboard displays top jobs by match/distance/salary
