import React, { useState } from 'react';
import { Typography, Container, Box } from '@mui/material';
import { motion } from 'framer-motion';
import ShopLayout from '../../components/shop/ShopLayout';
import PublicProductList from '../../components/shop/PublicProductList';
import { Product } from '../../models/product';
import { useNavigate } from 'react-router-dom';

const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  // 添加到购物车
  const handleAddToCart = (product: Product, quantity: number) => {
    console.log('添加到购物车:', { product, quantity });
    setCartCount(prev => prev + quantity);
    // TODO: 实现购物车功能
  };

  // 查看商品详情
  const handleViewDetails = (product: Product) => {
    navigate(`/shop/product/${product.id}`);
  };

  return (
    <ShopLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                color: '#1B3A2B',
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '28px', sm: '36px', md: '42px' },
              }}
            >
              🌺 精选花艺作品
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '16px', sm: '18px' },
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              每一束花都承载着独特的故事，为您传递最真挚的情感
            </Typography>
          </Box>
        </motion.div>

        {/* 商品列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <PublicProductList
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
          />
        </motion.div>
      </Container>
    </ShopLayout>
  );
};

export default ShopPage;