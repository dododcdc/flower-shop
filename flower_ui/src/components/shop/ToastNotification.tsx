import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastProps {
  open: boolean;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose?: () => void;
  duration?: number;
}

const ToastNotification: React.FC<ToastProps> = ({
  open,
  message,
  type = 'success',
  onClose,
  duration = 3000,
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    setIsVisible(open);

    if (open && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon />;
      case 'info':
      case 'warning':
      case 'error':
      default:
        return <CartIcon />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#4CAF50',
          color: 'white',
          border: '#45A049',
        };
      case 'info':
        return {
          bg: '#2196F3',
          color: 'white',
          border: '#1976D2',
        };
      case 'warning':
        return {
          bg: '#FF9800',
          color: 'white',
          border: '#F57C00',
        };
      case 'error':
        return {
          bg: '#F44336',
          color: 'white',
          border: '#D32F2F',
        };
      default:
        return {
          bg: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          border: theme.palette.primary.dark,
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            top: 80,
            right: 20,
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              minWidth: 280,
              maxWidth: 400,
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              border: `1px solid ${colors.border}`,
              background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.border} 100%)`,
              color: colors.color,
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
                transform: 'translateX(-100%)',
                transition: 'transform 0.3s ease',
              },
              '&:hover': {
                transform: 'scale(1.02)',
                '&::before': {
                  transform: 'translateX(0)',
                },
              },
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
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
                onClick={onClose}
                sx={{
                  color: colors.color,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  },
                  ml: 1,
                  flexShrink: 0,
                }}
              >
                ×
              </IconButton>
            )}

            {/* Progress Bar */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: 3,
                bgcolor: 'rgba(255,255,255,0.3)',
                borderRadius: '0 0 2px 2px',
              }}
            >
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                style={{
                  height: '100%',
                  bgcolor: 'rgba(255,255,255,0.8)',
                  borderRadius: '0 0 2px 2px',
                }}
              />
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 全局Toast管理器
class ToastManager {
  private static instance: ToastManager;
  private toastQueue: Array<{ id: string; props: ToastProps }> = [];
  private currentToast: { id: string; props: ToastProps } | null = null;

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  show(message: string, type: ToastProps['type'] = 'success', duration?: number): string {
    const id = Date.now().toString();
    const toastProps: ToastProps = {
      open: true,
      message,
      type,
      duration,
      onClose: () => this.remove(id),
    };

    this.toastQueue.push({ id, props: toastProps });
    this.processQueue();

    return id;
  }

  remove(id: string): void {
    this.toastQueue = this.toastQueue.filter(toast => toast.id !== id);
    if (this.currentToast?.id === id) {
      this.currentToast = null;
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.currentToast || this.toastQueue.length === 0) {
      return;
    }

    const nextToast = this.toastQueue[0];
    this.currentToast = nextToast;
  }
}

// Hook for using Toast
export const useToast = () => {
  const manager = ToastManager.getInstance();

  const showSuccess = (message: string, duration?: number) =>
    manager.show(message, 'success', duration);

  const showError = (message: string, duration?: number) =>
    manager.show(message, 'error', duration);

  const showInfo = (message: string, duration?: number) =>
    manager.show(message, 'info', duration);

  const showWarning = (message: string, duration?: number) =>
    manager.show(message, 'warning', duration);

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};

export default ToastNotification;
export { ToastManager };