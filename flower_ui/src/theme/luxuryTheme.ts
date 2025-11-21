import { createTheme } from '@mui/material/styles';

const luxuryTheme = createTheme({
  palette: {
    primary: {
      main: '#D4AF37', // Champagne Gold
      light: '#F4E5C2', // Light Gold
      dark: '#B8941F', // Darker Gold
      contrastText: '#1B3A2B',
    },
    secondary: {
      main: '#1B3A2B', // Forest Green
      light: '#2C5F3C',
      dark: '#0F1F0F',
      contrastText: '#F8F6F0',
    },
    background: {
      default: '#1B3A2B',
      paper: '#F8F6F0',
    },
    text: {
      primary: '#1B3A2B',
      secondary: '#333333',
    },
    error: {
      main: '#E8B4B8', // Rose Gold for errors
    },
    warning: {
      main: '#D4AF37',
    },
    info: {
      main: '#1B3A2B',
    },
    success: {
      main: '#1B3A2B',
    },
  },
  typography: {
    fontFamily: "'Lato', sans-serif",
    h1: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      color: '#1B3A2B',
    },
    h2: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3,
      color: '#1B3A2B',
    },
    h3: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.4,
      color: '#1B3A2B',
    },
    h4: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#1B3A2B',
    },
    h5: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 400,
      fontSize: '1.25rem',
      lineHeight: 1.5,
      color: '#1B3A2B',
    },
    h6: {
      fontFamily: "'Lato', sans-serif",
      fontWeight: 700,
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#1B3A2B',
    },
    body1: {
      fontFamily: "'Lato', sans-serif",
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#333333',
    },
    body2: {
      fontFamily: "'Lato', sans-serif",
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#666666',
    },
    button: {
      fontFamily: "'Lato', sans-serif",
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '1rem',
    },
    subtitle1: {
      fontFamily: "'Lato', sans-serif",
      fontSize: '1rem',
      fontWeight: 400,
      color: '#666666',
    },
    subtitle2: {
      fontFamily: "'Lato', sans-serif",
      fontSize: '0.875rem',
      fontWeight: 400,
      color: '#666666',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.1),0px 1px 1px 0px rgba(0,0,0,0.07),0px 1px 3px 0px rgba(0,0,0,0.06)',
    '0px 3px 1px -2px rgba(0,0,0,0.1),0px 2px 2px 0px rgba(0,0,0,0.07),0px 1px 5px 0px rgba(0,0,0,0.06)',
    '0px 3px 3px -2px rgba(0,0,0,0.1),0px 3px 4px 0px rgba(0,0,0,0.07),0px 1px 8px 0px rgba(0,0,0,0.06)',
    '0px 2px 4px -1px rgba(0,0,0,0.1),0px 4px 5px 0px rgba(0,0,0,0.07),0px 1px 10px 0px rgba(0,0,0,0.06)',
    '0px 3px 5px -1px rgba(0,0,0,0.1),0px 5px 8px 0px rgba(0,0,0,0.07),0px 1px 14px 0px rgba(0,0,0,0.06)',
    '0px 3px 5px -1px rgba(0,0,0,0.1),0px 6px 10px 0px rgba(0,0,0,0.07),0px 1px 18px 0px rgba(0,0,0,0.06)',
    '0px 4px 5px -2px rgba(0,0,0,0.1),0px 7px 10px 1px rgba(0,0,0,0.07),0px 2px 16px 1px rgba(0,0,0,0.06)',
    '0px 5px 5px -3px rgba(0,0,0,0.1),0px 8px 10px 1px rgba(0,0,0,0.07),0px 3px 14px 2px rgba(0,0,0,0.06)',
    '0px 5px 6px -3px rgba(0,0,0,0.1),0px 9px 12px 1px rgba(0,0,0,0.07),0px 3px 16px 2px rgba(0,0,0,0.06)',
    '0px 6px 6px -3px rgba(0,0,0,0.1),0px 10px 14px 1px rgba(0,0,0,0.07),0px 4px 18px 3px rgba(0,0,0,0.06)',
    '0px 6px 7px -4px rgba(0,0,0,0.1),0px 11px 15px 1px rgba(0,0,0,0.07),0px 4px 20px 3px rgba(0,0,0,0.06)',
    '0px 7px 8px -4px rgba(0,0,0,0.1),0px 12px 17px 2px rgba(0,0,0,0.07),0px 5px 22px 4px rgba(0,0,0,0.06)',
    '0px 7px 8px -4px rgba(0,0,0,0.1),0px 13px 19px 2px rgba(0,0,0,0.07),0px 5px 24px 4px rgba(0,0,0,0.06)',
    '0px 7px 9px -4px rgba(0,0,0,0.1),0px 14px 21px 2px rgba(0,0,0,0.07),0px 5px 26px 4px rgba(0,0,0,0.06)',
    '0px 8px 9px -5px rgba(0,0,0,0.1),0px 15px 22px 2px rgba(0,0,0,0.07),0px 6px 28px 5px rgba(0,0,0,0.06)',
    '0px 8px 10px -5px rgba(0,0,0,0.1),0px 16px 24px 2px rgba(0,0,0,0.07),0px 6px 30px 5px rgba(0,0,0,0.06)',
    '0px 8px 11px -5px rgba(0,0,0,0.1),0px 17px 26px 2px rgba(0,0,0,0.07),0px 6px 32px 5px rgba(0,0,0,0.06)',
    '0px 9px 11px -5px rgba(0,0,0,0.1),0px 18px 28px 2px rgba(0,0,0,0.07),0px 7px 34px 6px rgba(0,0,0,0.06)',
    '0px 9px 12px -6px rgba(0,0,0,0.1),0px 19px 29px 2px rgba(0,0,0,0.07),0px 7px 36px 6px rgba(0,0,0,0.06)',
    '0px 10px 13px -6px rgba(0,0,0,0.1),0px 20px 31px 3px rgba(0,0,0,0.07),0px 8px 38px 7px rgba(0,0,0,0.06)',
    '0px 10px 13px -6px rgba(0,0,0,0.1),0px 21px 33px 3px rgba(0,0,0,0.07),0px 8px 40px 7px rgba(0,0,0,0.06)',
    '0px 10px 14px -6px rgba(0,0,0,0.1),0px 22px 35px 3px rgba(0,0,0,0.07),0px 8px 42px 7px rgba(0,0,0,0.06)',
    '0px 11px 14px -7px rgba(0,0,0,0.1),0px 23px 36px 3px rgba(0,0,0,0.07),0px 9px 44px 8px rgba(0,0,0,0.06)',
    '0px 11px 15px -7px rgba(0,0,0,0.1),0px 24px 38px 3px rgba(0,0,0,0.07),0px 9px 46px 8px rgba(0,0,0,0.06)',
  ].map((shadow, index) =>
    index === 0 ? shadow : shadow.replace(/rgba\(0,0,0/g, 'rgba(26,58,43').replace(/0\.0[0-9]/g, match => {
      const num = parseFloat(match);
      return (num * 1.5).toFixed(2);
    })
  ),
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 14px 0 rgba(212, 175, 55, 0.3)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px 0 rgba(212, 175, 55, 0.4)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
          border: '1px solid #D4AF37',
        },
        outlinedPrimary: {
          borderColor: '#D4AF37',
          color: '#D4AF37',
          '&:hover': {
            borderColor: '#B8941F',
            background: 'rgba(212, 175, 55, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(248, 246, 240, 0.95)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(248, 246, 240, 0.8)',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(212, 175, 55, 0.3)',
              borderWidth: 1,
            },
            '&:hover fieldset': {
              borderColor: 'rgba(212, 175, 55, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#D4AF37',
              borderWidth: 2,
              boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666666',
            fontWeight: 500,
            '&.Mui-focused': {
              color: '#D4AF37',
            },
          },
          '& .MuiInputBase-input': {
            color: '#1B3A2B',
            fontSize: '1rem',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          background: 'linear-gradient(135deg, #1B3A2B 0%, #2C5F3C 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1B3A2B 0%, #0F1F0F 100%)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default luxuryTheme;