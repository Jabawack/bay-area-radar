"""Fetch jobs from Greenhouse job boards (Bay Area startups)."""
import httpx
from typing import List
from backend.state import JobSearchState, Job


# Curated list of Bay Area companies using Greenhouse
GREENHOUSE_COMPANIES = [
    ("discord", "Discord"),
    ("figma", "Figma"),
    ("notion", "Notion"),
    ("airtable", "Airtable"),
    ("stripe", "Stripe"),
    ("plaid", "Plaid"),
    ("ramp", "Ramp"),
    ("rippling", "Rippling"),
    ("gusto", "Gusto"),
    ("webflow", "Webflow"),
    ("vercel", "Vercel"),
    ("supabase", "Supabase"),
    ("linear", "Linear"),
    ("retool", "Retool"),
    ("loom", "Loom"),
    ("glean", "Glean"),
    ("anthropic", "Anthropic"),
    ("openai", "OpenAI"),
]


async def fetch_company_jobs(client: httpx.AsyncClient, slug: str, company_name: str) -> List[Job]:
    """Fetch jobs from a single Greenhouse company board."""
    jobs: List[Job] = []

    try:
        # Greenhouse API endpoint
        url = f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs"
        response = await client.get(url, params={"content": "true"})

        if response.status_code == 404:
            return jobs  # Company not found, skip

        response.raise_for_status()
        data = response.json()

        for item in data.get("jobs", []):
            title = item.get("title", "")
            title_lower = title.lower()

            # Filter for engineering roles
            is_engineering = any(kw in title_lower for kw in [
                "engineer", "developer", "software", "frontend", "backend",
                "fullstack", "full-stack", "swe", "platform"
            ])

            if not is_engineering:
                continue

            # Filter for senior/staff level
            is_senior = any(level in title_lower for level in [
                "senior", "sr.", "sr ", "staff", "principal", "lead", "architect"
            ])

            if not is_senior:
                continue

            # Get location
            location_data = item.get("location", {})
            location = location_data.get("name", "") if isinstance(location_data, dict) else str(location_data)

            # Determine work type from location
            location_lower = location.lower()
            if "remote" in location_lower:
                work_type = "remote"
            elif "hybrid" in location_lower:
                work_type = "hybrid"
            else:
                work_type = "onsite"

            job: Job = {
                "source": "greenhouse",
                "source_id": str(item.get("id", "")),
                "company": company_name,
                "title": title,
                "description": item.get("content", ""),
                "location": location,
                "work_type": work_type,
                "salary_min": None,
                "salary_max": None,
                "url": item.get("absolute_url", ""),
                "posted_at": item.get("updated_at"),
                "skills": [],
                "summary": None,
                "distance_miles": None,
                "is_commutable": work_type == "remote",
                "latitude": None,
                "longitude": None,
            }

            jobs.append(job)

    except httpx.HTTPError:
        pass  # Silently skip failed companies
    except Exception:
        pass

    return jobs


async def fetch_greenhouse_node(state: JobSearchState) -> dict:
    """Fetch jobs from all Greenhouse company boards."""
    all_jobs: List[Job] = []
    errors: List[str] = []

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            for slug, company_name in GREENHOUSE_COMPANIES:
                company_jobs = await fetch_company_jobs(client, slug, company_name)
                all_jobs.extend(company_jobs)

    except Exception as e:
        errors.append(f"Greenhouse fetch error: {str(e)}")

    return {
        "greenhouse_jobs": all_jobs,
        "errors": state.get("errors", []) + errors,
        "progress_messages": state.get("progress_messages", []) + [
            f"Fetched {len(all_jobs)} jobs from {len(GREENHOUSE_COMPANIES)} Greenhouse companies"
        ],
    }
