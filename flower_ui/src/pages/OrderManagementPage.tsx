import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssessmentIcon from '@mui/icons-material/Assessment';

const OrderManagementPage: React.FC = () => {
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
          订单管理
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          处理客户订单和配送安排
        </Typography>
      </motion.div>

      {/* Function Cards */}
      <Grid container spacing={3}>
        {[
          {
            title: '新建订单',
            description: '为客户创建新的花卉订单',
            icon: <ShoppingBasketIcon />,
            color: 'primary',
          },
          {
            title: '订单查询',
            description: '查看和搜索客户订单信息',
            icon: <ReceiptIcon />,
            color: 'info',
          },
          {
            title: '配送管理',
            description: '安排订单配送和物流跟踪',
            icon: <LocalShippingIcon />,
            color: 'success',
          },
          {
            title: '数据统计',
            description: '分析销售数据和订单趋势',
            icon: <AssessmentIcon />,
            color: 'warning',
          },
        ].map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
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
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: `${feature.color}.main`,
                        color: 'white',
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card
          sx={{
            mt: 4,
            background: 'rgba(212, 175, 55, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <CardContent>
            <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
              📝 功能说明
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', lineHeight: 1.6 }}>
              订单管理功能正在开发中，后续将提供完整的订单处理、状态跟踪、客户通知等功能。
              敬请期待！
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default OrderManagementPage;