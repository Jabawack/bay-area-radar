# Vercel Deploy Skill

## Quick Reference
- Python files in `/api` become serverless endpoints
- Hobby plan: 60 second function execution limit
- Cron jobs configured in `vercel.json`

## Python Serverless Functions
```
api/
├── stream.py      → /api/stream (LangGraph streaming)
├── jobs.py        → /api/jobs (job search)
└── cron.py        → /api/cron (hourly trigger)
```

Each Python file must export a handler:
```python
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"status": "ok"}')
```

Or use ASGI (recommended):
```python
# api/stream.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.get("/api/stream")
async def stream():
    return StreamingResponse(generate(), media_type="text/event-stream")
```

## vercel.json Configuration
```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 * * * *"
    }
  ],
  "functions": {
    "api/*.py": {
      "maxDuration": 60
    }
  }
}
```

## Environment Variables
```bash
vercel env add DATABASE_URL
vercel env add USAJOBS_API_KEY
vercel env add UPSTAGE_API_KEY
vercel env add CRON_SECRET
```

## Deploy Commands
```bash
vercel link
vercel env pull
vercel deploy
vercel deploy --prod
```
