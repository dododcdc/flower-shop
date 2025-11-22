import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const DashboardPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
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
          花语心声管理后台
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          欢迎回到优雅花园管理中心
        </Typography>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        {[
          { title: '今日订单', value: '28', icon: <LocalFloristIcon />, color: 'primary' },
          { title: '总销售额', value: '¥12,580', icon: <ShoppingCartIcon />, color: 'success' },
          { title: '客户数量', value: '156', icon: <PeopleIcon />, color: 'info' },
          { title: '月增长率', value: '+23%', icon: <TrendingUpIcon />, color: 'warning' },
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

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card
          sx={{
            mt: 4,
            background: 'rgba(248, 246, 240, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          <CardContent>
            <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
              最近动态
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                '新订单 #12345 - 玫瑰花束 x1',
                '客户张三下单成功',
                '库存警告: 红玫瑰剩余不足',
                '新用户注册: 李四',
              ].map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    backgroundColor: 'rgba(212, 175, 55, 0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(212, 175, 55, 0.1)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    {activity}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default DashboardPage;
