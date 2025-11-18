import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  CssBaseline,
  CircularProgress,
} from '@mui/material'
import {
  LocalFlorist as FlowerIcon,
  Spa as SpaIcon,
} from '@mui/icons-material'
import { useAuthStore } from '../store/authStore'
import LoginForm from '../components/auth/LoginForm'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuthStore()

  // 获取重定向来源
  const from = location.state?.from?.pathname || '/dashboard'

  // 如果已认证，重定向到目标页面
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  // 显示加载状态
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            正在验证登录状态...
          </Typography>
        </Box>
      </Box>
    )
  }

  // 如果已认证，显示加载状态（上面的useEffect会处理重定向）
  if (isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            正在跳转到管理页面...
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          px: 2,
          backgroundColor: '#e8f5e9',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg opacity='0.15'%3E%3Ctext x='25' y='60' font-size='60' text-anchor='middle' dominant-baseline='middle'%3E🌺%3C/text%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
          position: 'relative',
        }}
      >
        {/* 半透明叠加层 */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            zIndex: 0,
          }}
        />
        {/* 内容容器 */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
        {/* 登录卡片 */}
        <Card
          sx={{
            width: '100%',
            maxWidth: 450,
            boxShadow: 6,
            borderRadius: 3,
            overflow: 'visible',
            position: 'relative',
          }}
        >
          {/* 顶部装饰 */}
          <Box
            sx={{
              position: 'absolute',
              top: -30,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
            }}
          >
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'primary.main',
                boxShadow: 3,
                border: '3px solid white',
              }}
            >
              <FlowerIcon sx={{ fontSize: 30 }} />
            </Avatar>
          </Box>

          <CardContent sx={{ pt: 5, px: 4, pb: 4 }}>
            {/* 标题区域 */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                component="h1"
                variant="h4"
                color="primary"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                🌺 花言花语
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                管理员登录
              </Typography>
              <Typography variant="body2" color="text.secondary">
                请输入您的管理员账户信息
              </Typography>
            </Box>

            {/* 登录表单 */}
            <LoginForm
              onSuccess={() => {
                console.log('登录成功，准备跳转到:', from)
                navigate(from, { replace: true })
              }}
            />

            {/* 底部信息 */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                © 2024 花言花语管理系统
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <SpaIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                <Typography variant="caption" color="text.secondary">
                  用心经营每一份美好
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        </Box>
      </Box>
    </>
  )
}

export default LoginPage
