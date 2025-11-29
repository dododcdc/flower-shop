import React from 'react';
import { Typography, Container, Box } from '@mui/material';
import { motion } from 'framer-motion';
import ShopLayout from '../../components/shop/ShopLayout';
import PublicProductList from '../../components/shop/PublicProductList';
import { Product } from '../../models/product';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  // 添加到购物车
  const handleAddToCart = (product: Product, quantity: number) => {
    return addItem(product, quantity);
  };

  // 查看商品详情
  const handleViewDetails = (product: Product) => {
    navigate(`/shop/product/${product.id}`);
  };

  return (
    <ShopLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>


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