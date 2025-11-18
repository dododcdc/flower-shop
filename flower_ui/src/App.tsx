import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './App.css'

// 页面组件
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

// 布局组件
import ProtectedRoute from './components/layout/ProtectedRoute'

// Store
import { useAuthStore } from './store/authStore'

// 创建Material UI主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#43a047', // 柔和的绿，舒适不刺眼
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    secondary: {
      main: '#ff7043', // 温暖的橙，作为点缀
      light: '#ff8a65',
      dark: '#f4511e',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover fieldset': {
              borderColor: '#43a047',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2e7d32',
            },
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: '0.4em',
          scrollbarColor: '#a3a3a3',
          '&::-webkit-scrollbar': {
            width: '0.4em',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#a3a3a3',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#7a7a7a',
          },
        },
      },
    },
  },
})

function App() {
  const { checkAuth } = useAuthStore()

  // 应用启动时检查认证状态
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* 登录页面 - 公开访问 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 受保护的路由 */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 其他受保护的路由 */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <div>订单管理页面（待实现）</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <div>客户管理页面（待实现）</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <div>商品管理页面（待实现）</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <div>数据分析页面（待实现）</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div>系统设置页面（待实现）</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>个人信息页面（待实现）</div>
              </ProtectedRoute>
            }
          />

          {/* 根路径重定向 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404页面重定向 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
