// components/dashboard/StatCard.tsx
import React from 'react';
import { Card, CardContent, Typography, Box, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | string; // ✅ Accept string colors
  gradient?: string; // ✅ Optional gradient
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  gradient,
  onClick,
}) => {
  const theme = useTheme();

  // ✅ Helper: Check if color is a MUI theme color or custom hex
  const isThemeColor = ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(color as string);
  
  // ✅ Get actual color value
  const getColorValue = () => {
    if (isThemeColor) {
      return theme.palette[color as keyof typeof theme.palette].main;
    }
    return color; // Custom hex color
  };

  // ✅ Get light background color
  const getLightColor = () => {
    if (isThemeColor) {
      return alpha(theme.palette[color as keyof typeof theme.palette].main, 0.1);
    }
    return alpha(color as string, 0.1); // 10% opacity for custom colors
  };

  // ✅ Get dark color for icon
  const getDarkColor = () => {
    if (isThemeColor) {
      return theme.palette[color as keyof typeof theme.palette].dark;
    }
    return color; // Use same color for custom
  };

  const colorValue = getColorValue();
  const lightColor = getLightColor();
  const darkColor = getDarkColor();

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
        // ✅ Gradient border effect on hover
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
          {/* Left: Title and Value */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              fontWeight={700}
              sx={{ 
                color: colorValue,
                // ✅ Add subtle animation on hover
                transition: 'transform 0.3s ease',
              }}
            >
              {value}
            </Typography>
          </Box>

          {/* Right: Icon Box */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: gradient || lightColor, // ✅ Use gradient if provided
              color: gradient ? '#ffffff' : darkColor, // White text for gradients
              fontSize: '28px',
              transition: 'all 0.3s ease',
              // ✅ Icon box animation on card hover
              ...(onClick && {
                '&:hover': {
                  transform: 'rotate(10deg) scale(1.1)',
                },
              }),
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* ✅ Optional: Bottom accent line */}
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
