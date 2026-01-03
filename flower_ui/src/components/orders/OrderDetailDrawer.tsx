import React from 'react';
import {
    Box,
    Typography,
    Drawer,
    IconButton,
    Divider,
    Chip,
    Button,
    Grid,
    useTheme,
    useMediaQuery,
    Stack
} from '@mui/material';
import {
    Close as CloseIcon,
    LocalShipping as ShippingIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';
import { Order } from '../../api/orderAPI';

interface OrderDetailDrawerProps {
    open: boolean;
    order: Order | null;
    onClose: () => void;
}

const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({ open, order, onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!order) return null;

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
        return order.deliveryTime || '-';
    };

    return (
        <Drawer
            anchor={isMobile ? 'bottom' : 'right'}
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: isMobile ? '100%' : 480,
                    height: isMobile ? '85vh' : '100%',
                    borderTopLeftRadius: isMobile ? 16 : 0,
                    borderTopRightRadius: isMobile ? 16 : 0,
                    bgcolor: '#FAFAFA'
                }
            }}
            // 关键：不锁定背景滚动，彻底解决抖动和白屏问题
            disableScrollLock={false}
        >
            {/* Header */}
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
                <Box>
                    <Typography variant="subtitle2" color="text.secondary">订单详情</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif' }}>
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
                <Box sx={{ p: 3, bgcolor: statusInfo.bg, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                        label={statusInfo.text}
                        sx={{
                            bgcolor: statusInfo.color,
                            color: 'white',
                            fontWeight: 'bold',
                            height: 32
                        }}
                    />
                    <Box>
                        <Typography variant="body2" sx={{ color: statusInfo.color, fontWeight: 600 }}>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''} 下单
                        </Typography>
                        <Typography variant="caption" sx={{ color: statusInfo.color, opacity: 0.8 }}>
                            感谢您的订购
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

                    {/* Products */}
                    <Box sx={{ bgcolor: 'white', p: 2.5, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalShippingIconWrapper /> 商品信息
                        </Typography>
                        <Stack spacing={2}>
                            {order.items?.map((item, index) => (
                                <Box key={item.id || index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {item.productName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            数量: {item.quantity}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        ¥{(item.totalPrice || 0).toFixed(2)}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">总计金额</Typography>
                            <Typography variant="h6" sx={{ color: '#D4AF37', fontWeight: 700 }}>
                                ¥{order.totalAmount.toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Delivery Info */}
                    <Box sx={{ bgcolor: 'white', p: 2.5, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIconWrapper /> 配送信息
                        </Typography>
                        <Grid container spacing={2}>
                            <InfoItem label="收货人" value={order.customerName || '-'} />
                            <InfoItem label="联系电话" value={order.customerPhone || '-'} />
                            <InfoItem label="配送时间" value={formatDeliveryTime(order)} fullWidth />
                            <InfoItem label="配送地址" value={order.notes || order.addressText || '-'} fullWidth />
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

            {/* Footer Actions */}
            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={onClose}
                    sx={{
                        bgcolor: '#1B3A2B',
                        color: 'white',
                        py: 1.5,
                        '&:hover': { bgcolor: '#142c20' }
                    }}
                >
                    关闭详情
                </Button>
            </Box>
        </Drawer>
    );
};

// Helper Components
const InfoItem = ({ label, value, fullWidth = false }: { label: string, value: string, fullWidth?: boolean }) => (
    <Grid size={fullWidth ? 12 : 6}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {value}
        </Typography>
    </Grid>
);

const LocalShippingIconWrapper = () => <ShippingIcon sx={{ fontSize: 18, color: 'text.secondary' }} />;
const LocationIconWrapper = () => <LocationIcon sx={{ fontSize: 18, color: 'text.secondary' }} />;

export default OrderDetailDrawer;
