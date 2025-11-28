import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Snackbar,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface SimpleToastProps {
  open: boolean;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose?: () => void;
  duration?: number;
}

const SimpleToast: React.FC<SimpleToastProps> = ({
  open,
  message,
  type = 'success',
  onClose,
  duration = 3000,
}) => {
  const theme = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon sx={{ color: 'white' }} />;
      case 'info':
      case 'warning':
      case 'error':
      default:
        return <CheckIcon sx={{ color: 'white' }} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'info':
        return '#2196F3';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#4CAF50';
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        top: 80,
        '& .MuiSnackbar-root': {
          top: 80,
        },
      }}
    >
      <Fade in={open} timeout={300}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            pr: 1,
            minWidth: 280,
            maxWidth: 400,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            background: `linear-gradient(135deg, ${getBackgroundColor()} 0%, ${alpha(getBackgroundColor(), 0.9)} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.2)',
              flexShrink: 0,
            }}
          >
            {getIcon()}
          </Box>

          {/* Message */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}
            >
              {message}
            </Typography>
          </Box>

          {/* Close Button */}
          {onClose && (
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                },
                flexShrink: 0,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Fade>
    </Snackbar>
  );
};

export default SimpleToast;