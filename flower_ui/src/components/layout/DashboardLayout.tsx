import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useNavigate, useLocation } from 'react-router-dom';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import LogoutIcon from '@mui/icons-material/Logout';
import api, { AxiosInstance } from '../../api/axiosClient';
import { STORAGE_KEYS } from '../../constants';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 定义导航菜单
  const menuItems = [
    { label: 'Dashboard', value: '/dashboard', icon: <DashboardIcon /> },
    { label: '商品管理', value: '/products', icon: <InventoryIcon /> },
    { label: '订单管理', value: '/orders', icon: <ShoppingBasketIcon /> },
  ];

  const handleLogout = () => {
    // 清除本地存储的 token
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);

    // 移除 axios 默认 Authorization 头
    try {
      const axiosInstance = api as AxiosInstance;
      if (axiosInstance.defaults?.headers?.common?.Authorization) {
        // 删除该头部，避免后续请求携带旧 token
        delete axiosInstance.defaults.headers.common['Authorization'];
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
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
          {/* Left side - Logo and Title */}
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
                mr: 3
              }}
            >
              花言花语 · 管理后台
            </Typography>

            {/* Navigation Tabs inline with title */}
            <Tabs
              value={location.pathname}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="inherit"
              sx={{
                flex: 1,
                '& .MuiTabs-indicator': {
                  backgroundColor: '#D4AF37',
                  height: 3,
                },
                '& .MuiTab-root': {
                  color: 'rgba(248, 246, 240, 0.7)',
                  minWidth: 80,
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
                    minHeight: 40,
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Right side - Logout button */}
          <Tooltip title="退出登录" arrow>
            <IconButton
              onClick={handleLogout}
              sx={{
                background: 'rgba(244, 67, 54, 0.15)',
                color: '#FFCDD2',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                p: 1,
                '&:hover': {
                  background: 'rgba(244, 67, 54, 0.25)',
                  borderColor: 'rgba(244, 67, 54, 0.5)',
                }
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 1, sm: 1.5 },
          minHeight: 'calc(100vh - 64px)',
          background: 'linear-gradient(135deg, #F8F6F0 0%, #FAF6F2 100%)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
