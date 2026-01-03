'use client';

import React, { useCallback } from 'react';
import {
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { FilterState } from '@/lib/types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalJobs: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  totalJobs,
  filteredCount,
}) => {
  const handleWorkTypeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newWorkTypes: string[]) => {
      if (newWorkTypes.length === 0) return;
      onFilterChange({ ...filters, workType: newWorkTypes as ('remote' | 'hybrid' | 'onsite')[] });
    },
    [filters, onFilterChange]
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({ ...filters, searchQuery: event.target.value });
    },
    [filters, onFilterChange]
  );

  const handleSortChange = useCallback(
    (event: SelectChangeEvent) => {
      onFilterChange({ ...filters, sortBy: event.target.value as FilterState['sortBy'] });
    },
    [filters, onFilterChange]
  );

  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
      }}
      elevation={1}
    >
      <TextField
        placeholder="Search jobs..."
        value={filters.searchQuery}
        onChange={handleSearchChange}
        size="small"
        sx={{ flex: 1, minWidth: 200 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <ToggleButtonGroup
        value={filters.workType}
        onChange={handleWorkTypeChange}
        size="small"
        color="primary"
      >
        <ToggleButton
          value="remote"
          sx={{
            '&.Mui-selected': {
              bgcolor: 'success.main',
              color: 'white',
              '&:hover': { bgcolor: 'success.dark' },
            },
          }}
        >
          Remote
        </ToggleButton>
        <ToggleButton
          value="hybrid"
          sx={{
            '&.Mui-selected': {
              bgcolor: 'info.main',
              color: 'white',
              '&:hover': { bgcolor: 'info.dark' },
            },
          }}
        >
          Hybrid
        </ToggleButton>
        <ToggleButton
          value="onsite"
          sx={{
            '&.Mui-selected': {
              bgcolor: 'warning.main',
              color: 'white',
              '&:hover': { bgcolor: 'warning.dark' },
            },
          }}
        >
          Onsite
        </ToggleButton>
      </ToggleButtonGroup>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Sort by</InputLabel>
        <Select
          value={filters.sortBy}
          label="Sort by"
          onChange={handleSortChange}
        >
          <MenuItem value="distance">Distance</MenuItem>
          <MenuItem value="company">Company</MenuItem>
          <MenuItem value="recent">Recent</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ ml: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredCount} of {totalJobs} jobs
        </Typography>
      </Box>
    </Paper>
  );
};

export default FilterBar;
