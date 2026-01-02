import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Chip,
  Pagination,
  Typography,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { orderAPI, type Order, type OrderFilters } from '../../api/orderAPI';
import OrderDetailDialog from './OrderDetailDialog';

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState<OrderFilters>({
    current: 1,
    size: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const [searchForm, setSearchForm] = useState({
    keyword: '',
    status: '',
    dateRange: '',
    sortBy: 'created_at-desc',
  });

  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    if (!isComposing) {
      const timer = setTimeout(() => {
        setDebouncedKeyword(searchForm.keyword);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchForm.keyword, isComposing]);

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await orderAPI.searchOrders(filters);
      setOrders(response.records);
      setPagination({
        current: response.current,
        size: response.size,
        total: response.total,
        pages: response.pages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载订单失败');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let sortBy = 'created_at';
    let sortOrder = 'desc';

    if (searchForm.sortBy && searchForm.sortBy.includes('-')) {
      const [sortField, sortDirection] = searchForm.sortBy.split('-');
      sortBy = sortField;
      sortOrder = sortDirection;
    }

    let startDate: string | undefined;
    let endDate: string | undefined;

    const today = new Date();
    if (searchForm.dateRange === 'today') {
      startDate = today.toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
    } else if (searchForm.dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
    } else if (searchForm.dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
    }

    const newFilters: OrderFilters = {
      current: 1,
      size: 10,
      keyword: debouncedKeyword || undefined,
      status: searchForm.status || undefined,
      startDate,
      endDate,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    };

    setFilters(newFilters);
  };

  useEffect(() => {
    handleSearch();
  }, [debouncedKeyword, searchForm.status, searchForm.dateRange, searchForm.sortBy]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setFilters({
      ...filters,
      current: value,
    });
  };

  const handleReset = () => {
    setSearchForm({
      keyword: '',
      status: '',
      dateRange: '',
      sortBy: 'created_at-desc',
    });
    setFilters({
      current: 1,
      size: 10,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const handleViewDetail = async (orderId: number) => {
    try {
      setDetailLoading(true);
      const orderDetail = await orderAPI.getOrderDetail(orderId);
      setSelectedOrder(orderDetail);
      setDetailDialogOpen(true);
    } catch (err) {
      console.error('加载订单详情失败', err);
      setError(err instanceof Error ? err.message : '加载订单详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDetailClose = () => {
    setDetailDialogOpen(false);
    // 延迟清理selectedOrder，等待关闭动画完成
    setTimeout(() => {
      setSelectedOrder(null);
    }, 100);
  };

  const handleOrderUpdate = () => {
    loadOrders();
  };

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return `${weekdays[date.getDay()]} ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <TextField
            placeholder="搜索订单号/客户姓名/手机号"
            value={searchForm.keyword}
            onChange={(e) => setSearchForm({ ...searchForm, keyword: e.target.value })}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            size="small"
            sx={{
              flexGrow: 1,
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75, mb: 2, flexWrap: 'wrap' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mr: 1, alignSelf: 'center' }}>
            状态:
          </Typography>
          {[
            { value: '', label: '全部' },
            { value: 'PENDING', label: '待确认' },
            { value: 'PREPARING', label: '准备中' },
            { value: 'DELIVERING', label: '配送中' },
            { value: 'COMPLETED', label: '已完成' },
            { value: 'CANCELLED', label: '已取消' },
          ].map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => setSearchForm({ ...searchForm, status: option.value })}
              sx={{
                bgcolor: searchForm.status === option.value ? '#D4AF37' : 'transparent',
                color: searchForm.status === option.value ? 'white' : 'text.primary',
                border: '1px solid',
                borderColor: searchForm.status === option.value ? '#D4AF37' : 'divider',
                borderRadius: 1,
                fontSize: '0.875rem',
                height: 28,
                '&:hover': {
                  bgcolor: searchForm.status === option.value ? '#B8941F' : 'action.hover',
                },
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75, mb: 2, flexWrap: 'wrap' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mr: 1, alignSelf: 'center' }}>
            日期:
          </Typography>
          {[
            { value: '', label: '全部' },
            { value: 'today', label: '今天' },
            { value: 'week', label: '本周' },
            { value: 'month', label: '本月' },
          ].map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => setSearchForm({ ...searchForm, dateRange: option.value })}
              sx={{
                bgcolor: searchForm.dateRange === option.value ? '#D4AF37' : 'transparent',
                color: searchForm.dateRange === option.value ? 'white' : 'text.primary',
                border: '1px solid',
                borderColor: searchForm.dateRange === option.value ? '#D4AF37' : 'divider',
                borderRadius: 1,
                fontSize: '0.875rem',
                height: 28,
                '&:hover': {
                  bgcolor: searchForm.dateRange === option.value ? '#B8941F' : 'action.hover',
                },
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mr: 1 }}>
            排序:
          </Typography>
          {[
            { value: 'created_at-desc', label: '最新' },
            { value: 'final_amount-desc', label: '金额↓' },
            { value: 'final_amount-asc', label: '金额↑' },
          ].map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => setSearchForm({ ...searchForm, sortBy: option.value })}
              sx={{
                bgcolor: searchForm.sortBy === option.value ? '#D4AF37' : 'transparent',
                color: searchForm.sortBy === option.value ? 'white' : 'text.primary',
                border: '1px solid',
                borderColor: searchForm.sortBy === option.value ? '#D4AF37' : 'divider',
                borderRadius: 1,
                fontSize: '0.875rem',
                height: 28,
                '&:hover': {
                  bgcolor: searchForm.sortBy === option.value ? '#B8941F' : 'action.hover',
                },
              }}
            />
          ))}

          <Chip
            label="重置筛选"
            onClick={handleReset}
            sx={{
              ml: 'auto',
              bgcolor: 'transparent',
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              fontSize: '0.875rem',
              height: 28,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            暂无订单
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchForm.keyword || searchForm.status || searchForm.dateRange
              ? '没有符合条件的订单'
              : '还没有订单，去商城看看吧'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.map((order) => (
            <Card
              key={order.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                '&:hover': {
                  boxShadow: 3,
                },
              }}
            >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          🛒 {order.orderNo}
                        </Typography>
                        <Chip
                          label={getStatusText(order.status)}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(order.status),
                            color: 'white',
                            fontSize: '0.75rem',
                            height: 20,
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          👤 {order.customerName} {order.customerPhone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                        </Typography>
                      </Box>

                      {order.addressText && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          📍 {order.addressText.length > 30
                            ? order.addressText.substring(0, 30) + '...'
                            : order.addressText}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          📦 {order.itemCount || 0}件商品
                        </Typography>
                        {order.deliveryTime && (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            ⏰ {formatDate(order.deliveryTime)}
                          </Typography>
                        )}
                      </Box>

                      {order.notes && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                          📝 {order.notes}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#D4AF37' }}>
                        💰 ¥{order.finalAmount?.toFixed(2) || '0.00'}
                      </Typography>
                      <IconButton
                        size="small"
                        sx={{ color: 'text.secondary' }}
                        onClick={() => handleViewDetail(order.id)}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
          ))}
        </Box>
      )}

      {pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.current}
            onChange={handlePageChange}
            color="primary"
            size="small"
          />
        </Box>
      )}

      {detailDialogOpen && selectedOrder && (
        <OrderDetailDialog
          order={selectedOrder}
          open={true}
          onClose={handleDetailClose}
          onUpdate={handleOrderUpdate}
          loading={detailLoading}
        />
      )}
    </Box>
  );
};

export default OrderList;
