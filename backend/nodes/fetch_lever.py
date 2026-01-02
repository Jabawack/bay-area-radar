"""Fetch jobs from Lever job boards (Bay Area startups)."""
import httpx
from typing import List
from backend.state import JobSearchState, Job


# Curated list of Bay Area companies using Lever
LEVER_COMPANIES = [
    ("netflix", "Netflix"),
    ("coinbase", "Coinbase"),
    ("dropbox", "Dropbox"),
    ("lyft", "Lyft"),
    ("instacart", "Instacart"),
    ("doordash", "DoorDash"),
    ("pinterest", "Pinterest"),
    ("twitch", "Twitch"),
    ("affirm", "Affirm"),
    ("scale", "Scale AI"),
    ("databricks", "Databricks"),
    ("robinhood", "Robinhood"),
    ("chime", "Chime"),
    ("flexport", "Flexport"),
    ("brex", "Brex"),
]


async def fetch_company_jobs(client: httpx.AsyncClient, slug: str, company_name: str) -> List[Job]:
    """Fetch jobs from a single Lever company board."""
    jobs: List[Job] = []

    try:
        # Lever API endpoint
        url = f"https://api.lever.co/v0/postings/{slug}"
        response = await client.get(url)

        if response.status_code == 404:
            return jobs  # Company not found, skip

        response.raise_for_status()
        data = response.json()

        for item in data:
            title = item.get("text", "")
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

            # Get location from categories
            categories = item.get("categories", {})
            location = categories.get("location", "")
            commitment = categories.get("commitment", "")

            # Determine work type
            location_lower = location.lower() if location else ""
            if "remote" in location_lower:
                work_type = "remote"
            elif "hybrid" in location_lower:
                work_type = "hybrid"
            else:
                work_type = "onsite"

            job: Job = {
                "source": "lever",
                "source_id": item.get("id", ""),
                "company": company_name,
                "title": title,
                "description": item.get("descriptionPlain", "") or item.get("description", ""),
                "location": location,
                "work_type": work_type,
                "salary_min": None,
                "salary_max": None,
                "url": item.get("hostedUrl", ""),
                "posted_at": None,  # Lever doesn't provide this in API
                "skills": [],
                "summary": None,
                "distance_miles": None,
                "is_commutable": work_type == "remote",
                "latitude": None,
                "longitude": None,
            }

            # Get team as additional info
            team = categories.get("team", "")
            if team:
                job["summary"] = f"Team: {team}"

            jobs.append(job)

    except httpx.HTTPError:
        pass  # Silently skip failed companies
    except Exception:
        pass

    return jobs


async def fetch_lever_node(state: JobSearchState) -> dict:
    """Fetch jobs from all Lever company boards."""
    all_jobs: List[Job] = []
    errors: List[str] = []

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            for slug, company_name in LEVER_COMPANIES:
                company_jobs = await fetch_company_jobs(client, slug, company_name)
                all_jobs.extend(company_jobs)

    except Exception as e:
        errors.append(f"Lever fetch error: {str(e)}")

    return {
        "lever_jobs": all_jobs,
        "errors": state.get("errors", []) + errors,
        "progress_messages": state.get("progress_messages", []) + [
            f"Fetched {len(all_jobs)} jobs from {len(LEVER_COMPANIES)} Lever companies"
        ],
    }
