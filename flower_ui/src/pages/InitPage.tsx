import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, message, Spin } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { authService } from '../services/authService'
import { AdminInitRequest } from '../types'
import { useNavigate } from 'react-router-dom'

const InitPage: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await authService.checkInitialization()
        if (response.data) {
          // 系统已初始化，跳转到登录页
          navigate('/admin/login')
        }
      } catch (error) {
        message.error('检查系统状态失败')
      } finally {
        setInitializing(false)
      }
    }

    checkSystemStatus()
  }, [navigate])

  const handleSubmit = async (values: AdminInitRequest) => {
    setLoading(true)
    try {
      await authService.initializeAdmin(values)
      message.success('管理员初始化成功！请登录')
      navigate('/admin/login')
    } catch (error: any) {
      message.error(error.message || '初始化失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (initializing) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="login-container">
      <Card className="login-form">
        <div className="init-form">
          <div className="login-title">
            <h2>🌺 【花言花语】管理员初始化</h2>
            <p>首次使用需要创建管理员账号</p>
          </div>

          <Form
            form={form}
            name="admin_init"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, max: 20, message: '用户名长度在3-20个字符之间' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="请输入邮箱"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: '请输入电话号码' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="请输入电话号码"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, max: 20, message: '密码长度在6-20个字符之间' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }: { getFieldValue: (name: string) => string }) => ({
                  validator: (_: any, value: string) => {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  }
                })
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请确认密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                初始化管理员
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  )
}

export default InitPage