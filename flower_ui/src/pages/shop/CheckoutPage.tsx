import React from 'react';
import { Box, Container, Grid, Typography, Paper, Button, Divider, TextField, Radio, RadioGroup, FormControlLabel, FormControl } from '@mui/material';
import { motion } from 'framer-motion';
import ShopLayout from '../../components/shop/ShopLayout';
import { useAuthStore } from '../../store/authStore';

import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { orderAPI } from '../../api/orderAPI';
import { useCartStore } from '../../store/cartStore';
import MessageCardEditor from '../../components/shop/MessageCardEditor';
import { API_BASE_URL } from '../../constants';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { getSelectedItems, getTotalSelectedPrice, clearCart } = useCartStore();
    const { user } = useAuthStore(); // 获取登录用户

    const selectedItems = getSelectedItems();
    const totalPrice = getTotalSelectedPrice();

    // 状态管理
    const [cardContent, setCardContent] = React.useState('');
    const [cardSender, setCardSender] = React.useState('');

    // 支付方式状态
    const [paymentMethod, setPaymentMethod] = React.useState('ON_DELIVERY'); // 默认使用到付

    // 收货信息状态
    const [recipientName, setRecipientName] = React.useState('');
    const [recipientPhone, setRecipientPhone] = React.useState('');
    const [recipientAddress, setRecipientAddress] = React.useState('');

    // 自动填充用户信息
    React.useEffect(() => {
        if (user) {
            if (user.phone && !recipientPhone) {
                setRecipientPhone(user.phone);
            }
            // 如果我们也想自动填个默认名字（虽然通常是收货人并不一定是自己），可以默认不填或填用户名
            // 但用户体验上，如果是买花送自己，填用户名可能不合适。
            // 暂时只填手机号，这是确定的。
        }
    }, [user]);

    // 配送时间状态

    // 配送时间状态
    const [deliveryDate, setDeliveryDate] = React.useState('');
    const [deliveryTime, setDeliveryTime] = React.useState('');

    // 提交状态
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [orderSuccess, setOrderSuccess] = React.useState(false); // 新增：防止提交成功后闪烁空购物车状态

    // 表单验证
    const validateForm = () => {
        // ... (保持原样)
        if (!recipientName.trim()) {
            enqueueSnackbar('请填写收货人姓名', { variant: 'error' });
            return false;
        }
        if (!recipientPhone.trim()) {
            enqueueSnackbar('请填写联系电话', { variant: 'error' });
            return false;
        }
        if (!/^1[3-9]\d{9}$/.test(recipientPhone)) {
            enqueueSnackbar('请填写正确的手机号码', { variant: 'error' });
            return false;
        }
        if (!recipientAddress.trim()) {
            enqueueSnackbar('请填写详细地址', { variant: 'error' });
            return false;
        }
        if (!deliveryDate) {
            enqueueSnackbar('请选择配送日期', { variant: 'error' });
            return false;
        }
        if (!deliveryTime) {
            enqueueSnackbar('请选择配送时间', { variant: 'error' });
            return false;
        }
        return true;
    };

    // 提交订单
    const handleSubmitOrder = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const orderRequest = {
                recipientName,
                recipientPhone,
                recipientAddress,
                deliveryDate,
                deliveryTime,
                cardContent: cardContent || undefined,
                cardSender: cardSender || undefined,
                paymentMethod,
                items: selectedItems.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
            };

            const order = await orderAPI.createOrder(orderRequest);

            enqueueSnackbar('订单创建成功！订单号：' + order.orderNo, {
                variant: 'success',
                autoHideDuration: 3000,
            });

            // 标记成功，防止显示空购物车界面
            setOrderSuccess(true);

            // 清空购物车
            clearCart();

            // 跳转到订单成功页面
            setTimeout(() => {
                navigate('/shop/order-success', {
                    state: {
                        orderNo: order.orderNo,
                        customerName: recipientName,
                        customerPhone: recipientPhone,
                        deliveryAddress: recipientAddress,
                        deliveryTime: `${deliveryDate} ${deliveryTime}`,
                        totalAmount: order.finalAmount || totalPrice,
                        message: cardContent
                    }
                });
            }, 500); // 缩短等待时间，改善体验

        } catch (error: any) {
            console.error('订单创建失败:', error);
            enqueueSnackbar(error.response?.data?.message || '订单创建失败，请重试', {
                variant: 'error',
                autoHideDuration: 3000,
            });
            setIsSubmitting(false); // 只有失败时才恢复提交按钮状态
        }
        // finally不要重置isSubmitting，如果是成功的话，让它一直loading直到跳转
    };

    // 解析图片路径
    const getImageUrl = (imagePath: string | null | undefined) => {
        if (!imagePath) return '/placeholder-flower.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/uploads/')) {
            return `${API_BASE_URL}${imagePath}`;
        }
        return imagePath;
    };

    if (selectedItems.length === 0 && !orderSuccess) { // 只有非成功状态下的空购物车才显示提示
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
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="收货人姓名"
                                            fullWidth
                                            required
                                            value={recipientName}
                                            onChange={(e) => setRecipientName(e.target.value)}
                                            placeholder="请填写收货人姓名"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="联系电话"
                                            fullWidth
                                            required
                                            value={recipientPhone}
                                            onChange={(e) => setRecipientPhone(e.target.value)}
                                            placeholder="请填写手机号码"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="详细地址"
                                            fullWidth
                                            required
                                            multiline
                                            rows={2}
                                            value={recipientAddress}
                                            onChange={(e) => setRecipientAddress(e.target.value)}
                                            placeholder="街道、楼牌号等"
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* 配送时间 */}
                            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#D4AF37', fontWeight: 'bold' }}>
                                    2. 配送时间
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="配送日期"
                                            type="date"
                                            fullWidth
                                            required
                                            value={deliveryDate}
                                            onChange={(e) => setDeliveryDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="配送时间"
                                            type="time"
                                            fullWidth
                                            required
                                            value={deliveryTime}
                                            onChange={(e) => setDeliveryTime(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* 支付方式 */}
                            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#D4AF37', fontWeight: 'bold' }}>
                                    3. 支付方式
                                </Typography>
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        aria-label="payment-method"
                                        name="payment-method"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <FormControlLabel
                                            value="ALIPAY"
                                            control={<Radio />}
                                            label="支付宝"
                                            disabled
                                        />
                                        <FormControlLabel
                                            value="WECHAT"
                                            control={<Radio />}
                                            label="微信支付"
                                            disabled
                                        />
                                        <FormControlLabel
                                            value="ON_DELIVERY"
                                            control={<Radio />}
                                            label="到付"
                                        />
                                    </RadioGroup>
                                </FormControl>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    注：目前仅支持到付，后续获得营业执照后将支持支付宝和微信支付。
                                </Typography>
                            </Paper>

                            {/* 心意卡片 */}
                            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#D4AF37', fontWeight: 'bold' }}>
                                    4. 心意卡片 ✨
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
                                                src={getImageUrl(item.product.mainImagePath)}
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
                                    onClick={handleSubmitOrder}
                                    disabled={isSubmitting}
                                    sx={{
                                        background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                                        color: '#1B3A2B',
                                        fontWeight: 'bold',
                                        py: 1.5,
                                    }}
                                >
                                    {isSubmitting ? '提交中...' : '提交订单'}
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
