import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Card,
  CardMedia,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  Divider,
  useTheme,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Remove,
  ShoppingCart,
  LocalFlorist,
  Star,
  Phone,
  AccessTime,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import ShopLayout from '../../components/shop/ShopLayout';
import { Product } from '../../models/product';
import { productAPI } from '../../api/productAPI';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // 加载商品详情
  const loadProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await productAPI.getProductById(Number(id));
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError('商品不存在或已下架');
      }
    } catch (err) {
      console.error('加载商品详情失败:', err);
      setError('加载商品详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  // 处理数量变化
  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && product && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  // 添加到购物车
  const handleAddToCart = () => {
    if (!product) return;

    console.log('添加到购物车:', { product, quantity });
    setShowSnackbar(true);
    // TODO: 实现购物车功能
  };

  // 立即购买
  const handleBuyNow = () => {
    if (!product) return;

    console.log('立即购买:', { product, quantity });
    // TODO: 跳转到结算页面
    navigate('/shop/checkout');
  };

  // 图片导航
  const handlePrevImage = () => {
    if (product && product.imageList && product.imageList.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.imageList!.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product && product.imageList && product.imageList.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === product.imageList!.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (loading) {
    return (
      <ShopLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={24} width="80%" sx={{ mb: 2 }} />
              <Skeleton variant="text" height={32} width="60%" sx={{ mb: 4 }} />
              <Skeleton variant="rectangular" height={200} sx={{ mb: 4 }} />
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Container>
      </ShopLayout>
    );
  }

  if (error || !product) {
    return (
      <ShopLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="error" gutterBottom>
              {error || '商品不存在'}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/shop')} sx={{ mt: 2 }}>
              返回商品列表
            </Button>
          </Box>
        </Container>
      </ShopLayout>
    );
  }

  const images = product.imageList || [product.mainImagePath].filter(Boolean);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <ShopLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 面包屑导航 */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/shop')}
            sx={{ color: '#D4AF37', textDecoration: 'none' }}
          >
            商品列表
          </Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* 商品图片 */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ position: 'relative' }}>
                  {/* 主图片 */}
                  <CardMedia
                    component="img"
                    height={400}
                    image={images[currentImageIndex] || '/placeholder-flower.jpg'}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />

                  {/* 图片导航按钮 */}
                  {images.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePrevImage}
                        sx={{
                          position: 'absolute',
                          left: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                        }}
                      >
                        <ArrowBack />
                      </IconButton>
                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                        }}
                      >
                        <ArrowBack sx={{ transform: 'rotate(180deg)' }} />
                      </IconButton>
                    </>
                  )}

                  {/* 折扣标签 */}
                  {hasDiscount && (
                    <Chip
                      label={`${discountPercentage}% OFF`}
                      size="medium"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        bgcolor: '#D4AF37',
                        color: '#1B3A2B',
                        fontWeight: 'bold',
                        fontSize: '14px',
                      }}
                    />
                  )}

                  {/* 收藏按钮 */}
                  <IconButton
                    onClick={() => setIsFavorite(!isFavorite)}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                    }}
                  >
                    {isFavorite ? (
                      <Favorite sx={{ color: '#E91E63' }} />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                </Box>

                {/* 缩略图 */}
                {images.length > 1 && (
                  <Box sx={{ p: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
                    {images.map((image, index) => (
                      <Box
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: currentImageIndex === index ? '2px solid #D4AF37' : '2px solid transparent',
                          '&:hover': { border: '2px solid #D4AF37' },
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={image}
                          alt={`${product.name} ${index + 1}`}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>
            </motion.div>
          </Grid>

          {/* 商品信息 */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* 分类和推荐标签 */}
              <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  icon={<LocalFlorist />}
                  label={product.categoryName || '精选花艺'}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(212, 175, 55, 0.1)',
                    color: '#D4AF37',
                  }}
                />
                {product.featured === 1 && (
                  <Chip
                    icon={<Star />}
                    label="推荐商品"
                    size="small"
                    color="primary"
                  />
                )}
              </Box>

              {/* 商品名称 */}
              <Typography variant="h4" sx={{ color: '#1B3A2B', fontWeight: 'bold', mb: 2 }}>
                {product.name}
              </Typography>

              {/* 商品描述 */}
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                {product.description || '精选花材，精心搭配，为您传递最真挚的情感。每一束花都经过花艺师的精心设计，确保品质和美观。'}
              </Typography>

              {/* 价格信息 */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <Typography variant="h3" sx={{ color: '#D4AF37', fontWeight: 'bold' }}>
                  ¥{product.price.toFixed(2)}
                </Typography>
                {hasDiscount && (
                  <>
                    <Typography variant="h6" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                      ¥{product.originalPrice!.toFixed(2)}
                    </Typography>
                    <Chip
                      label={`省${(product.originalPrice! - product.price).toFixed(2)}元`}
                      size="small"
                      color="error"
                    />
                  </>
                )}
              </Box>

              {/* 库存信息 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: product.stockQuantity > 0 ? 'success.main' : 'error.main' }}>
                  {product.stockQuantity > 0
                    ? `库存: ${product.stockQuantity} 件`
                    : '暂时缺货'}
                </Typography>
              </Box>

              {/* 数量选择 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>购买数量</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    sx={{
                      bgcolor: 'rgba(212, 175, 55, 0.1)',
                      '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.2)' },
                      '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.05)' },
                    }}
                  >
                    <Remove />
                  </IconButton>
                  <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockQuantity}
                    sx={{
                      bgcolor: 'rgba(212, 175, 55, 0.1)',
                      '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.2)' },
                      '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.05)' },
                    }}
                  >
                    <Add />
                  </IconButton>
                </Box>
              </Box>

              {/* 总价 */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(212, 175, 55, 0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">总计</Typography>
                  <Typography variant="h5" sx={{ color: '#D4AF37', fontWeight: 'bold' }}>
                    ¥{(product.price * quantity).toFixed(2)}
                  </Typography>
                </Box>
              </Paper>

              {/* 操作按钮 */}
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0}
                  sx={{
                    flex: 1,
                    height: 56,
                    borderColor: '#D4AF37',
                    color: '#1B3A2B',
                    '&:hover': {
                      borderColor: '#1B3A2B',
                      bgcolor: 'rgba(212, 175, 55, 0.1)',
                    },
                    '&:disabled': {
                      borderColor: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                    },
                  }}
                >
                  加入购物车
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleBuyNow}
                  disabled={product.stockQuantity === 0}
                  sx={{
                    flex: 1,
                    height: 56,
                    bgcolor: '#D4AF37',
                    color: '#1B3A2B',
                    '&:hover': {
                      bgcolor: '#B8941F',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                    },
                  }}
                >
                  立即购买
                </Button>
              </Box>

              {/* 服务信息 */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime sx={{ color: '#D4AF37', fontSize: 20 }} />
                  <Typography variant="body2">今日下单，明日送达</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ color: '#D4AF37', fontSize: 20 }} />
                  <Typography variant="body2">客服热线: 400-888-8888</Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* 详细信息 */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" sx={{ color: '#1B3A2B', fontWeight: 'bold', mb: 3 }}>
                  商品详情
                </Typography>

                {/* 花语说明 */}
                {product.flowerLanguage && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ color: '#D4AF37', mb: 2 }}>
                      🌸 花语寓意
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {product.flowerLanguage}
                    </Typography>
                  </Box>
                )}

                {/* 养护说明 */}
                {product.careGuide && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ color: '#D4AF37', mb: 2 }}>
                      🌿 养护指南
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {product.careGuide}
                    </Typography>
                  </Box>
                )}

                {/* 商品规格 */}
                <Box>
                  <Typography variant="h6" sx={{ color: '#D4AF37', mb: 2 }}>
                    📏 商品规格
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {product.specification || '标准花束规格，包含包装和保养说明'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* 配送说明 */}
                <Box>
                  <Typography variant="h6" sx={{ color: '#D4AF37', mb: 2 }}>
                    🚚 配送说明
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    • 配送范围：10公里以内<br />
                    • 配送时间：每日9:00-21:00<br />
                    • 同城急送：下单后2小时内送达<br />
                    • 送货前电话确认，确保您在家收货
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* 成功提示 */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          已添加到购物车！
        </Alert>
      </Snackbar>
    </ShopLayout>
  );
};

export default ProductDetailPage;