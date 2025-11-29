import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    Chip,
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    LocalShipping as ShippingIcon,
    Phone as PhoneIcon,
    Schedule as ScheduleIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import ShopLayout from '../../components/shop/ShopLayout';
import PageContainer from '../../components/common/PageContainer';
import { motion } from 'framer-motion';

interface OrderInfo {
    id: number;
    orderNo: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryTime: string;
    totalAmount: number;
    status: number; // 1-已付款 2-准备中 3-配送中 4-已完成
    message?: string;
    createdAt: string;
    items?: OrderItem[];
}

interface OrderItem {
    id: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

const OrderListPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchPhone, setSearchPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<OrderInfo[]>([]);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<OrderInfo | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const statusMap = {
        1: { text: '已付款', color: '#4CAF50' },
        2: { text: '准备中', color: '#FF9800' },
        3: { text: '配送中', color: '#2196F3' },
        4: { text: '已完成', color: '#9C27B0' },
    };

    const handleSearch = async () => {
        if (!searchPhone.trim()) {
            setError('请输入手机号码');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 这里需要调用实际的API查询订单
            // const response = await orderAPI.getOrdersByPhone(searchPhone);
            // 暂时使用模拟数据
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 模拟数据
            const mockOrders: OrderInfo[] = [
                {
                    id: 1,
                    orderNo: 'ORD202501290001',
                    customerName: '张三',
                    customerPhone: searchPhone,
                    deliveryAddress: '北京市朝阳区建国路88号',
                    deliveryTime: '2025-01-29 14:00-16:00',
                    totalAmount: 299.00,
                    status: 2,
                    message: '生日快乐！',
                    createdAt: '2025-01-29 10:30:00',
                },
            ];

            setOrders(mockOrders);

            if (mockOrders.length === 0) {
                setError('未找到相关订单');
            }
        } catch (err: any) {
            setError(err.message || '查询失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (order: OrderInfo) => {
        setSelectedOrder(order);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedOrder(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <ShopLayout>
            <PageContainer title="订单查询" maxWidth="md">
                <Container maxWidth="md" sx={{ py: 4 }}>
                    {/* 搜索区域 */}
                    <Paper
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        sx={{ p: 3, mb: 3 }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, color: '#1B3A2B', fontWeight: 'bold' }}>
                            查询我的订单
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                            <TextField
                                fullWidth
                                label="请输入下单时填写的手机号"
                                variant="outlined"
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                                onKeyPress={handleKeyPress}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#D4AF37',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#D4AF37',
                                        },
                                    },
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSearch}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                                sx={{
                                    background: 'linear-gradient(45deg, #E91E63 30%, #F06292 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #C2185B 30%, #E91E63 90%)',
                                    },
                                    minWidth: 120,
                                }}
                            >
                                {loading ? '查询中' : '查询'}
                            </Button>
                        </Box>
                    </Paper>

                    {/* 错误提示 */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* 订单列表 */}
                    {orders.length > 0 && (
                        <Box component={motion.div}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: '#1B3A2B', fontWeight: 'bold' }}>
                                    订单列表
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    共找到 {orders.length} 个订单
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                {orders.map((order, index) => (
                                    <Grid size={{ xs: 12 }} key={order.id}>
                                        <Card
                                            component={motion.div}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.1 * index }}
                                            sx={{
                                                border: '1px solid #E0E0E0',
                                                '&:hover': {
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                    transform: 'translateY(-2px)',
                                                },
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => handleViewDetail(order)}
                                        >
                                            <CardContent>
                                                <Grid container spacing={2}>
                                                    <Grid size={{ xs: 12, sm: 8 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                            <Box>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1B3A2B' }}>
                                                                    {order.orderNo}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {order.createdAt}
                                                                </Typography>
                                                            </Box>
                                                            <Chip
                                                                label={statusMap[order.status as keyof typeof statusMap]?.text}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: statusMap[order.status as keyof typeof statusMap]?.color,
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                }}
                                                            />
                                                        </Box>

                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                📍 {order.deliveryAddress}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                🕐 {order.deliveryTime}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>

                                                    <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'right' }}>
                                                        <Typography variant="h6" sx={{ color: '#E91E63', fontWeight: 'bold' }}>
                                                            ¥{order.totalAmount.toFixed(2)}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewDetail(order);
                                                            }}
                                                            sx={{ mt: 1 }}
                                                        >
                                                            <ReceiptIcon />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* 订单详情弹窗 */}
                    <Dialog
                        open={detailOpen}
                        onClose={handleCloseDetail}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: {
                                borderRadius: 2,
                            },
                        }}
                    >
                        {selectedOrder && (
                            <>
                                <DialogTitle sx={{ bgcolor: '#1B3A2B', color: '#F4E4C1' }}>
                                    订单详情
                                </DialogTitle>
                                <DialogContent sx={{ p: 3 }}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            订单编号
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {selectedOrder.orderNo}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            订单状态
                                        </Typography>
                                        <Chip
                                            label={statusMap[selectedOrder.status as keyof typeof statusMap]?.text}
                                            size="small"
                                            sx={{
                                                backgroundColor: statusMap[selectedOrder.status as keyof typeof statusMap]?.color,
                                                color: 'white',
                                                fontWeight: 'bold',
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            配送信息
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                            📍 {selectedOrder.deliveryAddress}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                            🕐 {selectedOrder.deliveryTime}
                                        </Typography>
                                        <Typography variant="body2">
                                            📞 {selectedOrder.customerPhone}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            订单金额
                                        </Typography>
                                        <Typography variant="h6" sx={{ color: '#E91E63', fontWeight: 'bold' }}>
                                            ¥{selectedOrder.totalAmount.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    {selectedOrder.message && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                祝福贺卡
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                {selectedOrder.message}
                                            </Typography>
                                        </Box>
                                    )}
                                </DialogContent>
                                <DialogActions sx={{ p: 3 }}>
                                    <Button onClick={handleCloseDetail} variant="contained">
                                        关闭
                                    </Button>
                                </DialogActions>
                            </>
                        )}
                    </Dialog>
                </Container>
            </PageContainer>
        </ShopLayout>
    );
};

export default OrderListPage;