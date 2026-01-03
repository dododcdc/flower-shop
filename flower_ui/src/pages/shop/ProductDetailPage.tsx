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
  Chip,
  Paper,
  Divider,
  useTheme,
  Skeleton,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
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
  Home,
  ChevronRight,
  VerifiedUser,
  LocalShipping,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import ShopLayout from '../../components/shop/ShopLayout';
import { Product } from '../../models/product';
import { productAPI } from '../../api/productAPI';
import { useCartStore } from '../../store/cartStore';
import { API_BASE_URL } from '../../constants';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isFavorite, setIsFavorite] = useState(false);

  // 加载商品详情
  const loadProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const productData = await productAPI.getProductById(Number(id));
      if (productData) {
        setProduct(productData);
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

    const result = addItem(product, quantity);
    if (result.success) {
      setSnackbarMessage('已添加到购物车！');
      setSnackbarSeverity('success');
    } else {
      setSnackbarMessage(result.message || '添加失败');
      setSnackbarSeverity('error');
    }
    setShowSnackbar(true);
  };

  // 立即购买 (直接下单流)
  const handleBuyNow = () => {
    if (!product) return;

    if (product.stockQuantity === 0) {
      setSnackbarMessage('该商品暂时缺货');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    // 方案一：独立订单流，直接携带商品信息跳转，不进入购物车存储
    navigate('/shop/checkout', {
      state: {
        directBuyItem: {
          id: `direct-${Date.now()}`,
          productId: product.id,
          product: product,
          quantity: quantity,
          addedAt: new Date(),
          selected: true
        }
      }
    });
  };

  // 返回上一页
  const handleBack = () => {
    navigate(-1);
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
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{
                color: '#1B3A2B',
                '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.1)' },
              }}
            >
              返回
            </Button>
          </Box>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="text" height={60} width="80%" />
              <Skeleton variant="text" height={40} width="40%" sx={{ mt: 2 }} />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 4, borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={60} sx={{ mt: 4, borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={56} sx={{ mt: 4, borderRadius: 2 }} />
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

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return '/placeholder-flower.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    return imagePath;
  };

  const images = product.imageList && product.imageList.length > 0
    ? product.imageList.map(getImageUrl)
    : product.mainImagePath
      ? [getImageUrl(product.mainImagePath)]
      : ['/placeholder-flower.jpg'];

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <ShopLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* 面包屑导航 */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs
            separator={<ChevronRight fontSize="small" sx={{ color: 'rgba(212, 175, 55, 0.5)' }} />}
            aria-label="breadcrumb"
          >
            <Link
              component={RouterLink}
              to="/shop"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: '#D4AF37' }
              }}
            >
              <Home sx={{ mr: 0.5, fontSize: 20 }} />
              首页
            </Link>
            <Link
              component={RouterLink}
              to="/shop/products"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: '#D4AF37' }
              }}
            >
              全部商品
            </Link>
            <Typography color="#D4AF37" sx={{ fontWeight: 500 }}>
              {product.name}
            </Typography>
          </Breadcrumbs>
        </Box>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          {/* 左侧：图片展示区 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 450,
                      position: 'relative',
                      bgcolor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={images[currentImageIndex] || '/placeholder-flower.jpg'}
                      alt={product.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>

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

          {/* 右侧：商品购买区 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  icon={<LocalFlorist fontSize="small" />}
                  label={product.categoryName || '精选花艺'}
                  size="small"
                  sx={{ bgcolor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37' }}
                />
                {product.featured === 1 && (
                  <Chip
                    icon={<Star fontSize="small" />}
                    label="推荐商品"
                    size="small"
                    color="primary"
                  />
                )}
              </Box>

              <Typography variant="h3" sx={{
                color: '#1B3A2B',
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                lineHeight: 1.2
              }}>
                {product.name}
              </Typography>

              <Typography variant="body1" sx={{
                color: 'text.secondary',
                mb: 4,
                lineHeight: 1.8,
                fontSize: '1.05rem',
                borderLeft: '4px solid rgba(212, 175, 55, 0.3)',
                pl: 2
              }}>
                {product.description || '精选花材，精心搭配，为您传递最真挚的情感。每一束花都经过花艺师的精心设计，确保品质和美观。'}
              </Typography>

              <Box sx={{
                mb: 4,
                p: 3,
                borderRadius: 3,
                bgcolor: 'rgba(212, 175, 55, 0.03)',
                border: '1px solid rgba(212, 175, 55, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                  <Typography variant="h3" sx={{ color: '#D4AF37', fontWeight: 800 }}>
                    <Box component="span" sx={{ fontSize: '1.5rem', mr: 0.5 }}>¥</Box>
                    {product.price.toFixed(2)}
                  </Typography>
                  {hasDiscount && (
                    <Typography variant="h6" sx={{ color: 'text.disabled', textDecoration: 'line-through' }}>
                      ¥{product.originalPrice!.toFixed(2)}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    icon={<VerifiedUser sx={{ fontSize: '16px !important' }} />}
                    label="正品保障"
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: 'rgba(76, 175, 80, 0.3)', color: '#4CAF50', height: 24 }}
                  />
                  <Typography variant="caption" sx={{ color: product.stockQuantity > 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                    {product.stockQuantity > 0
                      ? `✨ 当前有现货 (库存: ${product.stockQuantity})`
                      : '❌ 暂时缺货'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: '#1B3A2B' }}>购买数量</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <IconButton
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '4px 0 0 4px',
                      border: '1px solid #e0e0e0',
                      bgcolor: 'white',
                      '&:hover': { bgcolor: '#f5f5f5' },
                    }}
                  >
                    <Remove fontSize="small" />
                  </IconButton>
                  <Box sx={{
                    width: 60,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTop: '1px solid #e0e0e0',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}>
                    {quantity}
                  </Box>
                  <IconButton
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockQuantity}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '0 4px 4px 0',
                      border: '1px solid #e0e0e0',
                      bgcolor: 'white',
                      '&:hover': { bgcolor: '#f5f5f5' },
                    }}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                    小计: <Box component="span" sx={{ color: '#D4AF37', fontWeight: 600 }}>¥{(product.price * quantity).toFixed(2)}</Box>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{
                display: 'flex',
                gap: 2,
                mb: 4,
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
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
                    borderWidth: 2,
                    borderRadius: 1,
                    fontWeight: 700,
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: '#1B3A2B',
                      bgcolor: 'rgba(212, 175, 55, 0.1)',
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
                    borderRadius: 1,
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)',
                    '&:hover': {
                      bgcolor: '#B8941F',
                      boxShadow: '0 6px 16px rgba(212, 175, 55, 0.3)',
                    },
                  }}
                >
                  立即购买
                </Button>
              </Box>

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

        {/* ---------------- 真实数据详情展示区域 ---------------- */}
        <Box sx={{ mt: 8 }}>
          {/* 1. 核心感性体验：花语 */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{
              textAlign: 'center',
              py: { xs: 6, md: 10 },
              px: 3,
              mb: 8,
              borderRadius: 4,
              background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Typography variant="overline" sx={{ color: '#D4AF37', fontWeight: 800, letterSpacing: 6, mb: 1, display: 'block' }}>
              FLOWER LANGUAGE
            </Typography>
            <Typography variant="h3" sx={{ color: '#1B3A2B', fontWeight: 800, mb: 4, fontFamily: 'serif' }}>
              花语寓意
            </Typography>
            <Container maxWidth="md">
              <Typography variant="h5" sx={{
                color: '#1B3A2B',
                fontStyle: 'italic',
                lineHeight: 1.8,
                fontWeight: 300,
                position: 'relative',
                display: 'inline-block'
              }}>
                <Box component="span" sx={{ fontSize: '3rem', position: 'absolute', left: -40, top: -20, opacity: 0.2, color: '#D4AF37' }}>“</Box>
                {product.flowerLanguage || '每一束鲜花都是大自然的情书，在指尖绽放，在心间留香。'}
                <Box component="span" sx={{ fontSize: '3rem', position: 'absolute', right: -40, bottom: -40, opacity: 0.2, color: '#D4AF37' }}>”</Box>
              </Typography>
            </Container>
          </Box>

          <Grid container spacing={6}>
            {/* 左侧：商品详情与养护 */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ mb: 6 }}>
                <Typography variant="h5" sx={{ color: '#1B3A2B', fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 4, height: 24, bgcolor: '#D4AF37', borderRadius: 4 }} />
                  详情描述
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 2, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                  {product.description || '暂无详细描述'}
                </Typography>
              </Box>

              <Divider sx={{ mb: 6, opacity: 0.5 }} />

              <Box>
                <Typography variant="h5" sx={{ color: '#1B3A2B', fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 4, height: 24, bgcolor: '#D4AF37', borderRadius: 4 }} />
                  养护指南
                </Typography>
                <Grid container spacing={3}>
                  {(product.careGuide || '保持直立：收到花后请尽快拆除包装放入花瓶。\n勤换清水：建议每天更换一次清水并清洗花瓶内壁。\n修剪根部：每次换水时斜剪根部1-2厘米。\n避光放置：避免阳光直射和空调出风口。')
                    .split('\n')
                    .map((guide, index) => guide.trim() && (
                      <Grid size={{ xs: 12, sm: 6 }} key={index}>
                        <Paper elevation={0} sx={{
                          p: 3,
                          height: '100%',
                          border: '1px solid #f0f0f0',
                          borderRadius: 2,
                          transition: 'all 0.3s',
                          '&:hover': {
                            borderColor: '#D4AF37',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                          }
                        }}>
                          <Typography variant="h4" sx={{ color: 'rgba(212, 175, 55, 0.2)', fontWeight: 900, mb: 1 }}>
                            0{index + 1}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#1B3A2B', fontWeight: 500, lineHeight: 1.6 }}>
                            {guide.replace(/^•\s*/, '')}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
              </Box>
            </Grid>

            {/* 右侧：配送服务与保障 (侧边栏) */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ position: { md: 'sticky' }, top: 100 }}>
                <Paper elevation={0} sx={{
                  p: 4,
                  bgcolor: '#fafafa',
                  borderRadius: 3,
                  border: '1px solid #f0f0f0',
                  mb: 4
                }}>
                  <Typography variant="h6" sx={{ color: '#1B3A2B', fontWeight: 800, mb: 4 }}>服务保障</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <LocalShipping sx={{ color: '#D4AF37' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>极速配送</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>支持同城配送，最快2小时内鲜美达。具体时间请在结算页选择。</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <VerifiedUser sx={{ color: '#D4AF37' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>品质保证</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>精选昆明直发花材，资深花艺师亲手设计，确保成品与照片相符。</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Phone sx={{ color: '#D4AF37' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>售后无忧</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>如收到花材有明显损伤，请在签收后24小时内联系客服处理。</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: '#1B3A2B',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>咨询客服获取更多定制方案</Typography>
                  <Typography variant="h5" sx={{ color: '#F4E4C1', fontWeight: 800 }}>400-888-8888</Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ShopLayout>
  );
};

export default ProductDetailPage;