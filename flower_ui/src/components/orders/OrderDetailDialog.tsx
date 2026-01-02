import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  TextField,
  CircularProgress,
  Slide,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { orderAPI, type Order } from '../../api/orderAPI';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  loading?: boolean;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({ order, open, onClose, onUpdate, loading: externalLoading = false }) => {
  const [loading, setLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);

  const isLoading = externalLoading || loading;

  if (!order) return null;

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': '待确认',
      'PREPARING': '准备中',
      'DELIVERING': '配送中',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'PENDING': '#FF9800',
      'PREPARING': '#2196F3',
      'DELIVERING': '#9C27B0',
      'COMPLETED': '#4CAF50',
      'CANCELLED': '#9E9E9E',
    };
    return colorMap[status] || '#757575';
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': '待支付',
      'PAID': '已支付',
    };
    return statusMap[status] || status;
  };

  const canConfirm = order.status === 'PENDING';
  const canStartDelivery = order.status === 'PREPARING';
  const canComplete = order.status === 'DELIVERING';
  const canCancel = order.status === 'PENDING' || order.status === 'PREPARING';

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await orderAPI.confirmOrder(order.id);
      onUpdate();
      onClose();
    } catch (err) {
      console.error('确认订单失败', err);
      alert(err instanceof Error ? err.message : '确认订单失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDelivery = async () => {
    try {
      setLoading(true);
      await orderAPI.startDelivery(order.id);
      onUpdate();
      onClose();
    } catch (err) {
      console.error('开始配送失败', err);
      alert(err instanceof Error ? err.message : '开始配送失败');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      await orderAPI.completeOrder(order.id);
      onUpdate();
      onClose();
    } catch (err) {
      console.error('完成配送失败', err);
      alert(err instanceof Error ? err.message : '完成配送失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!showCancelInput) {
      setShowCancelInput(true);
      return;
    }

    try {
      setLoading(true);
      await orderAPI.cancelOrder(order.id, cancelReason);
      onUpdate();
      onClose();
      setShowCancelInput(false);
      setCancelReason('');
    } catch (err) {
      console.error('取消订单失败', err);
      alert(err instanceof Error ? err.message : '取消订单失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        '& .MuiDialog-container': {
          '& .MuiDialog-paper': {
            maxHeight: '80vh',
          },
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            订单详情
          </Typography>
          <Chip
            label={getStatusText(order.status)}
            sx={{
              bgcolor: getStatusColor(order.status),
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 基本信息 */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
              基本信息
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '0.875rem' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  订单号:
                </Typography>
                <Typography variant="body2">{order.orderNo}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  订单状态:
                </Typography>
                <Typography variant="body2">{getStatusText(order.status)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  下单时间:
                </Typography>
                <Typography variant="body2">{formatDate(order.createdAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  支付方式:
                </Typography>
                <Typography variant="body2">{order.paymentMethod === 'ON_DELIVERY' ? '到付' : '在线支付'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  支付状态:
                </Typography>
                <Typography variant="body2">{getPaymentStatusText(order.paymentStatus)}</Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* 客户信息 */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
              客户信息
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '0.875rem' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  姓名:
                </Typography>
                <Typography variant="body2">{order.customerName}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  手机:
                </Typography>
                <Typography variant="body2">{order.customerPhone}</Typography>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="body2" color="text.secondary">
                  地址:
                </Typography>
                <Typography variant="body2">{order.addressText || order.notes || '-'}</Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* 商品信息 */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
              商品信息
            </Typography>
            {order.items && order.items.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {order.items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      py: 0.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2">
                      {item.productName} × {item.quantity}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ¥{item.subtotal?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '2px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    商品总价:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ¥{order.totalAmount?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                暂无商品信息
              </Typography>
            )}
          </Box>

          <Divider />

          {/* 费用明细 */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
              费用明细
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, fontSize: '0.875rem' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">商品总价:</Typography>
                <Typography variant="body2">¥{order.totalAmount?.toFixed(2) || '0.00'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">配送费:</Typography>
                <Typography variant="body2">¥{order.deliveryFee?.toFixed(2) || '0.00'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '2px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  最终金额:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#D4AF37', fontSize: '1.1rem' }}>
                  ¥{order.finalAmount?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* 配送信息 */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
              配送信息
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '0.875rem' }}>
              {order.deliveryTime && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    期望配送:
                  </Typography>
                  <Typography variant="body2">{formatDate(order.deliveryTime)}</Typography>
                </Box>
              )}
              {order.cardContent && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    贺卡内容:
                  </Typography>
                  <Typography variant="body2">{order.cardContent}</Typography>
                </Box>
              )}
              {order.cardSender && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    贺卡署名:
                  </Typography>
                  <Typography variant="body2">{order.cardSender}</Typography>
                </Box>
              )}
              {order.notes && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="body2" color="text.secondary">
                    订单备注:
                  </Typography>
                  <Typography variant="body2">{order.notes}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {showCancelInput ? (
          <>
            <TextField
              size="small"
              placeholder="请输入取消原因"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button onClick={() => {
              setShowCancelInput(false);
              setCancelReason('');
            }}>
              取消
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancel}
              disabled={loading}
            >
              确认取消
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} disabled={isLoading}>
              关闭
            </Button>
            {canCancel && (
              <Button
                color="error"
                onClick={handleCancel}
                disabled={isLoading}
              >
                取消订单
              </Button>
            )}
            {canComplete && (
              <Button
                variant="contained"
                onClick={handleComplete}
                disabled={isLoading}
                sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45A049' } }}
              >
                完成配送并收款
              </Button>
            )}
            {canStartDelivery && (
              <Button
                variant="contained"
                onClick={handleStartDelivery}
                disabled={isLoading}
              >
                开始配送
              </Button>
            )}
            {canConfirm && (
              <Button
                variant="contained"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                确认订单
              </Button>
            )}
          </>
        )}
        {isLoading && (
          <CircularProgress size={24} sx={{ ml: 1 }} />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailDialog;
