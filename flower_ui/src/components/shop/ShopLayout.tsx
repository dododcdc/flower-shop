import React, { ReactNode, useRef, useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Chip,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ShoppingBasket,
  Receipt,
  AccountCircle,
  Login,
  Menu as MenuIcon,
  Home,
  Store,
  ChevronRight,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import CartDrawer from './CartDrawer';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

interface ShopLayoutProps {
  children: ReactNode;
  onCartUpdate?: (trigger: boolean, productInfo?: { name?: string; image?: string }) => void;
}

const ShopLayout: React.FC<ShopLayoutProps> = ({ children, onCartUpdate }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook for checking current path
  const { totalItems, openCart } = useCartStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 获取用户认证状态
  const { user, logout, guestId, setGuestId } = useAuthStore();
  const isLoggedIn = !!user;

  // 自动为新用户设置游客身份
  useEffect(() => {
    // 如果既没有登录，也没有游客身份，则自动生成游客ID
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    if (!isLoggedIn && !guestId && !isAuthPage) {
      // 自动生成游客ID
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setGuestId(`游客${randomId}`);
    }
  }, [isLoggedIn, guestId, location.pathname, setGuestId]);

  const handleLogoClick = () => {
    navigate('/shop');
  };

  const handleCartClick = () => {
    openCart();
  };

  // 用户菜单相关
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(userMenuAnchor);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleMyOrders = () => {
    handleUserMenuClose();
    navigate('/shop/orders');
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    setGuestId(null); // 清除游客ID，下次进入会再次询问
    navigate('/login');
  };

  const handleLoginRegister = () => {
    handleUserMenuClose();
    navigate('/login');
  }

  // 状态管理反馈触发
  const [feedbackTrigger, setFeedbackTrigger] = useState(false);
  const [feedbackProduct, setFeedbackProduct] = useState<{ name?: string; image?: string }>({});

  const triggerCartFeedback = (productInfo?: { name?: string; image?: string }) => {
    setFeedbackProduct(productInfo || {});
    setFeedbackTrigger(true);
    setTimeout(() => setFeedbackTrigger(false), 1500);

    // 通知父组件
    if (onCartUpdate) {
      onCartUpdate(true, productInfo);
    }
  };

  // 暴露反馈触发函数给全局使用
  useEffect(() => {
    (window as any).triggerCartFeedback = triggerCartFeedback;
    return () => {
      delete (window as any).triggerCartFeedback;
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* 顶部导航栏 */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: '#1B3A2B',
          borderBottom: '2px solid #D4AF37',
          top: 0,
          zIndex: 1100,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ py: 1, gap: 4 }}>
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogoClick}
              style={{ cursor: 'pointer' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4AF37, #F4E4C1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h6" sx={{ color: '#1B3A2B', fontWeight: 'bold', fontSize: '14px' }}>
                    🌺
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#D4AF37',
                      fontWeight: 'bold',
                      fontSize: { xs: '16px', sm: '20px' },
                      lineHeight: 1.2
                    }}
                  >
                    花言花语
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#F4E4C1',
                      fontSize: { xs: '10px', sm: '12px' }
                    }}
                  >
                    精致花艺 · 传递心意
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            {/* 导航链接 - 仅桌面端显示 */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0, alignItems: 'center' }}>
                <Box
                  onClick={() => navigate('/shop')}
                  sx={{
                    px: 2.5,
                    py: 1,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: location.pathname === '/shop' ? '60%' : '0%',
                      height: '3px',
                      bgcolor: '#D4AF37',
                      borderRadius: '2px 2px 0 0',
                      transition: 'width 0.3s ease',
                    },
                    '&:hover::after': {
                      width: '60%',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      color: location.pathname === '/shop' ? '#D4AF37' : '#F4E4C1',
                      fontSize: '15px',
                      fontWeight: location.pathname === '/shop' ? 600 : 400,
                      letterSpacing: '0.5px',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    首页
                  </Typography>
                </Box>

                <Box
                  onClick={() => navigate('/shop/products')}
                  sx={{
                    px: 2.5,
                    py: 1,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: location.pathname === '/shop/products' ? '60%' : '0%',
                      height: '3px',
                      bgcolor: '#D4AF37',
                      borderRadius: '2px 2px 0 0',
                      transition: 'width 0.3s ease',
                    },
                    '&:hover::after': {
                      width: '60%',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      color: location.pathname === '/shop/products' ? '#D4AF37' : '#F4E4C1',
                      fontSize: '15px',
                      fontWeight: location.pathname === '/shop/products' ? 600 : 400,
                      letterSpacing: '0.5px',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    全部商品
                  </Typography>
                </Box>
              </Box>
            )}

            {/* 移动端菜单按钮 */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                sx={{ color: '#D4AF37', ml: -1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* 占位符，将右侧按钮推到最右边 */}
            <Box sx={{ flexGrow: 1 }} />

            {/* 右侧按钮组 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

              {/* 移除了独立的“查询订单”按钮，功能移入用户下拉菜单 */}

              {/* 购物车按钮 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={feedbackTrigger ? {
                  scale: [1, 1.2, 0.9, 1.1, 1],
                  transition: { duration: 0.6, ease: "easeOut" }
                } : {}}
              >
                <Badge
                  badgeContent={totalItems}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      animation: feedbackTrigger ? 'badgeFlash 0.8s ease-out' : 'none',
                      '@keyframes badgeFlash': {
                        '0%, 100%': {
                          transform: 'scale(1)',
                          backgroundColor: '#D32F2F',
                        },
                        '50%': {
                          transform: 'scale(1.3)',
                          backgroundColor: '#4CAF50',
                          boxShadow: '0 0 12px rgba(76, 175, 80, 0.6)',
                        },
                      },
                    },
                  }}
                >
                  <IconButton
                    ref={cartButtonRef}
                    id="cart-icon-btn"
                    onClick={handleCartClick}
                    sx={{
                      color: '#D4AF37',
                      bgcolor: 'rgba(212, 175, 55, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(212, 175, 55, 0.2)',
                      },
                      animation: feedbackTrigger ? 'borderGlow 0.6s ease-out' : 'none',
                      '@keyframes borderGlow': {
                        '0%, 100%': {
                          boxShadow: '0 0 0 rgba(212, 175, 55, 0)',
                          border: '2px solid rgba(212, 175, 55, 0.3)',
                        },
                        '50%': {
                          boxShadow: '0 0 16px rgba(212, 175, 55, 0.8)',
                          border: '2px solid #D4AF37',
                        },
                      },
                    }}
                  >
                    <ShoppingBasket />
                  </IconButton>
                </Badge>
              </motion.div>

              {/* 用户头像 (统一入口) */}
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  color: '#F4E4C1',
                  bgcolor: 'rgba(244, 228, 193, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(244, 228, 193, 0.2)',
                  },
                  ml: 1,
                }}
              >
                <AccountCircle />
              </IconButton>

              <Menu
                anchorEl={userMenuAnchor}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    bgcolor: '#1B3A2B',
                    color: '#F4E4C1',
                    border: '1px solid #D4AF37',
                    '& .MuiMenuItem-root': {
                      color: '#F4E4C1', // 强制菜单项文字颜色
                      '&:hover': {
                        bgcolor: 'rgba(212, 175, 55, 0.2)',
                      },
                    },
                    '& .MuiTypography-root': {
                      color: '#F4E4C1', // 强制内部所有文本组件颜色
                    }
                  },
                }}
              >
                {/* 用户身份显示 */}
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="caption" color="rgba(244, 228, 193, 0.7)">
                      当前身份
                    </Typography>
                    {!isLoggedIn && (
                      <Chip
                        label="游客"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.7rem',
                          bgcolor: 'rgba(212, 175, 55, 0.2)',
                          color: '#D4AF37',
                          border: '1px solid rgba(212, 175, 55, 0.4)'
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {isLoggedIn ? user?.username : (guestId || '游客')}
                  </Typography>
                </Box>

                {isLoggedIn ? (
                  // 登录用户菜单
                  [
                    <MenuItem key="my-orders" onClick={handleMyOrders}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Receipt sx={{ fontSize: 18, color: '#D4AF37' }} />
                        <Typography>我的订单</Typography>
                      </Box>
                    </MenuItem>,
                    <MenuItem key="logout" onClick={handleLogout}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>退出登录</Typography>
                      </Box>
                    </MenuItem>
                  ]
                ) : (
                  // 游客菜单 - 优化登录引导
                  [
                    <Box key="login-tip" sx={{ px: 2, py: 1.5, bgcolor: 'rgba(212, 175, 55, 0.1)', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
                      <Typography variant="caption" sx={{ color: '#D4AF37', display: 'block', mb: 0.5 }}>
                        💡 登录后可享受
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(244, 228, 193, 0.8)', fontSize: '0.7rem', lineHeight: 1.4 }}>
                        · 个人账户管理<br />
                        · 收藏喜欢的商品<br />
                        · 专享会员优惠
                      </Typography>
                    </Box>,
                    <MenuItem key="login" onClick={handleLoginRegister}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Login sx={{ fontSize: 18, color: '#D4AF37' }} />
                        <Typography sx={{ flex: 1 }}>登录 / 注册</Typography>
                        <Chip
                          label="推荐"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            bgcolor: '#D4AF37',
                            color: '#1B3A2B',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    </MenuItem>,
                    <MenuItem key="query-orders" onClick={handleMyOrders}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Receipt sx={{ fontSize: 18, color: '#D4AF37' }} />
                        <Typography>查询订单</Typography>
                      </Box>
                    </MenuItem>
                  ]
                )}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* 购物车抽屉 */}
      <CartDrawer />

      {/* 移动端导航抽屉 */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: '#1B3A2B',
            color: '#F4E4C1',
          }
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(212, 175, 55, 0.2)', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#D4AF37', fontWeight: 'bold' }}>
            🌺 花言花语
          </Typography>
        </Box>
        <List sx={{ px: 2 }}>
          {[
            { text: '首页', icon: <Home />, path: '/shop' },
            { text: '全部商品', icon: <Store />, path: '/shop/products' },
            { text: '我的订单', icon: <Receipt />, path: '/shop/orders' },
          ].map((item) => (
            <ListItem
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 1,
                bgcolor: location.pathname === item.path ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: location.pathname === item.path ? '#D4AF37' : '#F4E4C1',
                '&:hover': {
                  bgcolor: 'rgba(212, 175, 55, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 700 : 400
                }}
              />
              <ChevronRight sx={{ fontSize: 18, opacity: 0.5 }} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* 主要内容区域 */}
      <Box sx={{ flexGrow: 1, bgcolor: '#ffffff', minHeight: 'calc(100vh - 200px)' }}>
        {/* 占位符，防止内容被固定导航栏遮挡 */}
        <Toolbar sx={{ py: 1 }} />
        {children}
      </Box>

      {/* 页脚 */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#1B3A2B',
          color: '#F4E4C1',
          py: 4,
          mt: 'auto'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)'
            },
            gap: 4,
            mb: 4
          }}>
            {/* 品牌信息 */}
            <Box>
              <Typography variant="h6" sx={{ color: '#D4AF37', mb: 2, fontWeight: 'bold' }}>
                花言花语
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
                专业的花艺设计，为您传递最真挚的情感。每一束鲜花都经过精心挑选和搭配，确保品质和美观。
              </Typography>
            </Box>

            {/* 服务信息 */}
            <Box>
              <Typography variant="h6" sx={{ color: '#D4AF37', mb: 2, fontWeight: 'bold' }}>
                配送服务
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                📍 配送范围：10km以内
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ⏰ 配送时间：9:00-21:00
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                🚚 同城急送：2小时内送达
              </Typography>
            </Box>

            {/* 联系方式 */}
            <Box>
              <Typography variant="h6" sx={{ color: '#D4AF37', mb: 2, fontWeight: 'bold' }}>
                联系我们
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                📞 客服热线：400-888-8888
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                🕐 服务时间：8:00-22:00
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                📧 邮箱：service@flower.com
              </Typography>
            </Box>
          </Box>

          {/* 版权信息 */}
          <Box sx={{
            borderTop: '1px solid rgba(212, 175, 55, 0.3)',
            pt: 3,
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{ color: 'rgba(244, 228, 193, 0.8)' }}>
              © 2025 花言花语. All rights reserved. 用心传递每一份美好
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ShopLayout;