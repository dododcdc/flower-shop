import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ShopLayout from '../../components/shop/ShopLayout';
import ProductCard from '../../components/shop/ProductCard';
import { Product, hasDiscount } from '../../models/product';
import { productAPI } from '../../api/productAPI';
import { ArrowForward } from '@mui/icons-material';
import { useCartStore } from '../../store/cartStore';
import { useSnackbar } from 'notistack';

const SectionHeader: React.FC<{ title: string; onClickMore: () => void }> = ({ title, onClickMore }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1B3A2B', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 24, bgcolor: '#D4AF37', borderRadius: 1 }} />
            {title}
        </Typography>
        <Button
            endIcon={<ArrowForward />}
            onClick={onClickMore}
            sx={{ color: '#1B3A2B', '&:hover': { color: '#D4AF37' } }}
        >
            查看更多
        </Button>
    </Box>
);

const ShopHome: React.FC = () => {
    const navigate = useNavigate();
    const { addItem } = useCartStore();
    const { enqueueSnackbar } = useSnackbar();

    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [bestSellers, setBestSellers] = useState<Product[]>([]);
    const [discountProducts, setDiscountProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Merchant Recommendations (Featured)
                const featuredData = await productAPI.searchProducts({
                    featured: 1,
                    size: 3,
                    current: 1,
                    status: 1,
                    sortBy: 'created_at',
                    sortOrder: 'desc'
                });
                setFeaturedProducts(featuredData.records);

                // 2. Recent Best Sellers (按创建时间排序，未来可增加销量字段)
                const salesData = await productAPI.searchProducts({
                    sortBy: 'created_at',
                    sortOrder: 'desc',
                    size: 3,
                    current: 1,
                    status: 1
                });
                setBestSellers(salesData.records);

                // 3. Discounted Products
                const potentialDiscounts = await productAPI.searchProducts({
                    size: 50,
                    current: 1,
                    status: 1,
                    sortBy: 'created_at',
                    sortOrder: 'desc'
                });

                const discounted = potentialDiscounts.records
                    .filter(p => hasDiscount(p))
                    .slice(0, 3);

                setDiscountProducts(discounted);

            } catch (error) {
                console.error('Failed to fetch home data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddToCart = (product: Product) => {
        addItem(product, 1);
        enqueueSnackbar('已添加到购物车', { variant: 'success', autoHideDuration: 2000 });
    };

    const navToProducts = () => {
        navigate('/shop/products');
    };

    return (
        <ShopLayout>
            {/* Hero Section - 首页横幅 */}
            <Box
                sx={{
                    position: 'relative',
                    height: { xs: '400px', md: '500px' },
                    overflow: 'hidden',
                    mb: 6,
                }}
            >
                {/* 背景图片 */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url('/images/hero-banner.png')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.85)',
                    }}
                />

                {/* 渐变遮罩 - 提升文字可读性 */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(27, 58, 43, 0.75) 0%, rgba(27, 58, 43, 0.55) 50%, rgba(27, 58, 43, 0.75) 100%)',
                    }}
                />

                {/* 内容区 */}
                <Container
                    maxWidth="lg"
                    sx={{
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        zIndex: 1,
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* 副标题 */}
                        <Typography
                            variant="overline"
                            sx={{
                                color: '#D4AF37',
                                fontSize: { xs: '12px', md: '14px' },
                                letterSpacing: '3px',
                                fontWeight: 600,
                                mb: 2,
                                display: 'block',
                            }}
                        >
                            花言花语 · 传递心意
                        </Typography>

                        {/* 主标题 */}
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                color: '#FFFFFF',
                                fontSize: { xs: '32px', md: '48px', lg: '56px' },
                                lineHeight: 1.2,
                                textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                            }}
                        >
                            发现生活中的美好
                        </Typography>

                        {/* 描述文字 */}
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 4,
                                color: '#F4E4C1',
                                opacity: 0.95,
                                fontSize: { xs: '16px', md: '20px' },
                                maxWidth: '600px',
                                mx: 'auto',
                                lineHeight: 1.6,
                                textShadow: '0 1px 10px rgba(0,0,0,0.2)',
                            }}
                        >
                            每一束花都是精心准备的礼物
                            <br />
                            用鲜花，诉说最真挚的情感
                        </Typography>

                        {/* CTA 按钮 */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={navToProducts}
                                sx={{
                                    bgcolor: '#D4AF37',
                                    color: '#1B3A2B',
                                    fontWeight: 'bold',
                                    px: 5,
                                    py: 1.8,
                                    fontSize: '16px',
                                    borderRadius: '30px',
                                    boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
                                    '&:hover': {
                                        bgcolor: '#B8941F',
                                        boxShadow: '0 6px 30px rgba(212, 175, 55, 0.6)',
                                    },
                                }}
                            >
                                立即选购
                            </Button>
                        </motion.div>
                    </motion.div>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ pb: 8 }}>
                {/* Merchant Recommendations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <SectionHeader title="商家推荐" onClickMore={navToProducts} />
                    <Grid container spacing={3}>
                        {featuredProducts.map(product => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                                <ProductCard product={product} onAddToCart={() => handleAddToCart(product)} />
                            </Grid>
                        ))}
                        {featuredProducts.length === 0 && !loading && (
                            <Typography sx={{ width: '100%', textAlign: 'center', py: 4, color: 'text.secondary' }}>暂无推荐商品</Typography>
                        )}
                    </Grid>
                </motion.div>

                {/* Recent Best Sellers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <SectionHeader title="最近热销" onClickMore={navToProducts} />
                    <Grid container spacing={3}>
                        {bestSellers.map(product => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                                <ProductCard product={product} onAddToCart={() => handleAddToCart(product)} />
                            </Grid>
                        ))}
                        {bestSellers.length === 0 && !loading && (
                            <Typography sx={{ width: '100%', textAlign: 'center', py: 4, color: 'text.secondary' }}>暂无热销商品</Typography>
                        )}
                    </Grid>
                </motion.div>

                {/* Discounted Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <SectionHeader title="限时折扣" onClickMore={navToProducts} />
                    <Grid container spacing={3}>
                        {discountProducts.map(product => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                                <ProductCard product={product} onAddToCart={() => handleAddToCart(product)} />
                            </Grid>
                        ))}
                        {discountProducts.length === 0 && !loading && (
                            <Typography sx={{ width: '100%', textAlign: 'center', py: 4, color: 'text.secondary' }}>暂无折扣商品</Typography>
                        )}
                    </Grid>
                </motion.div>
            </Container>
        </ShopLayout>
    );
};

export default ShopHome;
