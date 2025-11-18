import { useState, useEffect, useRef } from 'react'
import {
  TextField,
  Button,
  Box,
  Stack,
  Alert,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  Lock as LockIcon,
} from '@mui/icons-material'
import { useAuthStore } from '../../store/authStore'
import type { FormErrors } from '../../types/auth'

interface LoginFormProps {
  onSuccess?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  // 状态管理
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Zustand store
  const { isLoading, error, clearError } = useAuthStore()
  const login = useAuthStore((state) => state.login)

  // Refs
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // 自动聚焦用户名输入框
  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus()
    }
  }, [])

  // 清除store错误信息
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 用户名验证
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空'
    } else if (formData.username.trim().length < 3) {
      newErrors.username = '用户名至少需要3个字符'
    } else if (formData.username.trim().length > 20) {
      newErrors.username = '用户名不能超过20个字符'
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = '密码不能为空'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符'
    } else if (formData.password.length > 50) {
      newErrors.password = '密码不能超过50个字符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 输入框值变更处理
  const handleInputChange = (field: 'username' | 'password') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }))

    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }))
    }

    // 清除提交错误
    if (errors.submit) {
      setErrors(prev => ({
        ...prev,
        submit: undefined,
      }))
    }
  }

  // 切换密码显示状态
  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  // 键盘事件处理
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSubmit(event as any)
    }
  }

  // 表单提交处理
  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault()
    }

    // 验证表单
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // 调用登录函数
      await login({ username: formData.username.trim(), password: formData.password })

      // 登录成功
      console.log('登录成功')
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      // 设置错误信息
      const errorMessage = error instanceof Error ? error.message : '登录失败，请稍后重试'
      setErrors(prev => ({
        ...prev,
        submit: errorMessage,
      }))

      // 聚焦到第一个错误字段
      if (errors.username) {
        usernameRef.current?.focus()
      } else if (errors.password) {
        passwordRef.current?.focus()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 检查是否正在加载
  const isProcessing = isLoading || isSubmitting

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{
        width: '100%',
        maxWidth: 400,
      }}
    >
      {/* 错误提示 */}
      {(error || errors.submit) && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => {
            clearError()
            setErrors(prev => ({ ...prev, submit: undefined }))
          }}
        >
          {error || errors.submit}
        </Alert>
      )}

      {/* 用户名输入框 */}
      <TextField
        inputRef={usernameRef}
        fullWidth
        label="用户名"
        variant="outlined"
        margin="normal"
        required
        autoComplete="username"
        autoFocus
        disabled={isProcessing}
        value={formData.username}
        onChange={handleInputChange('username')}
        onKeyDown={handleKeyDown}
        error={!!errors.username}
        helperText={errors.username}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle color="action" />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* 密码输入框 */}
      <TextField
        inputRef={passwordRef}
        fullWidth
        label="密码"
        type={showPassword ? 'text' : 'password'}
        variant="outlined"
        margin="normal"
        required
        autoComplete="current-password"
        disabled={isProcessing}
        value={formData.password}
        onChange={handleInputChange('password')}
        onKeyDown={handleKeyDown}
        error={!!errors.password}
        helperText={errors.password}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  disabled={isProcessing}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {/* 登录按钮 */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        loading={isProcessing}
        loadingPosition="start"
        disabled={isProcessing}
        sx={{
          mt: 3,
          mb: 2,
          height: 48,
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        {isProcessing ? '登录中...' : '登录'}
      </Button>

      {/* 加载状态下的循环进度指示器 */}
      {isProcessing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
            正在验证身份信息...
          </Typography>
        </Box>
      )}

      {/* 操作提示 */}
      <Stack spacing={1} sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          提示：用户名至少3个字符，密码至少6个字符
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          按 Enter 键可快速提交登录
        </Typography>
      </Stack>
    </Box>
  )
}

export default LoginForm