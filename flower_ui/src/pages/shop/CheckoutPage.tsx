import React from 'react';
import { Box, Container, Grid, Typography, Paper, Button, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import ShopLayout from '../../components/shop/ShopLayout';
import { useCartStore } from '../../store/cartStore';
import { useNavigate } from 'react-router-dom';

import MessageCardEditor from '../../components/shop/MessageCardEditor';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { getSelectedItems, getTotalSelectedPrice } = useCartStore();
    const selectedItems = getSelectedItems();
    const totalPrice = getTotalSelectedPrice();

    // 状态管理
    const [cardContent, setCardContent] = React.useState('');
    const [cardSender, setCardSender] = React.useState('');

    if (selectedItems.length === 0) {
        return (
            <ShopLayout>
                <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        购物车中没有选中的商品
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/shop')} sx={{ mt: 2 }}>
                        去购物
                    </Button>
                </Container>
            </ShopLayout>
        );
    }

    return (
        <ShopLayout>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1B3A2B' }}>
                    填写订单信息
                </Typography>

                <Grid container spacing={4}>
                    {/* 左侧：表单区域 */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            {/* 收货信息 */}
                            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#D4AF37', fontWeight: 'bold' }}>
                                    1. 收货信息
                                </Typography>
                                <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                                    <Typography color="text.secondary">
                                        (此处将放置收货人信息表单)
                                    </Typography>
                                </Box>
                            </Paper>

                            {/* 配送时间 */}
                            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#D4AF37', fontWeight: 'bold' }}>
                                    2. 配送时间
                                </Typography>
                                <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                                    <Typography color="text.secondary">
                                        (此处将放置配送日期和时间选择器)
                                    </Typography>
                                </Box>
                            </Paper>

                            {/* 心意卡片 */}
                            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#D4AF37', fontWeight: 'bold' }}>
                                    3. 心意卡片 ✨
                                </Typography>
                                <MessageCardEditor
                                    content={cardContent}
                                    sender={cardSender}
                                    onContentChange={setCardContent}
                                    onSenderChange={setCardSender}
                                />
                            </Paper>
                        </Box>
                    </Grid>

                    {/* 右侧：订单概览 */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            sx={{ position: 'sticky', top: 100 }}
                        >
                            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#fafafa' }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                                    订单概览
                                </Typography>

                                {/* 商品列表 */}
                                <Box sx={{ mb: 3, maxHeight: 300, overflowY: 'auto' }}>
                                    {selectedItems.map((item) => (
                                        <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                            <img
                                                src={item.product.mainImagePath || '/placeholder-flower.jpg'}
                                                alt={item.product.name}
                                                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle2" noWrap>
                                                    {item.product.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    x {item.quantity}
                                                </Typography>
                                                <Typography variant="body2" color="primary" fontWeight="bold">
                                                    ¥{(item.product.price * item.quantity).toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* 费用明细 */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography color="text.secondary">商品小计</Typography>
                                    <Typography>¥{totalPrice.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography color="text.secondary">运费</Typography>
                                    <Typography>¥0.00</Typography>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="h6">应付总额</Typography>
                                    <Typography variant="h5" color="primary" fontWeight="bold">
                                        ¥{totalPrice.toFixed(2)}
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    sx={{
                                        background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                                        color: '#1B3A2B',
                                        fontWeight: 'bold',
                                        py: 1.5,
                                    }}
                                >
                                    提交订单
                                </Button>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </ShopLayout>
    );
};

export default CheckoutPage;
