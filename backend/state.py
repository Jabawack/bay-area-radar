"""LangGraph state definition for job search pipeline."""
from typing import TypedDict, List, Optional, Any
from datetime import datetime


class Job(TypedDict, total=False):
    """Normalized job structure from any source."""
    source: str              # 'remotive', 'usajobs', 'greenhouse', 'lever'
    source_id: str           # Original job ID from source
    company: str
    title: str
    description: str
    location: str
    work_type: str           # 'remote', 'hybrid', 'onsite'
    salary_min: Optional[int]
    salary_max: Optional[int]
    url: str
    posted_at: Optional[str]
    # Computed fields
    skills: List[str]
    summary: Optional[str]
    distance_miles: Optional[float]
    is_commutable: bool
    latitude: Optional[float]
    longitude: Optional[float]


class JobSearchState(TypedDict, total=False):
    """State for the job search LangGraph pipeline."""
    # Input configuration
    sources: List[str]           # ['remotive', 'usajobs', 'greenhouse', 'lever']
    keywords: List[str]          # Search keywords

    # Progress tracking (for streaming UI)
    current_step: str
    steps_completed: List[str]
    progress_messages: List[str]

    # Fetched data (raw from each source)
    remotive_jobs: List[Job]
    usajobs_jobs: List[Job]
    greenhouse_jobs: List[Job]
    lever_jobs: List[Job]

    # Merged and processed
    all_jobs: List[Job]
    processed_jobs: List[Job]

    # Final output
    filtered_jobs: List[Job]     # Jobs matching criteria
    top_jobs: List[Job]          # Top 10 by match score

    # Errors
    errors: List[str]

    # Metadata
    fetch_started_at: str
    fetch_completed_at: str
    total_jobs_found: int
    total_jobs_filtered: int


# Home location: 95118, Almaden, San Jose
HOME_LAT = 37.2358
HOME_LNG = -121.8606
MAX_COMMUTE_MILES = 25  # Covers up to Palo Alto
