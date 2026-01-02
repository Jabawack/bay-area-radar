'use client';

import { FilterState } from '@/lib/types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalJobs: number;
  filteredCount: number;
}

export function FilterBar({ filters, onFilterChange, totalJobs, filteredCount }: FilterBarProps) {
  const handleWorkTypeToggle = (type: 'remote' | 'hybrid' | 'onsite') => {
    const current = filters.workType;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];

    // Don't allow empty selection
    if (updated.length === 0) return;

    onFilterChange({ ...filters, workType: updated });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search jobs..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Work Type Filter */}
        <div className="flex gap-2">
          {(['remote', 'hybrid', 'onsite'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleWorkTypeToggle(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filters.workType.includes(type)
                  ? type === 'remote'
                    ? 'bg-green-500 text-white'
                    : type === 'hybrid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="distance">Sort by Distance</option>
          <option value="company">Sort by Company</option>
          <option value="recent">Sort by Recent</option>
        </select>

        {/* Count */}
        <div className="text-sm text-gray-500">
          Showing {filteredCount} of {totalJobs} jobs
        </div>
      </div>
    </div>
  );
}
