import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    Link,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import ShopLayout from '../../components/shop/ShopLayout';
import { userAPI } from '../../api/userAPI';
import { useAuthStore } from '../../store/authStore';

const UserLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { setToken, setUser } = useAuthStore();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('请输入用户名和密码');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await userAPI.login({ username, password });

            setToken(data.token);
            setUser({
                id: data.userId,
                username: data.username,
                role: data.role,
                email: data.email || null,
                phone: data.phone || null,
                lastLogin: data.lastLogin || null
            });

            enqueueSnackbar('登录成功！', { variant: 'success' });
            navigate('/shop');
        } catch (err: any) {
            console.error('登录失败:', err);
            setError(err.response?.data?.message || '登录失败，请检查用户名和密码');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ShopLayout>
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Paper
                    elevation={3}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{ p: 4, borderRadius: 2 }}
                >
                    <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1B3A2B' }}>
                        用户登录
                    </Typography>
                    <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                        欢迎回到花言花语
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label="用户名"
                            variant="outlined"
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="密码"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 4,
                                mb: 2,
                                bgcolor: '#1B3A2B',
                                '&:hover': {
                                    bgcolor: '#14291F',
                                },
                            }}
                        >
                            {loading ? '登录中...' : '登录'}
                        </Button>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                还没有账号？
                            </Typography>
                            <Link component={RouterLink} to="/register" variant="body2" underline="hover">
                                立即注册
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </ShopLayout>
    );
};

export default UserLoginPage;
