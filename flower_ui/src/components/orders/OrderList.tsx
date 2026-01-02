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
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { orderAPI, type Order, type OrderFilters } from '../../api/orderAPI';
import AdminOrderDetailDrawer from './AdminOrderDetailDrawer';

const OrderList: React.FC = () => {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Drawer State (Persistence Pattern)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Filters & Pagination
  const [searchForm, setSearchForm] = useState({
    keyword: '',
    status: '',
    dateRange: '',
    sortBy: 'created_at-desc', // Default sort
  });

  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  });

  // Debounce Search
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchForm.keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchForm.keyword]);

  // Helper to format date as YYYY-MM-DD in LOCAL time
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Main Load Function
  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    // Calculate Date Range
    let startDate: string | undefined;
    let endDate: string | undefined;
    const today = new Date();

    if (searchForm.dateRange === 'today') {
      startDate = formatLocalDate(today);
      endDate = startDate;
    } else if (searchForm.dateRange === 'week') {
      const d = new Date();
      // Adjust to start of week or just 7 days ago? usually 7 days ago implies a range
      d.setDate(d.getDate() - 7);
      startDate = formatLocalDate(d);
      endDate = formatLocalDate(today);
    } else if (searchForm.dateRange === 'month') {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      startDate = formatLocalDate(d);
      endDate = formatLocalDate(today);
    }

    // Parse Sort
    let sortBy = 'created_at';
    let sortOrder = 'desc';
    if (searchForm.sortBy.includes('-')) {
      const [field, order] = searchForm.sortBy.split('-');
      sortBy = field;
      sortOrder = order;
    }

    try {
      // Explicitly handle Sort Order to ensure it matches 'asc' | 'desc'
      const validSortOrder = (sortOrder === 'asc' || sortOrder === 'desc') ? sortOrder : 'desc';

      const filters: OrderFilters = {
        current: pagination.current,
        size: pagination.size,
        keyword: debouncedKeyword || undefined,
        status: searchForm.status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy: sortBy || 'created_at',
        sortOrder: validSortOrder
      };

      const response = await orderAPI.searchOrders(filters);
      setOrders(response.records);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        pages: response.pages,
        current: response.current
      }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || '加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Load on Filter Change
  useEffect(() => {
    // Reset to page 1 when filters change (except pagination current change which is handled separately)
    loadOrders();
  }, [pagination.current, debouncedKeyword, searchForm.status, searchForm.dateRange, searchForm.sortBy]);

  // Handlers
  const handlePageChange = (_: unknown, value: number) => {
    setPagination(prev => ({ ...prev, current: value }));
  };

  const handleViewDetail = async (orderId: number) => {
    // Try to find in current list first for instant open
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setDetailDialogOpen(true);
    }

    // Optionally fetch fresh detail
    setDetailLoading(true);
    try {
      const detail = await orderAPI.getOrderDetail(orderId);
      setSelectedOrder(detail);
    } catch (e) {
      console.error('Failed to refresh order detail', e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOrderUpdate = () => {
    loadOrders(); // Refresh list after drawer action
  };

  // UI Helpers
  const getStatusInfo = (status: string) => {
    const map: Record<string, { text: string, color: string }> = {
      'PENDING': { text: '待确认', color: '#FF9800' }, // Orange
      'PREPARING': { text: '准备中', color: '#2196F3' }, // Blue
      'DELIVERING': { text: '配送中', color: '#9C27B0' }, // Purple
      'COMPLETED': { text: '已完成', color: '#4CAF50' }, // Green
      'CANCELLED': { text: '已取消', color: '#9E9E9E' }, // Grey
    };
    return map[status] || { text: status, color: 'grey' };
  };

  const formatPrice = (price?: number) => `¥${(price || 0).toFixed(2)}`;
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header & Search */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#1a1a1a' }}>
          订单管理
        </Typography>

        <Card sx={{ p: 2, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'visible' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="搜索订单号 / 客户 / 手机号"
              size="small"
              value={searchForm.keyword}
              onChange={(e) => setSearchForm(prev => ({ ...prev, keyword: e.target.value }))}
              sx={{ minWidth: 280, flexGrow: 1 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
              }}
            />

            {/* Status Filter Chips */}
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.5 }}>
              {[
                { value: '', label: '全部状态' },
                { value: 'PENDING', label: '待确认' },
                { value: 'PREPARING', label: '准备中' },
                { value: 'DELIVERING', label: '配送中' },
                { value: 'COMPLETED', label: '已完成' },
                { value: 'CANCELLED', label: '已取消' },
              ].map(opt => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  clickable
                  onClick={() => setSearchForm(prev => ({ ...prev, status: opt.value }))}
                  color={searchForm.status === opt.value ? 'primary' : 'default'}
                  variant={searchForm.status === opt.value ? 'filled' : 'outlined'}
                  sx={{ fontWeight: searchForm.status === opt.value ? 600 : 400 }}
                />
              ))}
            </Box>
          </Box>

          {/* Secondary Filters line */}
          <Box sx={{ display: 'flex', gap: 3, mt: 2, alignItems: 'center', fontSize: '0.875rem', color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FilterIcon fontSize="small" /> 筛选:
              {[
                { value: '', label: '所有时间' },
                { value: 'today', label: '今天' },
                { value: 'week', label: '本周' },
              ].map(opt => (
                <Typography
                  key={opt.value}
                  component="span"
                  sx={{
                    cursor: 'pointer',
                    color: searchForm.dateRange === opt.value ? 'primary.main' : 'inherit',
                    fontWeight: searchForm.dateRange === opt.value ? 'bold' : 'normal',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => setSearchForm(prev => ({ ...prev, dateRange: opt.value }))}
                >
                  {opt.label}
                </Typography>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 'auto' }}>
              排序:
              {[
                { value: 'created_at-desc', label: '最新' },
                { value: 'final_amount-desc', label: '金额高' },
              ].map(opt => (
                <Typography
                  key={opt.value}
                  component="span"
                  sx={{
                    cursor: 'pointer',
                    color: searchForm.sortBy === opt.value ? 'primary.main' : 'inherit',
                    fontWeight: searchForm.sortBy === opt.value ? 'bold' : 'normal'
                  }}
                  onClick={() => setSearchForm(prev => ({ ...prev, sortBy: opt.value }))}
                >
                  {opt.label}
                </Typography>
              ))}
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Error & Loading */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" py={5}>
              暂无订单数据
            </Typography>
          ) : orders.map(order => {
            const status = getStatusInfo(order.status);
            return (
              <Card
                key={order.id}
                sx={{
                  border: '1px solid #eee',
                  boxShadow: 'none',
                  '&:hover': { borderColor: 'primary.main', bgcolor: '#fafafa' },
                  transition: 'all 0.2s'
                }}
              >
                <CardContent sx={{ p: '16px !important', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {order.orderNo}
                      </Typography>
                      <Chip label={status.text} size="small" sx={{ bgcolor: status.color, color: 'white', fontWeight: 600, height: 24 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span>👤 {order.customerName}</span>
                      <span>📞 {order.customerPhone}</span>
                      {order.deliveryTime && <span>⏰ {formatDate(order.deliveryTime)}配送</span>}
                    </Typography>
                    {(order.addressText || order.notes) && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        📍 {order.addressText || order.notes}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                      包含 {order.itemCount} 件商品 • 下单于 {formatDate(order.createdAt)}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      {formatPrice(order.finalAmount)}
                    </Typography>
                    <IconButton
                      onClick={() => handleViewDetail(order.id)}
                      size="small"
                      sx={{ mt: 1, bgcolor: 'action.hover' }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.current}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* The Persistent Drawer */}
      <AdminOrderDetailDrawer
        order={selectedOrder}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        onUpdate={handleOrderUpdate}
        isLoadingDetail={detailLoading}
      />
    </Box>
  );
};

export default OrderList;
