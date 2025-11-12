// components/dashboard/StatCard.tsx
import React from 'react';
import { Card, CardContent, Typography, Box, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: string; // ✅ Just accept any string
  gradient?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = '#1976d2', // ✅ Default to blue hex
  gradient,
  onClick,
}) => {
  const theme = useTheme();

  // ✅ Simple: Try to get from theme, fallback to hex
  const getColorFromTheme = (colorName: string): string => {
    const themeColorMap: Record<string, string> = {
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
    };
    return themeColorMap[colorName] || colorName; // Return hex if not found
  };

  const getDarkColor = (colorName: string): string => {
    const themeColorMap: Record<string, string> = {
      primary: theme.palette.primary.dark,
      secondary: theme.palette.secondary.dark,
      success: theme.palette.success.dark,
      warning: theme.palette.warning.dark,
      error: theme.palette.error.dark,
      info: theme.palette.info.dark,
    };
    return themeColorMap[colorName] || colorName;
  };

  const colorValue = getColorFromTheme(color);
  const lightColor = alpha(colorValue, 0.1);
  const darkColor = getDarkColor(color);

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        } : {},
        '&::before': onClick ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: gradient || colorValue,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        } : {},
        '&:hover::before': onClick ? {
          opacity: 1,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              fontWeight={700}
              sx={{ color: colorValue }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: gradient || lightColor,
              color: gradient ? '#ffffff' : darkColor,
              fontSize: '28px',
              transition: 'all 0.3s ease',
            }}
          >
            {icon}
          </Box>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: gradient || colorValue,
            opacity: 0.3,
          }}
        />
      </CardContent>
    </Card>
  );
};

export default StatCard;
