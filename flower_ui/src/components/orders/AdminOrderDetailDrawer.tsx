import React, { useState } from 'react';
import {
    Box,
    Typography,
    Drawer,
    IconButton,
    Chip,
    Button,
    Grid,
    useTheme,
    useMediaQuery,
    Stack,
    TextField,
    Alert,
    Avatar
} from '@mui/material';
import {
    Close as CloseIcon,
    LocalShipping as ShippingIcon,
    Person as PersonIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    DirectionsBike as BikeIcon,
    Inventory as InventoryIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import { orderAPI, Order } from '../../api/orderAPI';
import { API_BASE_URL } from '../../constants';

interface AdminOrderDetailDrawerProps {
    open: boolean;
    order: Order | null;
    onClose: () => void;
    onUpdate: () => void;
    isLoadingDetail?: boolean;
}

const AdminOrderDetailDrawer: React.FC<AdminOrderDetailDrawerProps> = ({ open, order, onClose, onUpdate, isLoadingDetail = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [loading, setLoading] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelInput, setShowCancelInput] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!order) return null;

    // 格式化配送时间显示
    const formatDeliveryTime = (order: Order) => {
        if (order.deliveryStartTime && order.deliveryEndTime) {
            const start = new Date(order.deliveryStartTime);
            const end = new Date(order.deliveryEndTime);

            const dateStr = start.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const startTimeStr = start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
            const endTimeStr = end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

            return `${dateStr} ${startTimeStr} - ${endTimeStr}`;
        }
        return '-';
    };

    // 获取图片URL（与其他地方保持一致）
    const getImageUrl = (imagePath: string | undefined): string => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/uploads/')) {
            return `${API_BASE_URL}${imagePath}`;
        }
        return imagePath;
    };

    const cardStyleMap: Record<string, string> = {
        'simple': '简约白',
        'romantic': '浪漫粉',
        'business': '商务金',
    };

    const statusMap: Record<string, { text: string; color: string; bg: string }> = {
        'PENDING': { text: '待确认', color: '#B76E00', bg: '#FFF4E5' },
        'PREPARING': { text: '准备中', color: '#00497A', bg: '#E5F6FD' },
        'DELIVERING': { text: '配送中', color: '#7B1FA2', bg: '#F3E5F5' },
        'COMPLETED': { text: '已完成', color: '#1B5E20', bg: '#E8F5E9' },
        'CANCELLED': { text: '已取消', color: '#C62828', bg: '#FFEBEE' },
    };

    const statusInfo = statusMap[order.status] || { text: order.status, color: 'text.primary', bg: 'grey.100' };

    // Action Logic
    const canConfirm = order.status === 'PENDING';
    const canStartDelivery = order.status === 'PREPARING';
    const canComplete = order.status === 'DELIVERING';
    const canCancel = order.status === 'PENDING' || order.status === 'PREPARING';

    const handleAction = async (action: () => Promise<Order>) => {
        try {
            setLoading(true);
            setError(null);
            await action();
            onUpdate();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || '操作失败');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => { await handleAction(() => orderAPI.confirmOrder(order.id), '订单已确认'); };
    const handleStartDelivery = async () => { await handleAction(() => orderAPI.startDelivery(order.id), '开始配送'); };
    const handleComplete = async () => { await handleAction(() => orderAPI.completeOrder(order.id), '订单已完成'); };

    const handleCancel = async () => {
        if (!showCancelInput) {
            setShowCancelInput(true);
            return;
        }
        if (!cancelReason.trim()) {
            setError('请输入取消原因');
            return;
        }
        await handleAction(() => orderAPI.cancelOrder(order.id, cancelReason), '订单已取消');
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: isMobile ? '100%' : 600,
                    bgcolor: '#FAFAFA'
                }
            }}
            disableScrollLock={false}
        >
            {/* Header */}
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
                <Box>
                    <Typography variant="subtitle2" color="text.secondary">订单管理</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        {order.orderNo}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: 0, overflowY: 'auto', flexGrow: 1 }}>

                {/* Status Banner */}
                <Box sx={{ p: 3, bgcolor: statusInfo.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            label={statusInfo.text}
                            sx={{
                                bgcolor: statusInfo.color,
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        />
                        <Typography variant="body2" sx={{ color: statusInfo.color, fontWeight: 600 }}>
                            {new Date(order.createdAt).toLocaleString()}
                        </Typography>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

                    {/* Action Panel */}
                    {(canConfirm || canStartDelivery || canComplete || canCancel) && (
                        <Box sx={{ bgcolor: 'white', p: 2.5, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #E0E0E0' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                                订单操作
                            </Typography>

                            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                                {canConfirm && (
                                    <Button
                                        variant="contained" color="primary"
                                        startIcon={<CheckCircleIcon />}
                                        onClick={handleConfirm} disabled={loading}
                                    >
                                        确认订单
                                    </Button>
                                )}
                                {canStartDelivery && (
                                    <Button
                                        variant="contained" color="secondary"
                                        startIcon={<BikeIcon />}
                                        onClick={handleStartDelivery} disabled={loading}
                                        sx={{ color: 'white' }}
                                    >
                                        开始配送
                                    </Button>
                                )}
                                {canComplete && (
                                    <Button
                                        variant="contained" color="success"
                                        startIcon={<InventoryIcon />}
                                        onClick={handleComplete} disabled={loading}
                                    >
                                        完成订单
                                    </Button>
                                )}
                                {canCancel && (
                                    <Button
                                        variant="outlined" color="error"
                                        startIcon={<CancelIcon />}
                                        onClick={() => setShowCancelInput(true)} disabled={loading}
                                    >
                                        取消订单
                                    </Button>
                                )}
                            </Stack>

                            {/* Cancel Input */}
                            {showCancelInput && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#FFEBEE', borderRadius: 1 }}>
                                    <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>取消原因确认</Typography>
                                    <TextField
                                        fullWidth size="small" multiline rows={2}
                                        placeholder="请输入取消原因..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        sx={{ mt: 1, bgcolor: 'white' }}
                                    />
                                    <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                        <Button size="small" onClick={() => setShowCancelInput(false)}>放弃</Button>
                                        <Button size="small" variant="contained" color="error" onClick={handleCancel} disabled={loading}>确认取消</Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Products */}
                    <Box sx={{ bgcolor: 'white', p: 2.5, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ShippingIcon sx={{ fontSize: 18, color: 'text.secondary' }} /> 商品明细
                        </Typography>
                        <Stack spacing={2}>
                            {isLoadingDetail ? (
                                // Loading Skeleton
                                [1, 2].map((i) => (
                                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                        <Box sx={{ width: '60%' }}>
                                            <Typography variant="body2" sx={{ bgcolor: '#eee', color: 'transparent', borderRadius: 1 }}>Loading Product Name...</Typography>
                                        </Box>
                                        <Box sx={{ width: '20%' }}>
                                            <Typography variant="body2" sx={{ bgcolor: '#eee', color: 'transparent', borderRadius: 1 }}>¥0.00</Typography>
                                        </Box>
                                    </Box>
                                ))
                            ) : (!order.items || order.items.length === 0) ? (
                                <Box sx={{ py: 2, textAlign: 'center', color: 'text.secondary', bgcolor: '#f9f9f9', borderRadius: 1 }}>
                                    <Typography variant="body2">暂无商品明细</Typography>
                                </Box>
                            ) : (
                                order.items.map((item, index) => (
                                    <Box key={item.id || index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px dashed #eee' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {/* Product Image */}
                                            <Avatar
                                                src={getImageUrl(item.productImage)}
                                                variant="rounded"
                                                sx={{ width: 48, height: 48, bgcolor: 'grey.100' }}
                                            >
                                                <ImageIcon sx={{ color: 'grey.400' }} />
                                            </Avatar>

                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {item.productName}
                                                </Typography>
                                                {/* Optional: Show specs if available in future */}
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                x {item.quantity}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                ¥{(item.totalPrice || 0).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Stack>

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                                配送费: ¥{(order.deliveryFee || 0).toFixed(2)}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#D4AF37', fontWeight: 700 }}>
                                总计: ¥{order.totalAmount?.toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Customer Info */}
                    <Box sx={{ bgcolor: 'white', p: 2.5, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} /> 客户与配送
                        </Typography>
                        <Grid container spacing={2}>
                            <InfoItem label="收货人" value={order.customerName} />
                            <InfoItem label="电话" value={order.customerPhone} />
                            <InfoItem label="支付方式" value={order.paymentMethod === 'ON_DELIVERY' ? '货到付款' : '在线支付'} />
                            <InfoItem label="支付状态" value={order.paymentStatus === 'PAID' ? '已支付' : '待支付'} />
                            <InfoItem label="配送时间" value={formatDeliveryTime(order)} fullWidth />
                            <InfoItem label="地址" value={order.addressText || order.notes} fullWidth />
                        </Grid>
                    </Box>

                    {/* Greeting Card */}
                    {(order.cardContent || order.cardSender) && (
                        <Box sx={{ bgcolor: '#FFFDF5', p: 2.5, borderRadius: 2, border: '1px dashed #D4AF37' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#B76E00' }}>
                                ✉️ 祝福贺卡
                            </Typography>
                            {order.cardStyle && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <Typography variant="caption" sx={{ color: '#8D6E63', fontWeight: 600 }}>
                                        卡片风格:
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#B76E00' }}>
                                        {cardStyleMap[order.cardStyle] || order.cardStyle}
                                    </Typography>
                                </Box>
                            )}
                            {order.cardContent && (
                                <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1, color: '#4A4A4A' }}>
                                    "{order.cardContent}"
                                </Typography>
                            )}
                            {order.cardSender && (
                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', color: '#8D6E63' }}>
                                    —— {order.cardSender}
                                </Typography>
                            )}
                        </Box>
                    )}

                </Box>
            </Box>
        </Drawer>
    );
};

// Helper Component
const InfoItem = ({ label, value, fullWidth = false }: { label: string, value?: string | null | undefined, fullWidth?: boolean }) => (
    <Grid xs={fullWidth ? 12 : 6} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="caption" color="text.secondary" display="block">
            {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {value || '-'}
        </Typography>
    </Grid>
);

export default AdminOrderDetailDrawer;
