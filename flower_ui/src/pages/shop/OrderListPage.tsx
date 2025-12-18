import React, { useState } from 'react';
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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Pagination,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Search as SearchIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import ShopLayout from '../../components/shop/ShopLayout';
import PageContainer from '../../components/common/PageContainer';
import { motion } from 'framer-motion';
import { orderAPI, Order } from '../../api/orderAPI';
import { useAuthStore } from '../../store/authStore'; // Import authStore

const OrderListPage: React.FC = () => {
    const { user } = useAuthStore(); // Get user status
    const [searchPhone, setSearchPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({
        total: 0,
        current: 1,
        size: 10,
        pages: 0,
    });

    const [currentStatus, setCurrentStatus] = useState('ALL');

    const statusMap: Record<string, { text: string; color: string }> = {
        'PENDING': { text: '待支付', color: '#FF9800' },
        'PAID': { text: '已支付', color: '#4CAF50' },
        'PREPARING': { text: '准备中', color: '#2196F3' },
        'DELIVERING': { text: '配送中', color: '#03A9F4' },
        'COMPLETED': { text: '已完成', color: '#9C27B0' },
        'CANCELLED': { text: '已取消', color: '#F44336' },
    };

    const statusTabs = [
        { value: 'ALL', label: '全部' },
        { value: 'PENDING', label: '待支付' },
        { value: 'PAID', label: '已支付' },
        { value: 'PREPARING', label: '准备中' },
        { value: 'DELIVERING', label: '配送中' },
        { value: 'COMPLETED', label: '已完成' },
        { value: 'CANCELLED', label: '已取消' },
    ];

    // 加载当前用户的订单
    const fetchMyOrders = async (page: number = 1, statusOverride?: string) => {
        const statusToUse = statusOverride !== undefined ? statusOverride : currentStatus;
        setLoading(true);
        setError('');
        setCurrentPage(page);

        try {
            const response = await orderAPI.getMyOrders(
                statusToUse === 'ALL' ? undefined : statusToUse,
                page,
                10
            );

            if (!response || !response.records) {
                setError('查询失败，服务器返回数据格式错误');
                setOrders([]);
                return;
            }

            setOrders(response.records);
            setPaginationInfo({
                total: response.total,
                current: response.current,
                size: response.size,
                pages: response.pages,
            });

            if (response.records.length === 0 && statusToUse === 'ALL') {
                setError('您还没有相关订单');
            }
        } catch (err: any) {
            setError(err.message || '查询订单失败');
        } finally {
            setLoading(false);
        }
    };

    // 游客：根据手机号查询
    const handleSearch = async (page: number = 1, statusOverride?: string) => {
        if (!searchPhone.trim()) {
            setError('请输入手机号码');
            return;
        }

        const statusToUse = statusOverride !== undefined ? statusOverride : currentStatus;

        setLoading(true);
        setError('');
        setCurrentPage(page);

        try {
            const response = await orderAPI.getOrdersByPhone(
                searchPhone,
                statusToUse === 'ALL' ? undefined : statusToUse,
                page,
                10
            );

            if (!response || !response.records) {
                setError('查询失败，服务器返回数据格式错误');
                setOrders([]);
                return;
            }

            setOrders(response.records);
            setPaginationInfo({
                total: response.total,
                current: response.current,
                size: response.size,
                pages: response.pages,
            });

            if (response.records.length === 0 && statusToUse === 'ALL') {
                setError('未找到相关订单');
            }
        } catch (err: any) {
            setError(err.message || '查询失败,请重试');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // 统一的数据获取入口
    const fetchData = (page: number, status?: string) => {
        if (user) {
            fetchMyOrders(page, status);
        } else {
            handleSearch(page, status);
        }
    };

    // 初始化加载（如果是登录用户）
    React.useEffect(() => {
        if (user) {
            fetchMyOrders(1, 'ALL');
        }
    }, [user]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setCurrentStatus(newValue);
        fetchData(1, newValue);
    };

    const handleViewDetail = (order: Order) => {
        setSelectedOrder(order);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedOrder(null);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        fetchData(value);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(1);
        }
    };

    return (
        <ShopLayout>
            <PageContainer title="" maxWidth="md">
                <Container maxWidth="md" sx={{ py: 4 }}>
                    {/* 标题区域 */}
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1B3A2B' }}>
                            {user ? '我的订单' : '订单查询'}
                        </Typography>
                        {user && (
                            <Typography variant="body2" color="text.secondary">
                                当前用户: {user.username}
                            </Typography>
                        )}
                    </Box>

                    {/* 搜索区域 (仅游客显示) */}
                    {!user && (
                        <Paper
                            component={motion.div}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            sx={{ p: 3, mb: 3 }}
                        >
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
                                    onClick={() => handleSearch(1)}
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
                    )}

                    {/* 错误提示 */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* 状态过滤标签栏 (一直显示，除非是游客且没搜出结果) */}
                    {(user || orders.length > 0 || currentStatus !== 'ALL') && (
                        <Paper
                            sx={{ mb: 3, bgcolor: 'background.paper' }}
                            component={motion.div}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Tabs
                                value={currentStatus}
                                onChange={handleTabChange}
                                variant="scrollable" // ... rest of the props
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                                textColor="primary"
                                indicatorColor="primary"
                                sx={{
                                    '& .MuiTab-root': {
                                        minWidth: 80,
                                        fontWeight: 600,
                                    },
                                    '& .Mui-selected': {
                                        color: '#D4AF37',
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#D4AF37',
                                    }
                                }}
                            >
                                {statusTabs.map((tab) => (
                                    <Tab
                                        key={tab.value}
                                        label={tab.label}
                                        value={tab.value}
                                    />
                                ))}
                            </Tabs>
                        </Paper>
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
                                                                📍 {order.notes || '无配送地址'}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                🕐 {order.deliveryTime || '未指定配送时间'}
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

                            {/* 分页组件 */}
                            {paginationInfo.pages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    <Pagination
                                        count={paginationInfo.pages}
                                        page={currentPage}
                                        onChange={handlePageChange}
                                        color="primary"
                                        size="large"
                                        sx={{
                                            '& .MuiPaginationItem-root': {
                                                color: '#1B3A2B',
                                                '&.Mui-selected': {
                                                    backgroundColor: '#D4AF37',
                                                    color: '#1B3A2B',
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            )}
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
                                            📍 {selectedOrder.notes}
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

                                    {selectedOrder.cardContent && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                祝福贺卡
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                {selectedOrder.cardContent}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
                                                —— {selectedOrder.cardSender}
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