import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Grid,
    Card,
    CardContent,
    Divider,
    IconButton,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Home as HomeIcon,
    Receipt as ReceiptIcon,
    LocalShipping as ShippingIcon,
    Phone as PhoneIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';
import ShopLayout from '../../layouts/ShopLayout';
import { motion } from 'motion/react';
import PageContainer from '../../components/common/PageContainer';

interface OrderData {
    orderNo: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryTime: string;
    totalAmount: number;
    message?: string;
}

const OrderSuccessPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderData = location.state as OrderData;

    if (!orderData) {
        navigate('/shop');
        return null;
    }

    const handleContinueShopping = () => {
        navigate('/shop');
    };

    const handleViewOrders = () => {
        // 如果有订单查询页面，可以跳转到那里
        navigate('/shop');
    };

    return (
        <ShopLayout>
            <PageContainer title="订单提交成功" maxWidth="md">
                <Container maxWidth="sm" sx={{ py: 4 }}>
                    {/* 成功提示 */}
                    <Box component={motion.div}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        sx={{ textAlign: 'center', mb: 4 }}>
                        <CheckCircleIcon
                            sx={{
                                fontSize: 80,
                                color: '#4CAF50',
                                mb: 2
                            }}
                        />
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1B3A2B', mb: 1 }}>
                            订单提交成功！
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            我们已收到您的订单，正在为您精心准备鲜花
                        </Typography>
                    </Box>

                    {/* 订单信息卡片 */}
                    <Paper
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        sx={{
                            p: 3,
                            mb: 3,
                            border: '2px solid',
                            borderColor: '#E8F5E8',
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #F8FFFE 0%, #F0FFF4 100%)',
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, color: '#1B3A2B', fontWeight: 'bold' }}>
                            订单信息
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    订单编号
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {orderData.orderNo}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    订单金额
                                </Typography>
                                <Typography variant="h6" sx={{ color: '#E91E63', fontWeight: 'bold' }}>
                                    ¥{orderData.totalAmount?.toFixed(2) || '0.00'}
                                </Typography>
                            </Grid>
                        </Grid>

                        {orderData.message && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    祝福贺卡
                                </Typography>
                                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                                    {orderData.message}
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    {/* 配送信息卡片 */}
                    <Paper
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        sx={{ p: 3, mb: 3 }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, color: '#1B3A2B', fontWeight: 'bold' }}>
                            配送信息
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ScheduleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        预计配送时间
                                    </Typography>
                                    <Typography variant="body1">
                                        {orderData.deliveryTime}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocalShippingIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        配送地址
                                    </Typography>
                                    <Typography variant="body1">
                                        {orderData.deliveryAddress}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        联系电话
                                    </Typography>
                                    <Typography variant="body1">
                                        {orderData.customerPhone}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* 温馨提示 */}
                    <Card
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        sx={{
                            mb: 3,
                            background: 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%)',
                            border: '1px solid #FBC02D'
                        }}
                    >
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#F57C00' }}>
                                温馨提示
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                配送前我们会电话确认，请保持手机畅通。如需修改订单信息，请及时联系我们。
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* 操作按钮 */}
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<HomeIcon />}
                            onClick={handleContinueShopping}
                            sx={{
                                borderColor: '#E91E63',
                                color: '#E91E63',
                                '&:hover': {
                                    borderColor: '#C2185B',
                                    backgroundColor: 'rgba(233, 30, 99, 0.04)'
                                }
                            }}
                        >
                            继续购物
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<ReceiptIcon />}
                            onClick={handleViewOrders}
                            sx={{
                                background: 'linear-gradient(45deg, #E91E63 30%, #F06292 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #C2185B 30%, #E91E63 90%)'
                                }
                            }}
                        >
                            查看订单
                        </Button>
                    </Box>
                </Container>
            </PageContainer>
        </ShopLayout>
    );
};

export default OrderSuccessPage;