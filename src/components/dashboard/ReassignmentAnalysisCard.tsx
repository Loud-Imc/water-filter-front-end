import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Divider,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { ReassignmentAnalysis } from '../../types';

interface ReassignmentAnalysisCardProps {
  data: ReassignmentAnalysis;
}

const ReassignmentAnalysisCard: React.FC<ReassignmentAnalysisCardProps> = ({ data }) => {
  const preWorkPercentage =
    data.totalReassignments > 0
      ? ((data.preWorkReassignments / data.totalReassignments) * 100).toFixed(1)
      : '0';

  const postWorkPercentage =
    data.totalReassignments > 0
      ? ((data.postWorkReassignments / data.totalReassignments) * 100).toFixed(1)
      : '0';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SwapHorizIcon sx={{ fontSize: 28, mr: 1.5, color: 'warning.main' }} />
          <Typography variant="h6" fontWeight={600}>
            Reassignment Analysis
          </Typography>
        </Box>

        {/* Summary Stats */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 3,
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 2,
          }}
        >
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {data.totalReassignments}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Reassignments
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} color="info.main">
              {data.preWorkReassignments}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pre-Work ({preWorkPercentage}%)
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} color="warning.main">
              {data.postWorkReassignments}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Post-Work ({postWorkPercentage}%)
            </Typography>
          </Box>
        </Box>

        {/* Top Reassignment Reasons */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingUpIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle2" fontWeight={600}>
              Top Reassignment Reasons
            </Typography>
          </Box>

          {data.topReassignmentReasons.length > 0 ? (
            <List dense>
              {data.topReassignmentReasons.map((reason, index) => (
                <ListItem
                  key={index}
                  sx={{
                    bgcolor: index % 2 === 0 ? 'grey.50' : 'white',
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          color={index === 0 ? 'primary' : 'default'}
                          sx={{ minWidth: 40 }}
                        />
                        <Typography variant="body2">{reason.reason}</Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {reason.count} reassignments
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {reason.percentage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(reason.percentage)}
                          color={index === 0 ? 'primary' : 'info'}
                          sx={{ height: 4, borderRadius: 1 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No reassignment data available for this period
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReassignmentAnalysisCard;
