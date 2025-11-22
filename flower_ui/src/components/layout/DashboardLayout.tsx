import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import api from '../../api/axiosClient';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 定义导航菜单
  const menuItems = [
    { label: 'Dashboard', value: '/dashboard', icon: <DashboardIcon /> },
    { label: '商品管理', value: '/products', icon: <InventoryIcon /> },
    { label: '订单管理', value: '/orders', icon: <ShoppingBasketIcon /> },
    { label: '配送管理', value: '/delivery', icon: <DeliveryDiningIcon /> },
  ];

  const handleLogout = () => {
    // 清除本地存储的 token
    localStorage.removeItem('flower_token');
    // 移除 axios 默认 Authorization 头
    try {
      // @ts-ignore
      if (api?.defaults?.headers?.common?.Authorization) {
        // 删除该头部，避免后续请求携带旧 token
        delete (api as any).defaults.headers.common['Authorization'];
      }
    } catch (e) {
      // 忽略清理错误
    }
    // 跳转到登录页
    navigate('/admin/login', { replace: true });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8F6F0 0%, #FAF6F2 100%)',
    }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1B3A2B 0%, #0F1F0F 100%)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        <Toolbar sx={{ flexDirection: 'column', alignItems: 'stretch', py: 1 }}>
          {/* Top Row - Logo and Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="small"
                sx={{
                  mr: 2,
                  background: 'rgba(212, 175, 55, 0.2)',
                  color: '#D4AF37',
                  '&:hover': {
                    background: 'rgba(212, 175, 55, 0.3)',
                  }
                }}
              >
                <LocalFloristIcon />
              </IconButton>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  letterSpacing: 1,
                  color: '#F8F6F0', // 明亮的珍珠白色
                }}
              >
                花言花语 · 管理后台
              </Typography>
            </Box>
            <Button
              onClick={handleLogout}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                background: 'rgba(212, 175, 55, 0.2)',
                color: '#F8F6F0', // 同样使用珍珠白色
                px: 2,
                py: 1,
                borderRadius: 1,
                '&:hover': {
                  background: 'rgba(212, 175, 55, 0.3)',
                }
              }}
            >
              退出登录
            </Button>
          </Box>

          {/* Navigation Tabs */}
          <Box sx={{ width: '100%' }}>
            <Tabs
              value={location.pathname}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="inherit"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#D4AF37',
                  height: 3,
                },
                '& .MuiTab-root': {
                  color: 'rgba(248, 246, 240, 0.7)',
                  minWidth: 100,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  '&:hover': {
                    color: '#F8F6F0',
                  },
                  '&.Mui-selected': {
                    color: '#F8F6F0',
                  },
                },
              }}
            >
              {menuItems.map((item) => (
                <Tab
                  key={item.value}
                  value={item.value}
                  label={item.label}
                  icon={item.icon}
                  iconPosition="start"
                  sx={{
                    minHeight: 48,
                  }}
                />
              ))}
            </Tabs>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component={motion.main}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
