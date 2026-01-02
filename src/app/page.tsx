'use client';

import { useState, useEffect, useMemo } from 'react';
import { Job, JobsResponse, FilterState, DEFAULT_FILTERS, HOME_LOCATION } from '@/lib/types';
import { JobCard } from '@/components/JobCard';
import { FilterBar } from '@/components/FilterBar';
import { ProgressTimeline } from '@/components/ProgressTimeline';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    setProgress([]);
    setErrors([]);

    try {
      const response = await fetch('/api/jobs');
      const data: JobsResponse = await response.json();

      if (data.success) {
        setJobs(data.jobs);
        setProgress(data.progress);
        setErrors(data.errors);
        setLastFetched(data.fetch_completed_at);
      } else {
        setErrors([data.errors?.[0] || 'Failed to fetch jobs']);
      }
    } catch (error) {
      setErrors([`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      // Work type filter
      if (!filters.workType.includes(job.work_type)) {
        return false;
      }

      // Distance filter (for non-remote jobs)
      if (job.work_type !== 'remote' && job.distance_miles !== null) {
        if (job.distance_miles > filters.maxDistance) {
          return false;
        }
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchable = [
          job.title,
          job.company,
          job.description,
          ...job.skills,
        ].join(' ').toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'distance':
          const distA = a.work_type === 'remote' ? -1 : (a.distance_miles ?? 999);
          const distB = b.work_type === 'remote' ? -1 : (b.distance_miles ?? 999);
          return distA - distB;
        case 'company':
          return a.company.localeCompare(b.company);
        case 'recent':
          const dateA = a.posted_at ? new Date(a.posted_at).getTime() : 0;
          const dateB = b.posted_at ? new Date(b.posted_at).getTime() : 0;
          return dateB - dateA;
        default:
          return 0;
      }
    });

    return result;
  }, [jobs, filters]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🎯 Bay Area Radar
              </h1>
              <p className="text-gray-500 mt-1">
                Senior/Staff SWE jobs within {filters.maxDistance} miles of {HOME_LOCATION.city}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {lastFetched && (
                <span className="text-sm text-gray-400">
                  Last updated: {new Date(lastFetched).toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={fetchJobs}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Fetching...' : '🔄 Fetch Jobs'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress */}
        <ProgressTimeline
          messages={progress}
          isLoading={isLoading}
          errors={errors}
        />

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          totalJobs={jobs.length}
          filteredCount={filteredJobs.length}
        />

        {/* Job Listings */}
        {jobs.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No jobs loaded yet. Click &quot;Fetch Jobs&quot; to start searching.
            </p>
            <button
              onClick={fetchJobs}
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
            >
              🚀 Start Job Search
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard key={`${job.source}-${job.source_id}`} job={job} />
            ))}
          </div>
        )}

        {filteredJobs.length === 0 && jobs.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No jobs match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>
            Data sources: Remotive, Greenhouse, Lever |
            Home: {HOME_LOCATION.zip} ({HOME_LOCATION.city})
          </p>
        </div>
      </footer>
    </div>
  );
}
