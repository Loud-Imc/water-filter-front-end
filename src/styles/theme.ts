import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2876B3',      // ✅ Leewa logo blue
      light: '#4A95C7',     // ✅ Lighter blue from logo
      dark: '#1A5D8C',      // ✅ Darker blue for depth
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1E5F8F',      // ✅ Complementary blue
      light: '#3D8CB8',     // ✅ Accent shade
      dark: '#154A6F',      // ✅ Deep accent
    },
    background: {
      default: '#F8FAFB',   // ✅ Soft off-white (cleaner than pure white)
      paper: '#FFFFFF',     // ✅ Pure white for cards
    },
    text: {
      primary: '#1A2A3A',   // ✅ Dark blue-gray (softer than black)
      secondary: '#5A6C7D', // ✅ Medium gray-blue
    },
    success: {
      main: '#28A745',      // ✅ Green for success states
      light: '#48C774',
      dark: '#1E7E34',
    },
    error: {
      main: '#DC3545',      // ✅ Red for errors
      light: '#E8616E',
      dark: '#C82333',
    },
    warning: {
      main: '#FFC107',      // ✅ Amber for warnings
      light: '#FFD54F',
      dark: '#FFA000',
    },
    info: {
      main: '#2876B3',      // ✅ Same as primary (brand consistency)
      light: '#4A95C7',
      dark: '#1A5D8C',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', // ✅ Modern font
    h4: {
      fontWeight: 600,
      color: '#1A2A3A',
    },
    h5: {
      fontWeight: 600,
      color: '#1A2A3A',
    },
    h6: {
      fontWeight: 600,
      color: '#1A2A3A',
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(40, 118, 179, 0.25)', // ✅ Leewa blue shadow
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(40, 118, 179, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4A95C7', // ✅ Leewa light blue on hover
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2876B3', // ✅ Leewa primary blue on focus
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        colorPrimary: {
          backgroundColor: '#2876B3',
          color: '#ffffff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.08)',
    '0 2px 6px rgba(0,0,0,0.08)',
    '0 3px 9px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.08)',
    '0 5px 15px rgba(0,0,0,0.08)',
    '0 6px 18px rgba(0,0,0,0.08)',
    '0 7px 21px rgba(0,0,0,0.08)',
    '0 8px 24px rgba(0,0,0,0.08)',
    '0 9px 27px rgba(0,0,0,0.08)',
    '0 10px 30px rgba(0,0,0,0.08)',
    '0 11px 33px rgba(0,0,0,0.08)',
    '0 12px 36px rgba(0,0,0,0.08)',
    '0 13px 39px rgba(0,0,0,0.08)',
    '0 14px 42px rgba(0,0,0,0.08)',
    '0 15px 45px rgba(0,0,0,0.08)',
    '0 16px 48px rgba(0,0,0,0.08)',
    '0 17px 51px rgba(0,0,0,0.08)',
    '0 18px 54px rgba(0,0,0,0.08)',
    '0 19px 57px rgba(0,0,0,0.08)',
    '0 20px 60px rgba(0,0,0,0.08)',
    '0 21px 63px rgba(0,0,0,0.08)',
    '0 22px 66px rgba(0,0,0,0.08)',
    '0 23px 69px rgba(0,0,0,0.08)',
    '0 24px 72px rgba(0,0,0,0.08)',
  ],
});
