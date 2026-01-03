'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WorkIcon from '@mui/icons-material/Work';
import { Job, FilterState, DEFAULT_FILTERS, HOME_LOCATION } from '@/lib/types';
import { JobCard } from '@/components/JobCard';
import { FilterBar } from '@/components/FilterBar';
import { ProgressTimeline, ProgressStep } from '@/components/ProgressTimeline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const Dashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Check if we're in production (Vercel)
  const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

  const fetchJobsStreaming = useCallback(() => {
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsLoading(true);
    setProgressSteps([]);
    setErrors([]);

    const eventSource = new EventSource('/api/jobs/stream');
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('progress', (event) => {
      const data = JSON.parse(event.data);

      setProgressSteps((prev) => {
        const existing = prev.find((s) => s.node === data.node);
        if (existing) {
          return prev.map((s) =>
            s.node === data.node
              ? { ...s, status: data.type === 'complete' ? 'complete' : 'running', count: data.jobs_count, label: data.message }
              : s
          );
        }
        return [...prev, { node: data.node, label: data.message, status: data.type === 'complete' ? 'complete' : 'running', count: data.jobs_count }];
      });
    });

    eventSource.addEventListener('complete', (event) => {
      const data = JSON.parse(event.data);
      setJobs(data.jobs || []);
      setLastFetched(data.fetch_completed_at);
      if (data.errors?.length) {
        setErrors(data.errors);
      }
      setIsLoading(false);
      eventSource.close();
    });

    eventSource.addEventListener('error', () => {
      // Streaming failed - fallback to regular fetch
      eventSource.close();
      fetchJobsRegular();
    });

    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        setIsLoading(false);
      }
    };
  }, []);

  const fetchJobsRegular = useCallback(async () => {
    setIsLoading(true);
    setProgressSteps([]);
    setErrors([]);

    // Show simple progress for non-streaming
    setProgressSteps([
      { node: 'fetch_remotive', label: 'Fetching...', status: 'running' },
    ]);

    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs || []);
        setLastFetched(data.fetch_completed_at);
        // Mark all steps complete
        setProgressSteps([
          { node: 'fetch_remotive', label: 'Remotive', status: 'complete', count: data.jobs?.filter((j: Job) => j.source === 'remotive').length },
          { node: 'fetch_greenhouse', label: 'Greenhouse', status: 'complete', count: data.jobs?.filter((j: Job) => j.source === 'greenhouse').length },
          { node: 'fetch_lever', label: 'Lever', status: 'complete', count: data.jobs?.filter((j: Job) => j.source === 'lever').length },
          { node: 'merge_jobs', label: 'Merged', status: 'complete', count: data.total_found },
          { node: 'calculate_distance', label: 'Filtered', status: 'complete', count: data.total_filtered },
        ]);
        if (data.errors?.length) {
          setErrors(data.errors);
        }
      } else {
        setErrors([data.error || 'Failed to fetch jobs']);
      }
    } catch (error) {
      setErrors([`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use streaming in dev, regular fetch in production
  const fetchJobs = useCallback(() => {
    if (isProduction) {
      fetchJobsRegular();
    } else {
      fetchJobsStreaming();
    }
  }, [isProduction, fetchJobsRegular, fetchJobsStreaming]);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      if (!filters.workType.includes(job.work_type)) {
        return false;
      }

      if (job.work_type !== 'remote' && job.distance_miles !== null) {
        if (job.distance_miles > filters.maxDistance) {
          return false;
        }
      }

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

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <WorkIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              Bay Area Radar
            </Typography>
            {lastFetched && (
              <Typography variant="caption" sx={{ mr: 2, opacity: 0.8 }}>
                Updated: {new Date(lastFetched).toLocaleTimeString()}
              </Typography>
            )}
            <Button
              variant="contained"
              color="inherit"
              startIcon={<RefreshIcon />}
              onClick={fetchJobs}
              disabled={isLoading}
              sx={{ color: 'primary.main', bgcolor: 'white' }}
            >
              {isLoading ? 'Fetching...' : 'Fetch Jobs'}
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Senior/Staff SWE jobs within {filters.maxDistance} miles of {HOME_LOCATION.city}
          </Typography>

          <ProgressTimeline
            steps={progressSteps}
            isLoading={isLoading}
            errors={errors}
          />

          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            totalJobs={jobs.length}
            filteredCount={filteredJobs.length}
          />

          {jobs.length === 0 && !isLoading ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <WorkIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No jobs loaded yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Click &quot;Fetch Jobs&quot; to start searching for opportunities
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<RefreshIcon />}
                onClick={fetchJobs}
              >
                Start Job Search
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredJobs.map((job) => (
                <Grid key={`${job.source}-${job.source_id}`} size={{ xs: 12, md: 6, lg: 4 }}>
                  <JobCard job={job} />
                </Grid>
              ))}
            </Grid>
          )}

          {filteredJobs.length === 0 && jobs.length > 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
              <Typography color="text.secondary">
                No jobs match your current filters. Try adjusting your search criteria.
              </Typography>
            </Paper>
          )}
        </Container>

        <Paper
          component="footer"
          square
          elevation={0}
          sx={{ py: 2, mt: 4, borderTop: 1, borderColor: 'divider' }}
        >
          <Container maxWidth="xl">
            <Typography variant="body2" color="text.secondary" align="center">
              Data sources: Remotive, Greenhouse, Lever | Home: {HOME_LOCATION.zip} ({HOME_LOCATION.city})
            </Typography>
          </Container>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
