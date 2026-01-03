import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { motion } from 'framer-motion';
import { login } from '../../api/authAPI';
import type { LoginRequest } from '../../models/auth';
import { STORAGE_KEYS } from '../../constants';
import FlowerLogo from '../common/FlowerLogo';
import FlowerPattern from '../common/FlowerPattern';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('floweradmin');
  const [password, setPassword] = useState('flower123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login({ username, password });
      if (res?.token) {
        // Token is already stored in authAPI.login function
        window.location.href = '/admin/dashboard';
      } else {
        setError('用户名或密码错误，请重试');
      }
    } catch {
      setError('登录失败，请检查凭证');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      sx={{
        position: 'relative',
        overflow: 'visible',
        background: 'rgba(248, 246, 240, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.1)',
        width: { xs: '95%', sm: 450, md: 500 },
        maxWidth: 500,
        mx: 'auto',
      }}
    >
      {/* Decorative Patterns */}
      <FlowerPattern position="top-left" size={120} />
      <FlowerPattern position="top-right" size={120} />
      <FlowerPattern position="bottom-left" size={120} />
      <FlowerPattern position="bottom-right" size={120} />

      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        {/* Logo Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            position: 'relative'
          }}
        >
          <FlowerLogo size={{ xs: 70, sm: 80, md: 100 }} />
        </Box>

        {/* Title Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          sx={{ textAlign: 'center', mb: 3 }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              mb: 1,
              fontWeight: 700,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              background: 'linear-gradient(135deg, #1B3A2B 0%, #2C5F3C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.2,
            }}
          >
            花言花语
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 2,
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              letterSpacing: 1,
            }}
          >
            LUXURY FLORAL BOUTIQUE
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#666666',
              fontStyle: 'italic',
              lineHeight: 1.6,
            }}
          >
            欢迎回到优雅花园，请使用管理员账号进入后台系统
          </Typography>
        </Box>

        {/* Form Section */}
        <Box
          component={motion.form}
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          sx={{ mt: 3 }}
        >
          <TextField
            fullWidth
            label="管理员账号"
            value={username}
            onChange={e => setUsername(e.target.value)}
            margin="normal"
            required
            autoComplete="username"
            autoFocus
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="密码"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="current-password"
            sx={{ mb: 2 }}
          />

          {/* Error Message */}
          {error && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography
                color="error"
                variant="body2"
                sx={{
                  mt: 1,
                  mb: 2,
                  p: 1.5,
                  backgroundColor: 'rgba(232, 180, 184, 0.1)',
                  borderRadius: 1,
                  border: '1px solid rgba(232, 180, 184, 0.3)',
                  textAlign: 'center',
                }}
              >
                {error}
              </Typography>
            </Box>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            component={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'none',
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component={motion.div}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  sx={{
                    width: 20,
                    height: 20,
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                  }}
                />
                验证中...
              </Box>
            ) : (
              '进入花园'
            )}
          </Button>

          {/* Decorative Divider */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            my: 2,
            gap: 1,
          }}>
            <Box sx={{
              flex: 1,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)'
            }} />
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
              ✨
            </Typography>
            <Box sx={{
              flex: 1,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)'
            }} />
          </Box>

          {/* Footer Text */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              display: 'block',
              fontStyle: 'italic',
              opacity: 0.7,
            }}
          >
            © 2024 花言花语 - 传递美好，绽放生活
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
