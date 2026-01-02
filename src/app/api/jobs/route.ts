import { NextResponse } from 'next/server';

// For development: directly call Python script
// For production: this would call the Vercel Python function

export async function GET() {
  try {
    // In development, we'll run the Python script directly
    // In production on Vercel, the /api/jobs.py endpoint handles this

    if (process.env.NODE_ENV === 'development') {
      // Run Python script directly
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const cwd = process.cwd();

      // Run the Python job fetcher
      const { stdout, stderr } = await execAsync(
        `cd "${cwd}" && python3 -c "
import asyncio
import json
import sys
sys.path.insert(0, '.')
from backend.graph import run_job_search

async def main():
    result = await run_job_search()
    response = {
        'success': True,
        'jobs': result.get('filtered_jobs', []),
        'total_found': result.get('total_jobs_found', 0),
        'total_filtered': result.get('total_jobs_filtered', 0),
        'progress': result.get('progress_messages', []),
        'errors': result.get('errors', []),
        'fetch_started_at': result.get('fetch_started_at'),
        'fetch_completed_at': result.get('fetch_completed_at'),
    }
    print(json.dumps(response, default=str))

asyncio.run(main())
"`,
        { timeout: 60000 } // 60 second timeout
      );

      if (stderr) {
        console.error('Python stderr:', stderr);
      }

      const data = JSON.parse(stdout.trim());
      return NextResponse.json(data);
    }

    // Production: proxy to the Python endpoint
    const response = await fetch(`${process.env.VERCEL_URL || ''}/api/jobs`);
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Job fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        jobs: [],
        total_found: 0,
        total_filtered: 0,
        progress: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        fetch_started_at: new Date().toISOString(),
        fetch_completed_at: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
