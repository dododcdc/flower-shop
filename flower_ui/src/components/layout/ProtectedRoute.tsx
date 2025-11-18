import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuthStore } from '../../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallbackPath?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const location = useLocation()

  // 检查认证状态
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // 显示加载状态
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          正在验证身份...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          请稍候，我们正在确认您的登录状态
        </Typography>
      </Box>
    )
  }

  // 未认证时重定向到登录页
  if (!isAuthenticated) {
    // 保存当前路径，登录后可以重定向回来
    const redirectState = {
      from: {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
    }

    return (
      <Navigate
        to={fallbackPath}
        state={redirectState}
        replace
      />
    )
  }

  // 已认证，渲染子组件
  return <>{children}</>
}

export default ProtectedRoute