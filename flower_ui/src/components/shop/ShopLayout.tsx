import React, { ReactNode, useRef, useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Container, IconButton, Badge } from '@mui/material';
import { ShoppingBasket, Phone, LocationOn } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CartDrawer from './CartDrawer';
import CartFeedback from './CartFeedback';
import { useCartStore } from '../../store/cartStore';

interface ShopLayoutProps {
  children: ReactNode;
  onCartUpdate?: (trigger: boolean, productInfo?: { name?: string; image?: string }) => void;
}

const ShopLayout: React.FC<ShopLayoutProps> = ({ children, onCartUpdate }) => {
  const navigate = useNavigate();
  const { totalItems, openCart } = useCartStore();
  const cartButtonRef = useRef<HTMLButtonElement>(null);

  const handleLogoClick = () => {
    navigate('/shop');
  };

  const handleCartClick = () => {
    openCart();
  };

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
          <Toolbar sx={{ py: 1 }}>
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogoClick}
              style={{ cursor: 'pointer', flex: 1 }}
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

            {/* 右侧按钮组 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* 联系电话 */}
              <Box sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 0.5,
                color: '#F4E4C1',
                mr: 2
              }}>
                <Phone sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  400-888-8888
                </Typography>
              </Box>

              {/* 配送范围 */}
              <Box sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 0.5,
                color: '#F4E4C1',
                mr: 2
              }}>
                <LocationOn sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  10km配送
                </Typography>
              </Box>

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

              {/* 购物车反馈效果 */}
              <CartFeedback
                trigger={feedbackTrigger}
                productName={feedbackProduct.name}
                productImage={feedbackProduct.image}
                cartButtonRef={cartButtonRef}
              />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* 购物车抽屉 */}
      <CartDrawer />

      {/* 主要内容区域 */}
      <Box sx={{ flexGrow: 1 }}>
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