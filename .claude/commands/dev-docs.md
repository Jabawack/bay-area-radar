# Dev Docs Command

Generate or update dev documentation for context persistence across sessions.

## Usage
`/dev-docs` or `/dev-docs update`

## What It Does
1. Reads current codebase state
2. Updates `dev/job-search-plan.md` with architecture
3. Updates `dev/job-search-context.md` with requirements
4. Updates `dev/job-search-tasks.md` with current status

## Three-File Pattern

### job-search-plan.md
- Architecture decisions
- Key files and their purposes
- Data flow description

### job-search-context.md
- User requirements
- Target roles and locations
- Data sources
- Constraints

### job-search-tasks.md
- Completed tasks
- In progress tasks
- Pending tasks
- Blocked items

## Why This Matters
These files survive context resets. When starting a new Claude session, read these files first to understand the project state.
