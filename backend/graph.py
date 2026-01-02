"""Main LangGraph workflow for job search pipeline."""
from datetime import datetime
from langgraph.graph import StateGraph, END
from backend.state import JobSearchState
from backend.nodes import (
    fetch_remotive_node,
    fetch_greenhouse_node,
    fetch_lever_node,
    merge_jobs_node,
    calculate_distance_node,
)


def create_job_search_graph():
    """Create the job search LangGraph workflow."""
    # Initialize the graph with our state type
    graph = StateGraph(JobSearchState)

    # Add nodes
    graph.add_node("fetch_remotive", fetch_remotive_node)
    graph.add_node("fetch_greenhouse", fetch_greenhouse_node)
    graph.add_node("fetch_lever", fetch_lever_node)
    graph.add_node("merge_jobs", merge_jobs_node)
    graph.add_node("calculate_distance", calculate_distance_node)

    # Set entry point - start with remotive (we'll run fetchers sequentially for simplicity)
    graph.set_entry_point("fetch_remotive")

    # Define edges (sequential flow for now)
    graph.add_edge("fetch_remotive", "fetch_greenhouse")
    graph.add_edge("fetch_greenhouse", "fetch_lever")
    graph.add_edge("fetch_lever", "merge_jobs")
    graph.add_edge("merge_jobs", "calculate_distance")
    graph.add_edge("calculate_distance", END)

    return graph.compile()


async def run_job_search():
    """Run the job search pipeline and return results."""
    graph = create_job_search_graph()

    initial_state: JobSearchState = {
        "sources": ["remotive", "greenhouse", "lever"],
        "keywords": ["senior", "staff", "software", "engineer", "frontend", "backend"],
        "current_step": "",
        "steps_completed": [],
        "progress_messages": [],
        "remotive_jobs": [],
        "greenhouse_jobs": [],
        "lever_jobs": [],
        "all_jobs": [],
        "processed_jobs": [],
        "filtered_jobs": [],
        "top_jobs": [],
        "errors": [],
        "fetch_started_at": datetime.now().isoformat(),
        "fetch_completed_at": "",
        "total_jobs_found": 0,
        "total_jobs_filtered": 0,
    }

    # Run the graph
    result = await graph.ainvoke(initial_state)

    # Set completion time
    result["fetch_completed_at"] = datetime.now().isoformat()

    return result


async def stream_job_search():
    """Stream job search progress for UI updates."""
    graph = create_job_search_graph()

    initial_state: JobSearchState = {
        "sources": ["remotive", "greenhouse", "lever"],
        "keywords": ["senior", "staff", "software", "engineer", "frontend", "backend"],
        "current_step": "",
        "steps_completed": [],
        "progress_messages": [],
        "remotive_jobs": [],
        "greenhouse_jobs": [],
        "lever_jobs": [],
        "all_jobs": [],
        "processed_jobs": [],
        "filtered_jobs": [],
        "top_jobs": [],
        "errors": [],
        "fetch_started_at": datetime.now().isoformat(),
        "fetch_completed_at": "",
        "total_jobs_found": 0,
        "total_jobs_filtered": 0,
    }

    # Stream events from the graph
    async for event in graph.astream_events(initial_state, version="v2"):
        yield event
