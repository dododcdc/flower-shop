import React from 'react'
import { Layout, Menu, Button, Card, Typography, Row, Col, Avatar, Dropdown } from 'antd'
import { UserOutlined, LogoutOutlined, ShopOutlined, ShoppingCartOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const { Header, Content, Sider } = Layout
const { Title, Text } = Typography

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const menuItems = [
    {
      key: '/admin',
      icon: <ShopOutlined />,
      label: '商品管理',
    },
    {
      key: '/admin/orders',
      icon: <ShoppingCartOutlined />,
      label: '订单管理',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人信息',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      handleLogout()
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light">
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={5} style={{ margin: 0, color: '#ff6b6b' }}>🌺 花言花语</Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={4} style={{ margin: 0, color: '#333' }}>
            欢迎回来，{user?.username}！
          </Title>

          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleMenuClick,
            }}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<Avatar icon={<UserOutlined />} size="small" />}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {user?.username}
            </Button>
          </Dropdown>
        </Header>

        <Content style={{ margin: '24px 16px', background: '#fff', padding: '24px', borderRadius: '8px' }}>
          <div className="dashboard-content">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌹</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>
                      统计数据
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#feca57' }}>
                      待处理订单
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#48dbfb' }}>
                      今日收入
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📦</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9ff3' }}>
                      库存预警
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <div style={{ marginTop: '32px' }}>
              <Title level={5}>快速操作</Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<ShopOutlined />}
                    onClick={() => navigate('/admin')}
                  >
                    管理商品
                  </Button>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Button
                    size="large"
                    block
                    icon={<ShoppingCartOutlined />}
                    onClick={() => navigate('/admin/orders')}
                  >
                    查看订单
                  </Button>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Button
                    size="large"
                    block
                    icon={<SettingOutlined />}
                    onClick={() => navigate('/admin/settings')}
                  >
                    系统设置
                  </Button>
                </Col>
              </Row>
            </div>

            <div style={{ marginTop: '32px' }}>
              <Title level={5}>系统信息</Title>
              <Card size="small">
                <Row gutter={16}>
                  <Col span={8}>
                    <Text strong>管理员:</Text> {user?.username}
                  </Col>
                  <Col span={8}>
                    <Text strong>角色:</Text> {user?.role === 'ADMIN' ? '管理员' : '用户'}
                  </Col>
                  <Col span={8}>
                    <Text strong>邮箱:</Text> {user?.email}
                  </Col>
                  <Col span={8} style={{ marginTop: '16px' }}>
                    <Text strong>电话:</Text> {user?.phone}
                  </Col>
                </Row>
              </Card>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default Dashboard