import React, { useEffect, useState } from 'react'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Stack,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material'
import {
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  LocalFlorist as FlowerIcon,
  ShoppingCart as OrderIcon,
  Assessment as AnalyticsIcon,
  People as UsersIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  Notifications as NotificationsIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface DashboardStats {
  totalOrders: number
  newOrders: number
  totalUsers: number
  activeUsers: number
  revenue: number
  growth: number
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    newOrders: 0,
    totalUsers: 0,
    activeUsers: 0,
    revenue: 0,
    growth: 0,
  })

  // 模拟加载统计数据
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        totalOrders: 1256,
        newOrders: 89,
        totalUsers: 543,
        activeUsers: 234,
        revenue: 45678,
        growth: 12.5,
      })
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // 用户菜单处理
  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleUserMenuClose()
    logout()
    navigate('/login')
  }

  // 统计卡片组件
  const StatCard: React.FC<{
    title: string
    value: string | number
    subtitle?: string
    icon: React.ReactNode
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
    trend?: number
  }> = ({ title, value, subtitle, icon, color, trend }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          {trend !== undefined && (
            <Chip
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              color={trend > 0 ? 'success' : 'error'}
              size="small"
              icon={<TrendingUpIcon />}
            />
          )}
        </Box>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 顶部栏 */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(237, 108, 2, 0.1) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FlowerIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                🌺 花言花语管理后台
              </Typography>
              <Typography variant="body2" color="text.secondary">
                欢迎回来，{user?.username || '管理员'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={handleUserMenuClick}
              sx={{ ml: 1 }}
            >
              <MoreVertIcon />
            </IconButton>

            {/* 用户菜单 */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              onClick={handleUserMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => navigate('/profile')}>
                <PersonIcon sx={{ mr: 2 }} />
                个人信息
              </MenuItem>
              <MenuItem onClick={() => navigate('/settings')}>
                <SettingsIcon sx={{ mr: 2 }} />
                系统设置
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 2 }} />
                退出登录
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Paper>

      {/* 统计卡片 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <StatCard
          title="总订单数"
          value={loading ? '---' : stats.totalOrders.toLocaleString()}
          subtitle="累计订单数量"
          icon={<OrderIcon />}
          color="primary"
          trend={8.2}
        />
        <StatCard
          title="今日新订单"
          value={loading ? '---' : stats.newOrders}
          subtitle="24小时内新增"
          icon={<CelebrationIcon />}
          color="success"
          trend={12.5}
        />
        <StatCard
          title="总用户数"
          value={loading ? '---' : stats.totalUsers.toLocaleString()}
          subtitle="注册用户总数"
          icon={<UsersIcon />}
          color="secondary"
          trend={5.8}
        />
        <StatCard
          title="营业收入"
          value={loading ? '---' : `¥${stats.revenue.toLocaleString()}`}
          subtitle="本月收入"
          icon={<AnalyticsIcon />}
          color="warning"
          trend={15.3}
        />
      </Box>

      {/* 主要内容区域 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        {/* 欢迎卡片 */}
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              👋 欢迎使用花言花语管理系统
            </Typography>
            <Typography variant="body1" paragraph>
              这是一个简洁高效的花店管理平台，帮助您更好地管理业务流程。
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                • 实时订单管理和追踪
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 客户关系管理
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 库存和财务管理
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 数据分析和报表
              </Typography>
            </Stack>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                startIcon={<AnalyticsIcon />}
                onClick={() => navigate('/analytics')}
              >
                查看详细报表
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 快速操作 */}
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              ⚡ 快速操作
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<OrderIcon />}
                onClick={() => navigate('/orders')}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                创建新订单
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<UsersIcon />}
                onClick={() => navigate('/customers')}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                添加客户信息
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FlowerIcon />}
                onClick={() => navigate('/products')}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                管理商品库存
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/settings')}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                系统设置
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* 系统状态 */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            📊 系统状态概览
          </Typography>
          {loading ? (
            <LinearProgress sx={{ mt: 2 }} />
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mt: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  服务器状态
                </Typography>
                <Chip label="正常运行" color="success" size="small" sx={{ mt: 1 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  数据库连接
                </Typography>
                <Chip label="连接正常" color="success" size="small" sx={{ mt: 1 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  缓存状态
                </Typography>
                <Chip label="缓存更新" color="warning" size="small" sx={{ mt: 1 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  最后备份
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  2小时前
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}

export default DashboardPage