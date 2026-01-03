import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        if (process.env.NODE_ENV === 'development') {
          const { spawn } = await import('child_process');
          const cwd = process.cwd();
          const pythonPath = '/Users/tk/miniconda3/bin/python3';

          // Python script that streams progress
          const pythonScript = `
import asyncio
import json
import sys
sys.path.insert(0, '.')
from backend.graph import create_job_search_graph
from backend.state import JobSearchState
from datetime import datetime

async def main():
    graph = create_job_search_graph()

    initial_state = {
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

    final_state = None

    # Stream events from graph
    async for event in graph.astream_events(initial_state, version="v2"):
        event_kind = event.get("event")

        # Send node start events
        if event_kind == "on_chain_start":
            name = event.get("name", "")
            if name and name != "LangGraph":
                print(json.dumps({"type": "node_start", "node": name}), flush=True)

        # Send node end events with data
        elif event_kind == "on_chain_end":
            name = event.get("name", "")
            output = event.get("data", {}).get("output", {})

            if name and name != "LangGraph":
                # Extract progress message if available
                progress = output.get("progress_messages", [])
                jobs_count = 0

                if name == "fetch_remotive":
                    jobs_count = len(output.get("remotive_jobs", []))
                elif name == "fetch_greenhouse":
                    jobs_count = len(output.get("greenhouse_jobs", []))
                elif name == "fetch_lever":
                    jobs_count = len(output.get("lever_jobs", []))
                elif name == "merge_jobs":
                    jobs_count = output.get("total_jobs_found", 0)
                elif name == "calculate_distance":
                    jobs_count = output.get("total_jobs_filtered", 0)
                    final_state = output

                print(json.dumps({
                    "type": "node_end",
                    "node": name,
                    "jobs_count": jobs_count,
                    "progress": progress[-1] if progress else None
                }), flush=True)

    # Send final result
    if final_state:
        final_state["fetch_completed_at"] = datetime.now().isoformat()
        print(json.dumps({
            "type": "complete",
            "jobs": final_state.get("filtered_jobs", []),
            "total_found": final_state.get("total_jobs_found", 0),
            "total_filtered": final_state.get("total_jobs_filtered", 0),
            "progress": final_state.get("progress_messages", []),
            "errors": final_state.get("errors", []),
            "fetch_completed_at": final_state.get("fetch_completed_at")
        }, default=str), flush=True)

asyncio.run(main())
`;

          const pythonProcess = spawn(pythonPath, ['-c', pythonScript], {
            cwd,
            env: { ...process.env, PYTHONUNBUFFERED: '1' },
          });

          let buffer = '';

          pythonProcess.stdout.on('data', (data: Buffer) => {
            buffer += data.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const parsed = JSON.parse(line);

                  if (parsed.type === 'node_start') {
                    sendEvent('progress', {
                      type: 'start',
                      node: parsed.node,
                      message: getNodeMessage(parsed.node, 'start'),
                    });
                  } else if (parsed.type === 'node_end') {
                    sendEvent('progress', {
                      type: 'complete',
                      node: parsed.node,
                      message: getNodeMessage(parsed.node, 'end', parsed.jobs_count),
                      jobs_count: parsed.jobs_count,
                    });
                  } else if (parsed.type === 'complete') {
                    sendEvent('complete', {
                      success: true,
                      jobs: parsed.jobs,
                      total_found: parsed.total_found,
                      total_filtered: parsed.total_filtered,
                      progress: parsed.progress,
                      errors: parsed.errors,
                      fetch_completed_at: parsed.fetch_completed_at,
                    });
                  }
                } catch {
                  // Ignore non-JSON lines
                }
              }
            }
          });

          pythonProcess.stderr.on('data', (data: Buffer) => {
            console.error('Python stderr:', data.toString());
          });

          await new Promise<void>((resolve, reject) => {
            pythonProcess.on('close', (code) => {
              if (code === 0) {
                resolve();
              } else {
                reject(new Error(`Python process exited with code ${code}`));
              }
            });
            pythonProcess.on('error', reject);
          });

        } else {
          // Production: fallback to non-streaming
          sendEvent('progress', { type: 'start', message: 'Fetching jobs...' });
          const response = await fetch(`${process.env.VERCEL_URL || ''}/api/jobs`);
          const data = await response.json();
          sendEvent('complete', data);
        }

        controller.close();
      } catch (error) {
        sendEvent('error', {
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

function getNodeMessage(node: string, phase: 'start' | 'end', count?: number): string {
  const messages: Record<string, { start: string; end: string }> = {
    fetch_remotive: {
      start: 'Fetching remote jobs from Remotive...',
      end: `Found ${count} remote jobs from Remotive`,
    },
    fetch_greenhouse: {
      start: 'Fetching jobs from Greenhouse boards...',
      end: `Found ${count} jobs from Greenhouse`,
    },
    fetch_lever: {
      start: 'Fetching jobs from Lever boards...',
      end: `Found ${count} jobs from Lever`,
    },
    merge_jobs: {
      start: 'Merging and deduplicating jobs...',
      end: `Merged ${count} total jobs`,
    },
    calculate_distance: {
      start: 'Calculating distances and filtering...',
      end: `${count} jobs match your criteria`,
    },
  };

  return messages[node]?.[phase] || `${phase === 'start' ? 'Processing' : 'Completed'} ${node}`;
}
