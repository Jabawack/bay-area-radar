"""Merge jobs from all sources and deduplicate."""
from typing import List
from backend.state import JobSearchState, Job


def deduplicate_jobs(jobs: List[Job]) -> List[Job]:
    """Remove duplicate jobs based on source + source_id."""
    seen = set()
    unique_jobs = []

    for job in jobs:
        key = (job.get("source", ""), job.get("source_id", ""))
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)

    return unique_jobs


async def merge_jobs_node(state: JobSearchState) -> dict:
    """Merge jobs from all sources into a single list."""
    all_jobs: List[Job] = []

    # Collect from all sources
    all_jobs.extend(state.get("remotive_jobs", []))
    all_jobs.extend(state.get("greenhouse_jobs", []))
    all_jobs.extend(state.get("lever_jobs", []))

    # Deduplicate
    unique_jobs = deduplicate_jobs(all_jobs)

    return {
        "all_jobs": unique_jobs,
        "total_jobs_found": len(unique_jobs),
        "progress_messages": state.get("progress_messages", []) + [
            f"Merged {len(unique_jobs)} unique jobs from all sources"
        ],
    }
