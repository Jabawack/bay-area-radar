'use client';

import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  CircularProgress,
  Chip,
  Collapse,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

export interface ProgressStep {
  node: string;
  label: string;
  status: 'pending' | 'running' | 'complete';
  count?: number;
}

interface ProgressTimelineProps {
  steps: ProgressStep[];
  isLoading: boolean;
  errors: string[];
  compact?: boolean;
}

const STEP_ORDER = [
  'fetch_remotive',
  'fetch_greenhouse',
  'fetch_lever',
  'merge_jobs',
  'calculate_distance',
];

const STEP_LABELS: Record<string, string> = {
  fetch_remotive: 'Remotive',
  fetch_greenhouse: 'Greenhouse',
  fetch_lever: 'Lever',
  merge_jobs: 'Merge',
  calculate_distance: 'Filter',
};

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  steps,
  isLoading,
  errors,
  compact = true,
}) => {
  // Get active step index
  const activeStep = steps.findIndex(s => s.status === 'running');
  const completedSteps = steps.filter(s => s.status === 'complete').length;
  const hasCompletedSteps = completedSteps > 0;
  
  // Keep visible when loading, has steps (completed or running), or has errors
  const shouldShow = isLoading || steps.length > 0 || errors.length > 0;

  if (compact) {
    // Compact inline progress view
    return (
      <Collapse in={shouldShow}>
        <Box sx={{ mb: 2 }}>
          {errors.length > 0 ? (
            <Alert severity="error" sx={{ py: 0.5 }}>
              {errors[0]}
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {isLoading && <CircularProgress size={16} />}
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                {isLoading ? 'Fetching:' : hasCompletedSteps ? 'Complete:' : 'Ready:'}
              </Typography>
              {STEP_ORDER.map((nodeId) => {
                const step = steps.find(s => s.node === nodeId);
                const status = step?.status || 'pending';

                return (
                  <Chip
                    key={nodeId}
                    size="small"
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {STEP_LABELS[nodeId]}
                        {step?.count !== undefined && (
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            ({step.count})
                          </Typography>
                        )}
                      </Box>
                    }
                    icon={
                      status === 'complete' ? (
                        <CheckCircleIcon sx={{ fontSize: 16 }} />
                      ) : status === 'running' ? (
                        <CircularProgress size={12} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />
                      )
                    }
                    color={status === 'complete' ? 'success' : status === 'running' ? 'primary' : 'default'}
                    variant={status === 'pending' ? 'outlined' : 'filled'}
                    sx={{
                      '& .MuiChip-icon': {
                        ml: 0.5,
                        color: status === 'complete' ? 'success.main' : 'inherit'
                      }
                    }}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      </Collapse>
    );
  }

  // Full stepper view (when compact=false)
  return (
    <Collapse in={shouldShow}>
      <Box sx={{ mb: 3, maxWidth: 400 }}>
        <Stepper activeStep={activeStep >= 0 ? activeStep : completedSteps} orientation="vertical">
          {STEP_ORDER.map((nodeId) => {
            const step = steps.find(s => s.node === nodeId);
            const status = step?.status || 'pending';

            return (
              <Step key={nodeId} completed={status === 'complete'}>
                <StepLabel
                  StepIconComponent={() => (
                    status === 'complete' ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : status === 'running' ? (
                      <CircularProgress size={20} />
                    ) : (
                      <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                    )
                  )}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {STEP_LABELS[nodeId]}
                    {step?.count !== undefined && (
                      <Chip size="small" label={step.count} color="primary" />
                    )}
                  </Box>
                </StepLabel>
                {status === 'running' && (
                  <StepContent>
                    <Typography variant="caption" color="text.secondary">
                      {step?.label || 'Processing...'}
                    </Typography>
                  </StepContent>
                )}
              </Step>
            );
          })}
        </Stepper>

        {errors.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {errors.map((error, index) => (
              <Alert key={index} severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            ))}
          </Box>
        )}
      </Box>
    </Collapse>
  );
};

export default ProgressTimeline;
