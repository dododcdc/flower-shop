import React, { useState } from 'react'
import { Form, Input, Button, message, Spin, Card } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { LoginRequest } from '../types'

const LoginPage: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (values: LoginRequest) => {
    setLoading(true)
    try {
      const response = await authService.login(values)
      const { data } = response

      // 保存认证信息
      authService.saveAuthInfo(data)

      // 更新全局状态
      login({
        id: data.userId,
        username: data.username,
        role: data.role,
        email: data.email,
        phone: data.phone
      }, data.token)

      message.success('登录成功！')
      navigate('/admin')
    } catch (error: any) {
      message.error(error.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-form">
        <div className="login-title">
          <h2>🌺 【花言花语】</h2>
          <p>管理员登录</p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
          initialValues={{
            username: 'floweradmin',
            password: 'flower123'
          }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link to="/admin/init">首次使用？初始化系统</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage