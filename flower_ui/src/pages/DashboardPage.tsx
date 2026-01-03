import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import YardIcon from '@mui/icons-material/Yard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningIcon from '@mui/icons-material/Warning';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardAPI } from '../api/dashboardAPI';

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [orderDistribution, setOrderDistribution] = useState<any[]>([]);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, distributionData, trendData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getOrderDistribution(),
        dashboardAPI.getSalesTrend(),
      ]);

      setStats(statsData);
      setOrderDistribution(distributionData);
      setSalesTrend(trendData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `¥${price.toFixed(2)}`;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: '#FF9800',
      PREPARING: '#2196F3',
      DELIVERING: '#9C27B0',
      COMPLETED: '#4CAF50',
      CANCELLED: '#9E9E9E',
    };
    return colors[status] || '#9E9E9E';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 1,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1B3A2B 0%, #2C5F3C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          花言花语管理后台
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          欢迎回到优雅花园管理中心
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        {[
          {
            title: '今日订单',
            value: stats?.todayOrderCount || 0,
            icon: <YardIcon />,
            color: 'primary',
          },
          {
            title: '今日销售额',
            value: formatPrice(stats?.todaySalesAmount || 0),
            icon: <ShoppingCartIcon />,
            color: 'success',
          },
          {
            title: '待处理订单',
            value: stats?.pendingOrderCount || 0,
            icon: <ScheduleIcon />,
            color: 'warning',
          },
          {
            title: '低库存商品',
            value: stats?.lowStockCount || 0,
            icon: <WarningIcon />,
            color: 'error',
          },
        ].map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(248, 246, 240, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${stat.color}.main`,
                        color: 'white',
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card
              sx={{
                height: '400px',
                background: 'rgba(248, 246, 240, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
              }}
            >
              <CardContent>
                <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
                  订单状态分布
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ statusText, count }) => `${statusText}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {orderDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card
              sx={{
                height: '400px',
                background: 'rgba(248, 246, 240, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
              }}
            >
              <CardContent>
                <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
                  最近7天销售趋势
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatPrice(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      name="销售额"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
