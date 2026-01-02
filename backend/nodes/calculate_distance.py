"""Calculate distance from home location and filter commutable jobs."""
import math
from typing import List, Optional, Tuple
from backend.state import JobSearchState, Job, HOME_LAT, HOME_LNG, MAX_COMMUTE_MILES


# Known Bay Area city coordinates
BAY_AREA_CITIES = {
    "san francisco": (37.7749, -122.4194),
    "sf": (37.7749, -122.4194),
    "san jose": (37.3382, -121.8863),
    "palo alto": (37.4419, -122.1430),
    "mountain view": (37.3861, -122.0839),
    "sunnyvale": (37.3688, -122.0363),
    "santa clara": (37.3541, -121.9552),
    "cupertino": (37.3230, -122.0322),
    "menlo park": (37.4530, -122.1817),
    "redwood city": (37.4852, -122.2364),
    "fremont": (37.5485, -121.9886),
    "oakland": (37.8044, -122.2712),
    "berkeley": (37.8716, -122.2727),
    "alameda": (37.7652, -122.2416),
    "milpitas": (37.4323, -121.8996),
    "san mateo": (37.5630, -122.3255),
    "south san francisco": (37.6547, -122.4077),
    "daly city": (37.6879, -122.4702),
    "burlingame": (37.5841, -122.3660),
    "foster city": (37.5585, -122.2711),
    "hayward": (37.6688, -122.0808),
    "pleasanton": (37.6624, -121.8747),
    "livermore": (37.6819, -121.7680),
    "walnut creek": (37.9101, -122.0652),
    "concord": (37.9780, -122.0311),
    "campbell": (37.2872, -121.9500),
    "los gatos": (37.2358, -121.9624),
    "saratoga": (37.2638, -122.0230),
    "los altos": (37.3852, -122.1141),
    "almaden": (37.2358, -121.8606),  # Home area
}


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in miles using Haversine formula."""
    R = 3959  # Earth's radius in miles

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = math.sin(delta_lat / 2) ** 2 + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def geocode_location(location: str) -> Optional[Tuple[float, float]]:
    """Simple geocoding using known Bay Area cities."""
    if not location:
        return None

    location_lower = location.lower()

    # Check for known cities
    for city, coords in BAY_AREA_CITIES.items():
        if city in location_lower:
            return coords

    # Check for California/CA mentions (assume Bay Area center)
    if "california" in location_lower or ", ca" in location_lower:
        return (37.5, -122.0)  # Rough Bay Area center

    return None


def calculate_job_distance(job: Job) -> Job:
    """Calculate distance and commutability for a single job."""
    # Remote jobs are always commutable
    if job.get("work_type") == "remote":
        job["is_commutable"] = True
        job["distance_miles"] = 0
        return job

    # Try to geocode the location
    location = job.get("location", "")
    coords = geocode_location(location)

    if coords:
        lat, lng = coords
        job["latitude"] = lat
        job["longitude"] = lng
        job["distance_miles"] = round(haversine_distance(HOME_LAT, HOME_LNG, lat, lng), 1)
        job["is_commutable"] = job["distance_miles"] <= MAX_COMMUTE_MILES
    else:
        # Unknown location - mark as not commutable unless remote/hybrid
        job["distance_miles"] = None
        job["is_commutable"] = job.get("work_type") == "hybrid"

    return job


async def calculate_distance_node(state: JobSearchState) -> dict:
    """Calculate distances and filter commutable jobs."""
    all_jobs = state.get("all_jobs", [])

    # Calculate distance for each job
    processed_jobs = [calculate_job_distance(job.copy()) for job in all_jobs]

    # Filter to only commutable jobs
    filtered_jobs = [job for job in processed_jobs if job.get("is_commutable", False)]

    # Sort by distance (remote first, then by distance)
    def sort_key(job: Job) -> tuple:
        distance = job.get("distance_miles")
        if distance is None:
            return (1, 999)  # Unknown distance last
        return (0, distance)

    filtered_jobs.sort(key=sort_key)

    return {
        "processed_jobs": processed_jobs,
        "filtered_jobs": filtered_jobs,
        "total_jobs_filtered": len(filtered_jobs),
        "progress_messages": state.get("progress_messages", []) + [
            f"Filtered to {len(filtered_jobs)} commutable jobs (within {MAX_COMMUTE_MILES} miles or remote)"
        ],
    }
