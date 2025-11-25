import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart,
  Visibility,
  LocalFlorist,
  Star,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../models/product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/shop/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  const getStockStatus = () => {
    if (product.stockQuantity === 0) {
      return { label: '暂时缺货', color: 'error' as const };
    } else if (product.stockQuantity <= product.lowStockThreshold) {
      return { label: `仅剩${product.stockQuantity}件`, color: 'warning' as const };
    }
    return { label: '现货供应', color: 'success' as const };
  };

  const stockStatus = getStockStatus();
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)',
          },
          cursor: 'pointer',
        }}
        onClick={handleViewDetails}
      >
        {/* 商品图片 */}
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="200"
            image={product.mainImagePath || product.imageList?.[0] || '/placeholder-flower.jpg'}
            alt={product.name}
            sx={{
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />

          {/* 折扣标签 */}
          {hasDiscount && (
            <Chip
              label={`${discountPercentage}% OFF`}
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                bgcolor: '#D4AF37',
                color: '#1B3A2B',
                fontWeight: 'bold',
                fontSize: '12px',
                borderRadius: '12px',
              }}
            />
          )}

          {/* 推荐标签 */}
          {product.featured === 1 && (
            <Chip
              icon={<Star sx={{ fontSize: '14px !important' }} />}
              label="推荐"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(27, 58, 43, 0.9)',
                color: '#D4AF37',
                fontWeight: 'bold',
                fontSize: '12px',
                borderRadius: '12px',
              }}
            />
          )}

          {/* 库存状态 */}
          <Chip
            label={stockStatus.label}
            size="small"
            color={stockStatus.color}
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              fontSize: '11px',
              height: '24px',
            }}
          />
        </Box>

        {/* 商品信息 */}
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* 分类标签 */}
          <Box sx={{ mb: 1 }}>
            <Chip
              icon={<LocalFlorist sx={{ fontSize: '14px !important' }} />}
              label={product.categoryName || '精选花艺'}
              size="small"
              sx={{
                bgcolor: 'rgba(212, 175, 55, 0.1)',
                color: '#D4AF37',
                fontSize: '11px',
                height: '24px',
              }}
            />
          </Box>

          {/* 商品名称 */}
          <Typography
            variant="h6"
            sx={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1B3A2B',
              mb: 1,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </Typography>

          {/* 商品描述 */}
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description || '精选花材，精心搭配，传递美好情感'}
          </Typography>

          {/* 价格信息 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography
              variant="h5"
              sx={{
                color: '#D4AF37',
                fontWeight: 'bold',
                fontSize: '20px',
              }}
            >
              {formatPrice(product.price)}
            </Typography>
            {hasDiscount && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'line-through',
                  fontSize: '14px',
                }}
              >
                {formatPrice(product.originalPrice!)}
              </Typography>
            )}
          </Box>
        </CardContent>

        {/* 操作按钮 */}
        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Visibility />}
            onClick={handleViewDetails}
            sx={{
              flex: 1,
              borderColor: '#D4AF37',
              color: '#1B3A2B',
              '&:hover': {
                borderColor: '#1B3A2B',
                bgcolor: 'rgba(212, 175, 55, 0.1)',
              },
            }}
          >
            查看详情
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton
              color="primary"
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              sx={{
                bgcolor: '#D4AF37',
                color: '#1B3A2B',
                '&:hover': {
                  bgcolor: '#B8941F',
                },
                '&:disabled': {
                  bgcolor: 'rgba(0,0,0,0.12)',
                  color: 'rgba(0,0,0,0.26)',
                },
                ml: 1,
              }}
            >
              <ShoppingCart />
            </IconButton>
          </motion.div>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default ProductCard;