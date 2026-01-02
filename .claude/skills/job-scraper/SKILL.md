# Job Scraper Skill

## Data Sources

### Remotive API (Remote Jobs)
- **Endpoint**: `https://remotive.com/api/remote-jobs`
- **Free**: Yes, no API key needed
- **Rate limit**: Be respectful, cache results

```python
import httpx

async def fetch_remotive_jobs():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://remotive.com/api/remote-jobs")
        data = response.json()
        return data["jobs"]
```

### USAJOBS API (Government Jobs)
- **Endpoint**: `https://data.usajobs.gov/api/search`
- **Free**: Yes (requires API key)
- **Sign up**: https://developer.usajobs.gov/

```python
headers = {
    "Authorization-Key": os.environ["USAJOBS_API_KEY"],
    "User-Agent": "your-email@example.com"
}
params = {"LocationName": "California", "Keyword": "software engineer"}
```

### Greenhouse Scraping
- **URL pattern**: `https://boards.greenhouse.io/{company}/jobs`
- Parse JSON from embedded `__NEXT_DATA__` or API endpoint

### Lever Scraping
- **URL pattern**: `https://jobs.lever.co/{company}`
- Parse structured job listings from HTML

## Target Companies
```python
GREENHOUSE_COMPANIES = [
    'discord', 'figma', 'notion', 'airtable', 'stripe',
    'plaid', 'ramp', 'rippling', 'gusto', 'webflow',
    'vercel', 'supabase', 'linear', 'retool', 'loom'
]

LEVER_COMPANIES = [
    'netflix', 'coinbase', 'dropbox', 'lyft', 'instacart',
    'doordash', 'pinterest', 'twitch', 'affirm', 'scale'
]
```

## Job Schema
```python
class Job(TypedDict):
    source: str           # 'remotive', 'usajobs', 'greenhouse', 'lever'
    source_id: str
    company: str
    title: str
    description: str
    location: str
    work_type: str        # 'remote', 'hybrid', 'onsite'
    salary_min: Optional[int]
    salary_max: Optional[int]
    url: str
    posted_at: datetime
```
