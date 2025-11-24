import React, { Component, ErrorInfo, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Storage } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    this.setState({
      error,
      errorInfo
    });

    // 开发环境输出详细错误信息
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // 生产环境可以发送错误到监控服务
    if (import.meta.env.PROD) {
      // 这里可以集成错误监控服务，如 Sentry
      // logErrorToService(error, errorInfo);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false });
    window.location.href = '/admin/login';
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误页面
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            background: 'linear-gradient(135deg, #f8f6f0 0%, #fefefe 100%)',
          }}
        >
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            sx={{
              textAlign: 'center',
              maxWidth: 500,
            }}
          >
            {/* 错误图标 */}
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
              }}
              transition={{
                duration: 0.6,
                delay: 0.2,
              }}
            >
              <Storage
                sx={{
                  fontSize: 64,
                  color: 'primary.main',
                  mb: 2,
                }}
              />
            </motion.div>

            {/* 错误标题 */}
            <Typography
              variant="h4"
              component="h1"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              系统遇到了一点问题
            </Typography>

            {/* 错误描述 */}
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                color: 'text.secondary',
                lineHeight: 1.6,
              }}
            >
              抱歉，系统遇到了意外错误。我们已经记录了这个问题，
              您可以尝试刷新页面或返回登录页。
            </Typography>

            {/* 开发环境显示错误详情 */}
            {import.meta.env.DEV && this.state.error && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  textAlign: 'left',
                  maxHeight: 200,
                  overflow: 'auto',
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  错误详情 (开发环境):
                </Typography>
                <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                  {this.state.error.message}
                </Typography>
              </Box>
            )}

            {/* 操作按钮 */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
              <Button
                variant="contained"
                onClick={this.handleReload}
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                刷新页面
              </Button>
              <Button
                variant="outlined"
                onClick={this.handleGoHome}
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                返回登录
              </Button>
            </Box>

            {/* 联系信息 */}
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                fontSize: '0.875rem',
              }}
            >
              如果问题持续存在，请联系技术支持
            </Typography>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;