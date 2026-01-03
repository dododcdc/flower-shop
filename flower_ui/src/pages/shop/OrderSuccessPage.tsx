import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Card,
    CardContent,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Home as HomeIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import ShopLayout from '../../components/shop/ShopLayout';
import { motion } from 'framer-motion';
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

    // 确保进入页面时滚动到顶部
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
            <PageContainer maxWidth="md">
                <Container maxWidth="sm" sx={{ py: 2 }}>
                    {/* 成功提示 */}
                    <Box component={motion.div}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        sx={{ textAlign: 'center', mb: 3 }}>
                        <CheckCircleIcon
                            sx={{
                                fontSize: 60,
                                color: '#4CAF50',
                                mb: 1
                            }}
                        />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1B3A2B', mb: 1 }}>
                            订单提交成功！
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            我们已收到您的订单，正在为您精心准备鲜花
                        </Typography>
                    </Box>

                    {/* 订单号显示 */}
                    <Paper
                        component={motion.div}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        sx={{
                            p: 2,
                            mb: 3,
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: '#E8F5E8',
                            borderRadius: 1.5,
                            background: 'linear-gradient(135deg, #F8FFFE 0%, #F0FFF4 100%)',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            订单编号
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1B3A2B' }}>
                            {orderData.orderNo}
                        </Typography>
                    </Paper>

                    {/* 温馨提示 */}
                    <Card
                        component={motion.div}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        sx={{
                            mb: 3,
                            p: 2,
                            background: 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%)',
                            border: '1px solid #FBC02D'
                        }}
                    >
                        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#F57C00' }}>
                                温馨提示
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                配送前我们会电话确认，请保持手机畅通。
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                如需查看订单详情，请点击右上角"查询订单"。
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* 操作按钮 */}
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
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
                                },
                                py: 1,
                                px: 3
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
                                },
                                py: 1,
                                px: 3
                            }}
                        >
                            返回首页
                        </Button>
                    </Box>
                </Container>
            </PageContainer>
        </ShopLayout>
    );
};

export default OrderSuccessPage;