# Bay Area Radar

Job search dashboard for Senior/Staff Software Engineering positions in the Bay Area.

## Features

- Real-time job aggregation from Remotive, Greenhouse, and Lever
- Distance filtering from 95118 (Almaden, San Jose) - 25 mile commute radius
- Filter by work type: Remote, Hybrid, Onsite
- Search and sort functionality
- LangGraph-powered job processing pipeline

## Prerequisites

- Node.js 18+
- Python 3.10+ with miniconda/conda
- Python packages: `pip install langgraph langchain httpx pydantic beautifulsoup4`

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click "Fetch Jobs" to start.

## Project Structure

```
bay-area-radar/
├── src/app/           # Next.js pages and API routes
├── src/components/    # React components
├── backend/           # Python LangGraph pipeline
│   ├── graph.py       # Main pipeline
│   ├── state.py       # State definitions
│   └── nodes/         # Job fetcher nodes
├── .claude/           # Claude Code skills infrastructure
└── dev/               # Dev docs (context persistence)
```

## Data Sources

- **Remotive**: Remote jobs API (free)
- **Greenhouse**: 18 Bay Area startups (Discord, Figma, Stripe, etc.)
- **Lever**: 15 Bay Area companies (Netflix, Coinbase, etc.)

## Deploy

```bash
vercel deploy
```

## License

MIT
