"""API endpoint to fetch jobs - runs LangGraph pipeline."""
import json
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from http.server import BaseHTTPRequestHandler
import asyncio


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET request - fetch all jobs."""
        try:
            from backend.graph import run_job_search

            # Run the async job search
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(run_job_search())
            loop.close()

            # Prepare response
            response = {
                "success": True,
                "jobs": result.get("filtered_jobs", []),
                "total_found": result.get("total_jobs_found", 0),
                "total_filtered": result.get("total_jobs_filtered", 0),
                "progress": result.get("progress_messages", []),
                "errors": result.get("errors", []),
                "fetch_started_at": result.get("fetch_started_at"),
                "fetch_completed_at": result.get("fetch_completed_at"),
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(response, default=str).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False,
                "error": str(e),
                "jobs": [],
            }).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
