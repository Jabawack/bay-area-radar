'use client';

import React, { useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Link,
  Stack,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { Job } from '@/lib/types';

interface JobCardProps {
  job: Job;
}

const styles: Record<string, SxProps<Theme>> = {
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s, transform 0.2s',
    '&:hover': {
      boxShadow: 4,
      transform: 'translateY(-2px)',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    mb: 1,
  },
  title: {
    fontWeight: 600,
    color: 'text.primary',
    '&:hover': {
      color: 'primary.main',
    },
    textDecoration: 'none',
  },
  company: {
    color: 'text.secondary',
    fontWeight: 500,
  },
  chipStack: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 0.5,
  },
  skillChip: {
    height: 24,
    fontSize: '0.75rem',
  },
  salary: {
    color: 'success.main',
    fontWeight: 500,
  },
  footer: {
    mt: 'auto',
    pt: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};

const workTypeColors: Record<string, 'success' | 'info' | 'warning'> = {
  remote: 'success',
  hybrid: 'info',
  onsite: 'warning',
};

const sourceColors: Record<string, 'secondary' | 'success' | 'info' | 'error'> = {
  remotive: 'secondary',
  greenhouse: 'success',
  lever: 'info',
  usajobs: 'error',
};

export const JobCard: React.FC<JobCardProps> = React.memo(({ job }) => {
  const handleViewJob = useCallback(() => {
    window.open(job.url, '_blank', 'noopener,noreferrer');
  }, [job.url]);

  return (
    <Card sx={styles.card} variant="outlined">
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={styles.header}>
          <Box sx={{ flex: 1, mr: 1 }}>
            <Link
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={styles.title}
            >
              <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600 }}>
                {job.title}
              </Typography>
            </Link>
            <Typography variant="body2" sx={styles.company}>
              {job.company}
            </Typography>
          </Box>
          <Stack sx={styles.chipStack}>
            <Chip
              label={job.work_type}
              size="small"
              color={workTypeColors[job.work_type] || 'default'}
            />
            <Chip
              label={job.source}
              size="small"
              color={sourceColors[job.source] || 'default'}
              variant="outlined"
            />
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {job.location || 'Location not specified'}
          {job.distance_miles !== null && job.work_type !== 'remote' && (
            <> &bull; {job.distance_miles} mi</>
          )}
        </Typography>

        {job.skills && job.skills.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {job.skills.slice(0, 5).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                variant="outlined"
                sx={styles.skillChip}
              />
            ))}
            {job.skills.length > 5 && (
              <Chip
                label={`+${job.skills.length - 5}`}
                size="small"
                sx={styles.skillChip}
              />
            )}
          </Box>
        )}

        {job.summary && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {job.summary}
          </Typography>
        )}

        {(job.salary_min || job.salary_max) && (
          <Typography variant="body2" sx={styles.salary}>
            {job.salary_min && `$${job.salary_min.toLocaleString()}`}
            {job.salary_min && job.salary_max && ' - '}
            {job.salary_max && `$${job.salary_max.toLocaleString()}`}
          </Typography>
        )}

        <Box sx={styles.footer}>
          <Link
            component="button"
            variant="body2"
            onClick={handleViewJob}
            sx={{ cursor: 'pointer' }}
          >
            View Job →
          </Link>
          {job.posted_at && (
            <Typography variant="caption" color="text.disabled">
              {new Date(job.posted_at).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

JobCard.displayName = 'JobCard';

export default JobCard;
