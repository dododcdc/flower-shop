import React from 'react';
import { Box, Container, Grid, Typography, Paper, Button, Divider, TextField, Radio, RadioGroup, FormControlLabel, FormControl } from '@mui/material';
import { motion } from 'framer-motion';
import ShopLayout from '../../components/shop/ShopLayout';
import { useAuthStore } from '../../store/authStore';

import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { orderAPI } from '../../api/orderAPI';
import { useCartStore } from '../../store/cartStore';
import MessageCardEditor from '../../components/shop/MessageCardEditor';
import { API_BASE_URL } from '../../constants';
import { CartItem } from '../../store/cartStore';
import {
    CalendarToday,
    AccessTime,
    CheckCircle,
    LocalShipping,
    CreditCard,
    Favorite,
    Login,
    ArrowForward
} from '@mui/icons-material';

// 配送时间段定义
const TIME_SLOTS = [
    { label: '上午 (09:00 - 12:00)', value: '09:00-12:00' },
    { label: '下午 (12:00 - 18:00)', value: '12:00-18:00' },
    { label: '晚上 (18:00 - 21:00)', value: '18:00-21:00' },
    { label: '尽快送达', value: '尽快送达' },
];

// 生成未来7天的配送日期
const getDeliveryDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // 格式化日期 YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // 格式化显示文本
        let dayLabel = '';
        if (i === 0) dayLabel = '今天';
        else if (i === 1) dayLabel = '明天';
        else if (i === 2) dayLabel = '后天';
        else {
            const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            dayLabel = weekdays[date.getDay()] || '';
        }

        dates.push({
            dateValue: dateStr,
            displayDay: dayLabel,
            displayDate: `${month}/${day}`
        });
    }
    return dates;
};

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();
    const { getSelectedItems, getTotalSelectedPrice, clearCart } = useCartStore();
    const { user } = useAuthStore(); // 获取登录用户

    // 获取来自路由状态的直接购买数据 (方案一)
    const directBuyItem = location.state?.directBuyItem as CartItem | undefined;
    const isDirectBuy = !!directBuyItem;

    // 根据来源确定显示的商品和总价
    const selectedItems = isDirectBuy ? [directBuyItem] : getSelectedItems();
    const totalPrice = isDirectBuy
        ? directBuyItem.product.price * directBuyItem.quantity
        : getTotalSelectedPrice();

    // 状态管理
    const [cardContent, setCardContent] = React.useState('');
    const [cardSender, setCardSender] = React.useState('');
    const [cardStyle, setCardStyle] = React.useState('simple');

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
    // 配送时间状态
    const deliveryDates = React.useMemo(() => getDeliveryDates(), []);
    const [deliveryDate, setDeliveryDate] = React.useState<string>(deliveryDates[0]?.dateValue || '');

    // 获取当前可用的时间段
    const getAvailableTimeSlots = React.useCallback((selectedDate: string) => {
        const todayStr = new Date().toISOString().split('T')[0];
        if (selectedDate !== todayStr) {
            return TIME_SLOTS;
        }

        const now = new Date();

        return TIME_SLOTS.filter((slot: { value: string; label: string }) => {
            if (slot.value === '尽快送达') return true;

            const parts = slot.value.split('-');
            if (parts.length < 2) return true;

            const endTimeStr = parts[1]?.split(':')[0];
            if (!endTimeStr) return true;

            const endTime = parseInt(endTimeStr, 10);

            // 预留 1 小时缓冲
            return (now.getHours() + 1) < endTime;
        });
    }, []);

    const availableSlots = React.useMemo(() => getAvailableTimeSlots(deliveryDate), [deliveryDate, getAvailableTimeSlots]);
    const [deliveryTime, setDeliveryTime] = React.useState<string>('');

    // 当日期改变或可用时段改变时，确保选中的时间段有效
    React.useEffect(() => {
        if (!availableSlots.find(s => s.value === deliveryTime)) {
            setDeliveryTime(availableSlots[0]?.value || '尽快送达');
        }
    }, [availableSlots, deliveryTime]);

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
                cardStyle: cardStyle || undefined,
                paymentMethod,
                items: selectedItems.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
            };

            const order = await orderAPI.createOrder(orderRequest);

            // 标记成功，防止显示空购物车界面
            setOrderSuccess(true);

            // 立即跳转到订单成功页面
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

            // 跳转后再根据来源决定是否清空购物车（避免当前页面重新渲染）
            if (!isDirectBuy) {
                setTimeout(() => {
                    clearCart();
                }, 100);
            }

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


                <Grid container spacing={4}>
                    {/* 左侧：表单区域 */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                            {!user && (
                                <Box sx={{
                                    py: 1.25,
                                    px: 2,
                                    mb: 2.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderRadius: 1,
                                    bgcolor: '#fff',
                                    border: '1px solid rgba(212, 175, 55, 0.12)',
                                    borderLeft: '4px solid #D4AF37',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                    gap: 1.5
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(212, 175, 55, 0.08)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <Login sx={{ color: '#D4AF37', fontSize: '1rem' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#1B3A2B', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                登录享更多优惠
                                                <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontWeight: 400, display: { xs: 'none', sm: 'inline' } }}>
                                                    • 建议登录后下单以便跟踪配送状态
                                                </Typography>
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => navigate('/login')}
                                        endIcon={<ArrowForward sx={{ fontSize: '0.9rem !important', transition: 'transform 0.2s' }} />}
                                        sx={{
                                            color: '#D4AF37',
                                            fontWeight: 800,
                                            fontSize: '0.8125rem',
                                            whiteSpace: 'nowrap',
                                            minWidth: 'auto',
                                            p: '4px 8px',
                                            '&:hover': {
                                                bgcolor: 'rgba(212, 175, 55, 0.05)',
                                                '& .MuiButton-endIcon': { transform: 'translateX(3px)' }
                                            }
                                        }}
                                    >
                                        立即登录
                                    </Button>
                                </Box>
                            )}

                            {/* 收货信息 */}
                            <Paper sx={{
                                p: 4,
                                mb: 4,
                                borderRadius: 1.5,
                                border: '1px solid rgba(212, 175, 55, 0.1)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                                    transform: 'translateY(-2px)'
                                }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                    <LocalShipping sx={{ color: '#D4AF37' }} />
                                    <Typography variant="h6" sx={{ color: '#1B3A2B', fontWeight: 'bold' }}>
                                        1. 收货信息
                                    </Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="收货人姓名"
                                            fullWidth
                                            required
                                            value={recipientName}
                                            onChange={(e) => setRecipientName(e.target.value)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': { borderColor: '#D4AF37' },
                                                    '&.Mui-focused fieldset': { borderColor: '#D4AF37' }
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': { color: '#D4AF37' }
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="联系电话"
                                            fullWidth
                                            required
                                            value={recipientPhone}
                                            onChange={(e) => setRecipientPhone(e.target.value)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': { borderColor: '#D4AF37' },
                                                    '&.Mui-focused fieldset': { borderColor: '#D4AF37' }
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': { color: '#D4AF37' }
                                            }}
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
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': { borderColor: '#D4AF37' },
                                                    '&.Mui-focused fieldset': { borderColor: '#D4AF37' }
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': { color: '#D4AF37' }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* 配送时间 */}
                            <Paper sx={{
                                p: 4,
                                mb: 4,
                                borderRadius: 1.5,
                                border: '1px solid rgba(212, 175, 55, 0.1)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                                    transform: 'translateY(-2px)'
                                }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                    <CalendarToday sx={{ color: '#D4AF37' }} />
                                    <Typography variant="h6" sx={{ color: '#1B3A2B', fontWeight: 'bold' }}>
                                        2. 配送时间
                                    </Typography>
                                </Box>

                                {/* 日期选择 */}
                                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 600 }}>
                                    选择日期
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 1.5,
                                    mb: 3,
                                    overflowX: 'auto',
                                    pb: 1,
                                    '&::-webkit-scrollbar': { height: '4px' },
                                    '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(212, 175, 55, 0.2)', borderRadius: 10 }
                                }}>
                                    {deliveryDates.map((item) => (
                                        <Box
                                            key={item.dateValue}
                                            onClick={() => setDeliveryDate(item.dateValue)}
                                            sx={{
                                                flexShrink: 0,
                                                width: 80,
                                                height: 90,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 0.75,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                border: '2px solid',
                                                borderColor: deliveryDate === item.dateValue ? '#D4AF37' : 'rgba(0,0,0,0.08)',
                                                bgcolor: deliveryDate === item.dateValue ? 'rgba(212, 175, 55, 0.05)' : 'white',
                                                background: deliveryDate === item.dateValue
                                                    ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.02) 100%)'
                                                    : 'white',
                                                boxShadow: deliveryDate === item.dateValue
                                                    ? '0 8px 20px rgba(212, 175, 55, 0.15)'
                                                    : '0 2px 8px rgba(0,0,0,0.02)',
                                                position: 'relative',
                                                '&:hover': {
                                                    borderColor: '#D4AF37',
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 12px 25px rgba(212, 175, 55, 0.2)'
                                                }
                                            }}
                                        >
                                            <Typography variant="caption" sx={{
                                                color: deliveryDate === item.dateValue ? '#D4AF37' : 'text.secondary',
                                                fontWeight: 600
                                            }}>
                                                {item.displayDay}
                                            </Typography>
                                            <Typography variant="h6" sx={{
                                                color: '#1B3A2B',
                                                fontWeight: 'bold',
                                                my: 0.2
                                            }}>
                                                {item.displayDate}
                                            </Typography>
                                            {deliveryDate === item.dateValue && (
                                                <CheckCircle sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    fontSize: 16,
                                                    color: '#D4AF37'
                                                }} />
                                            )}
                                        </Box>
                                    ))}
                                </Box>

                                {/* 时间段选择 */}
                                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 600 }}>
                                    选择时间段
                                </Typography>
                                <Grid container spacing={1.5}>
                                    {availableSlots.map((slot) => (
                                        <Grid size={{ xs: 6, sm: 3 }} key={slot.value}>
                                            <Box
                                                onClick={() => setDeliveryTime(slot.value)}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    height: 44,
                                                    borderRadius: 1,
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: deliveryTime === slot.value ? 'bold' : 500,
                                                    transition: 'all 0.2s ease',
                                                    border: '1px solid',
                                                    borderColor: deliveryTime === slot.value ? '#D4AF37' : 'rgba(0,0,0,0.1)',
                                                    bgcolor: deliveryTime === slot.value ? '#D4AF37' : 'transparent',
                                                    color: deliveryTime === slot.value ? '#1B3A2B' : 'text.primary',
                                                    boxShadow: deliveryTime === slot.value
                                                        ? '0 4px 12px rgba(212, 175, 55, 0.3)'
                                                        : 'none',
                                                    '&:hover': {
                                                        borderColor: '#D4AF37',
                                                        bgcolor: deliveryTime === slot.value ? '#D4AF37' : 'rgba(212, 175, 55, 0.05)',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                                    }
                                                }}
                                            >
                                                {slot.label.split(' ')[0]}
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                {deliveryTime !== '尽快送达' && (
                                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            您的订单将于 {deliveryDate} 的 {TIME_SLOTS.find(s => s.value === deliveryTime)?.label} 派送
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>

                            {/* 支付方式 */}
                            <Paper sx={{
                                p: 4,
                                mb: 4,
                                borderRadius: 1.5,
                                border: '1px solid rgba(212, 175, 55, 0.1)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                                    transform: 'translateY(-2px)'
                                }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                    <CreditCard sx={{ color: '#D4AF37' }} />
                                    <Typography variant="h6" sx={{ color: '#1B3A2B', fontWeight: 'bold' }}>
                                        3. 支付方式
                                    </Typography>
                                </Box>
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        aria-label="payment-method"
                                        name="payment-method"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <FormControlLabel
                                            value="ALIPAY"
                                            control={<Radio sx={{ color: '#D4AF37', '&.Mui-checked': { color: '#D4AF37' } }} />}
                                            label="支付宝"
                                            disabled
                                        />
                                        <FormControlLabel
                                            value="WECHAT"
                                            control={<Radio sx={{ color: '#D4AF37', '&.Mui-checked': { color: '#D4AF37' } }} />}
                                            label="微信支付"
                                            disabled
                                        />
                                        <FormControlLabel
                                            value="ON_DELIVERY"
                                            control={<Radio sx={{ color: '#D4AF37', '&.Mui-checked': { color: '#D4AF37' } }} />}
                                            label="到付 (推荐)"
                                        />
                                    </RadioGroup>
                                </FormControl>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    注：目前仅支持到付，后续获得营业执照后将支持支付宝和微信支付。
                                </Typography>
                            </Paper>

                            {/* 心意卡片 */}
                            <Paper sx={{
                                p: 4,
                                mb: 4,
                                borderRadius: 1.5,
                                border: '1px solid rgba(212, 175, 55, 0.1)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                                    transform: 'translateY(-2px)'
                                }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                    <Favorite sx={{ color: '#F06292' }} />
                                    <Typography variant="h6" sx={{ color: '#1B3A2B', fontWeight: 'bold' }}>
                                        4. 心意卡片
                                    </Typography>
                                </Box>
                                <MessageCardEditor
                                    content={cardContent}
                                    sender={cardSender}
                                    onContentChange={setCardContent}
                                    onSenderChange={setCardSender}
                                    onStyleChange={setCardStyle}
                                    cardStyle={cardStyle}
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
                            <Paper sx={{
                                p: 4,
                                borderRadius: 1.5,
                                bgcolor: 'white',
                                border: '1px solid rgba(212, 175, 55, 0.15)',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.04)'
                            }}>
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
                                                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 0.75 }}
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
