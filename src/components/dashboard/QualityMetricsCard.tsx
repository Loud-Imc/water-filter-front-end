import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LoopIcon from '@mui/icons-material/Loop';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import type { QualityMetrics } from '../../types';

interface QualityMetricsCardProps {
  data: QualityMetrics;
}

const QualityMetricsCard: React.FC<QualityMetricsCardProps> = ({ data }) => {
  const getColorByRate = (rate: number) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'error';
  };

  const firstTimeFixRate = parseFloat(data.firstTimeFixRate);
  const reworkRate = parseFloat(data.reworkRate);
  const mediaCompliance = parseFloat(data.workMediaUploadCompliance);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 28, mr: 1.5, color: 'success.main' }} />
          <Typography variant="h6" fontWeight={600}>
            Quality & Performance Metrics
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* First-Time Fix Rate */}
          <Grid sx={{xs:12 , md: 6}}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ✅ First-Time Fix Rate
                </Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  {data.firstTimeFixRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={firstTimeFixRate}
                color={getColorByRate(firstTimeFixRate)}
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Requests completed without reassignment
              </Typography>
            </Box>
          </Grid>

          {/* Rework Rate */}
          <Grid sx={{xs:12 , md: 6}} >
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ⚠️ Rework Rate
                </Typography>
                <Typography variant="body2" fontWeight={600} color="warning.main">
                  {data.reworkRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={reworkRate}
                color={reworkRate > 20 ? 'error' : 'warning'}
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Requests requiring rework/reassignment
              </Typography>
            </Box>
          </Grid>

          {/* Total Reassignments */}
          <Grid sx={{xs:12 , md: 6}}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'info.lighter',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LoopIcon sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Total Reassignments
                </Typography>
              </Box>
              <Chip
                label={data.totalReassignments}
                color="info"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Grid>

          {/* Avg Reassignments */}
          <Grid sx={{xs:12 , md: 6}}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'warning.lighter',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LoopIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Avg per Request
                </Typography>
              </Box>
              <Chip
                label={data.avgReassignmentsPerRequest}
                color="warning"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Grid>

          {/* Media Upload Compliance */}
            <Grid sx={{xs:12}}>
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhotoCameraIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Work Media Upload Compliance
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600} color="primary.main">
                  {data.workMediaUploadCompliance}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={mediaCompliance}
                color={getColorByRate(mediaCompliance)}
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Completed tasks with uploaded work photos
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QualityMetricsCard;
