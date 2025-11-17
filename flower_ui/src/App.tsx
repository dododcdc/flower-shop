import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout, ConfigProvider, theme } from 'antd'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import authService from './services/authService'
import InitPage from './pages/InitPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import PublicShop from './pages/PublicShop'
import './App.css'

const { Header, Content } = Layout

function App() {
  const { user, isLoggedIn, login, logout, setLoading } = useAuthStore()

  // 应用启动时检查登录状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true)

        // 检查系统是否需要初始化
        const initResponse = await authService.checkInitialization()

        if (!initResponse.data) {
          // 系统未初始化
          setLoading(false)
          return
        }

        // 系统已初始化，检查本地是否有登录信息
        const savedUser = authService.getCurrentUserFromStorage()
        const token = authService.getToken()

        if (savedUser && token) {
          login(savedUser, token)
        }
      } catch (error) {
        console.error('检查认证状态失败:', error)
        authService.clearAuthInfo()
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  // 管理员路由保护
  const renderProtectedRoute = (element: React.ReactNode) => {
    if (isLoggedIn && user?.role === 'ADMIN') {
      return (
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: '#ff6b6b',
              borderRadius: 8,
            }
          }}
        >
          <Layout style={{ minHeight: '100vh' }}>
            <Header className="flower-header">
              <div className="flower-title">🌺 花言花语</div>
              <div className="flower-subtitle">管理员控制台</div>
            </Header>
            <Content style={{ padding: '24px' }}>
              {element}
            </Content>
          </Layout>
        </ConfigProvider>
      )
    }
    return <LoginPage />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicShop />} />
        <Route path="/admin/init" element={<InitPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/*" element={renderProtectedRoute(<Dashboard />)} />
      </Routes>
    </Router>
  )
}

export default App