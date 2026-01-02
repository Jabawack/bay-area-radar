# LangGraph Development Skill

## Quick Reference
- State: `backend/state.py` - TypedDict for graph state
- Graph: `backend/graph.py` - Node definitions and edges
- Nodes: `backend/nodes/` - Individual processing steps

## Pipeline Structure
```
[fetch_remotive] ──┐
[fetch_usajobs]  ──┼──▶ [merge] ──▶ [upstage] ──▶ [distance] ──▶ [store]
[fetch_greenhouse]─┤
[fetch_lever] ─────┘
```

## Streaming Pattern
```python
async for event in graph.astream_events(input, version="v2"):
    if event["event"] == "on_chain_start":
        yield progress_update(event["name"], "started")
    elif event["event"] == "on_chain_end":
        yield progress_update(event["name"], "completed")
```

## State Definition
```python
class JobSearchState(TypedDict):
    sources: List[str]
    current_step: str
    steps_completed: List[str]
    raw_jobs: List[dict]
    processed_jobs: List[dict]
    errors: List[str]
```

## Resources (load on demand)
- [State Management](./resources/state.md)
- [Parallel Execution](./resources/parallel.md)
- [Error Handling](./resources/errors.md)
