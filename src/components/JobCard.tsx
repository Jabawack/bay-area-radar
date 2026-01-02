'use client';

import { Job } from '@/lib/types';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const workTypeColors = {
    remote: 'bg-green-100 text-green-800',
    hybrid: 'bg-blue-100 text-blue-800',
    onsite: 'bg-orange-100 text-orange-800',
  };

  const sourceColors = {
    remotive: 'bg-purple-100 text-purple-800',
    greenhouse: 'bg-emerald-100 text-emerald-800',
    lever: 'bg-cyan-100 text-cyan-800',
    usajobs: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              {job.title}
            </a>
          </h3>
          <p className="text-gray-600 font-medium">{job.company}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${workTypeColors[job.work_type]}`}>
            {job.work_type}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceColors[job.source]}`}>
            {job.source}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-sm text-gray-500">
          📍 {job.location || 'Location not specified'}
        </span>
        {job.distance_miles !== null && job.work_type !== 'remote' && (
          <span className="text-sm text-gray-500">
            • {job.distance_miles} miles away
          </span>
        )}
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {job.skills.slice(0, 6).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 6 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
              +{job.skills.length - 6} more
            </span>
          )}
        </div>
      )}

      {job.summary && (
        <p className="text-sm text-gray-600 mb-3">{job.summary}</p>
      )}

      {(job.salary_min || job.salary_max) && (
        <p className="text-sm font-medium text-green-600">
          💰 {job.salary_min && `$${job.salary_min.toLocaleString()}`}
          {job.salary_min && job.salary_max && ' - '}
          {job.salary_max && `$${job.salary_max.toLocaleString()}`}
        </p>
      )}

      <div className="mt-4 flex justify-between items-center">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Job →
        </a>
        {job.posted_at && (
          <span className="text-xs text-gray-400">
            Posted: {new Date(job.posted_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
