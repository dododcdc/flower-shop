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
    IconButton,
    Grid
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import ShopLayout from '../../components/shop/ShopLayout';
import { userAPI } from '../../api/userAPI';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        phone: '',
        email: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // 基本验证
        if (formData.password !== formData.confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }
        if (formData.password.length < 6) {
            setError('密码长度至少需要6位');
            return;
        }
        if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
            setError('请输入正确的手机号码');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await userAPI.register({
                username: formData.username,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                phone: formData.phone,
                email: formData.email
            });

            enqueueSnackbar('注册成功！请登录', { variant: 'success' });
            navigate('/login');
        } catch (err: any) {
            console.error('注册失败:', err);
            setError(err.response?.data?.message || '注册失败，请稍后重试');
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
                        注册账号
                    </Typography>
                    <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                        加入花言花语，开启美好生活
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleRegister}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="用户名"
                                    name="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    helperText="4-20位字符，支持字母、数字、下划线"
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="手机号码"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="电子邮箱"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="密码"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
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
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="确认密码"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>

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
                            {loading ? '注册中...' : '立即注册'}
                        </Button>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                已有账号？
                            </Typography>
                            <Link component={RouterLink} to="/login" variant="body2" underline="hover">
                                去登录
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </ShopLayout>
    );
};

export default RegisterPage;
