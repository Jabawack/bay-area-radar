"""Fetch jobs from Remotive API (remote jobs, free, no API key)."""
import httpx
from typing import List
from backend.state import JobSearchState, Job


REMOTIVE_API = "https://remotive.com/api/remote-jobs"

# Filter for software engineering categories
SOFTWARE_CATEGORIES = [
    "software-dev",
    "frontend-dev",
    "backend-dev",
    "fullstack-dev",
    "devops",
    "data",
    "machine-learning",
]


async def fetch_remotive_node(state: JobSearchState) -> dict:
    """Fetch remote jobs from Remotive API."""
    jobs: List[Job] = []
    errors: List[str] = []

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Fetch software development jobs
            response = await client.get(
                REMOTIVE_API,
                params={"category": "software-dev", "limit": 50}
            )
            response.raise_for_status()
            data = response.json()

            for item in data.get("jobs", []):
                # Filter for senior/staff level
                title_lower = item.get("title", "").lower()
                is_senior = any(level in title_lower for level in [
                    "senior", "sr.", "staff", "principal", "lead", "architect"
                ])

                if not is_senior:
                    continue

                job: Job = {
                    "source": "remotive",
                    "source_id": str(item.get("id", "")),
                    "company": item.get("company_name", ""),
                    "title": item.get("title", ""),
                    "description": item.get("description", ""),
                    "location": item.get("candidate_required_location", "Worldwide"),
                    "work_type": "remote",
                    "salary_min": None,
                    "salary_max": None,
                    "url": item.get("url", ""),
                    "posted_at": item.get("publication_date"),
                    "skills": [],
                    "summary": None,
                    "distance_miles": None,
                    "is_commutable": True,  # Remote is always commutable
                    "latitude": None,
                    "longitude": None,
                }

                # Try to extract salary if present
                salary = item.get("salary", "")
                if salary:
                    job["summary"] = f"Salary: {salary}"

                # Extract tags as skills
                tags = item.get("tags", [])
                if tags:
                    job["skills"] = tags[:10]  # Limit to 10 skills

                jobs.append(job)

    except httpx.HTTPError as e:
        errors.append(f"Remotive API error: {str(e)}")
    except Exception as e:
        errors.append(f"Remotive fetch error: {str(e)}")

    return {
        "remotive_jobs": jobs,
        "errors": state.get("errors", []) + errors,
        "progress_messages": state.get("progress_messages", []) + [
            f"Fetched {len(jobs)} remote jobs from Remotive"
        ],
    }
