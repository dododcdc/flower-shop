import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Chip,
  Badge,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Remove as RemoveIcon,
  Add as AddIcon,
  ShoppingBasket as CartIcon,
  LocalFlorist as FloristIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence as AnimatePresence } from 'framer-motion';
import { useCartStore, type CartItem } from '../../store/cartStore';

interface CartDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const {
    items,
    isOpen,
    totalItems,
    totalPrice,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    toggleItemSelection,
    selectAllItems,
    getSelectedItems,
    getTotalSelectedPrice,
    getTotalSelectedItems,
  } = useCartStore();

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleCheckout = () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      alert('请选择要结算的商品');
      return;
    }
    // TODO: 跳转到结算页面
    alert('跳转到结算页面');
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const isDrawerOpen = open !== undefined ? open : isOpen;

  return (
    <Drawer
      anchor="right"
      open={isDrawerOpen}
      onClose={onClose || closeCart}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          maxWidth: '100%',
          bgcolor: '#fafafa',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#1B3A2B',
            color: '#F4E4C1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={totalItems} color="error">
              <CartIcon sx={{ fontSize: 28 }} />
            </Badge>
            <Typography variant="h6" fontWeight="bold">
              购物车
            </Typography>
          </Box>
          <IconButton onClick={onClose || closeCart} sx={{ color: '#F4E4C1' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Cart Content */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {items.length === 0 ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                textAlign: 'center',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <FloristIcon sx={{ fontSize: 80, color: '#D4AF37', mb: 2, opacity: 0.6 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  购物车是空的
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  快去挑选心仪的花艺作品吧！
                </Typography>
              </motion.div>
            </Box>
          ) : (
            <>
              {/* Actions */}
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => selectAllItems(true)}
                    sx={{ fontSize: '12px', flex: 1 }}
                  >
                    全选
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => selectAllItems(false)}
                    sx={{ fontSize: '12px', flex: 1 }}
                  >
                    取消全选
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={clearCart}
                    sx={{ fontSize: '12px' }}
                  >
                    清空
                  </Button>
                </Box>
              </Box>

              {/* Items List */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderBottom: '1px solid rgba(0,0,0,0.06)',
                          bgcolor: item.selected ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                          borderLeft: item.selected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {/* Checkbox */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer',
                            }}
                            onClick={() => toggleItemSelection(item.id)}
                          >
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                border: `2px solid ${item.selected ? theme.palette.primary.main : '#ccc'}`,
                                borderRadius: '50%',
                                bgcolor: item.selected ? theme.palette.primary.main : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {item.selected && (
                                <Typography sx={{ color: 'white', fontSize: '12px', lineHeight: 1 }}>
                                  ✓
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          {/* Product Image */}
                          <Avatar
                            variant="rounded"
                            src={item.product.mainImagePath || '/placeholder-flower.jpg'}
                            alt={item.product.name}
                            sx={{ width: 60, height: 60, bgcolor: '#f5f5f5' }}
                          >
                            <FloristIcon />
                          </Avatar>

                          {/* Product Info */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 'bold',
                                mb: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {item.product.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Chip
                                label={item.product.categoryName || '精选花艺'}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(212, 175, 55, 0.1)',
                                  color: '#D4AF37',
                                  fontSize: '10px',
                                  height: 20,
                                }}
                              />
                              <Typography variant="body2" color="primary" fontWeight="bold">
                                {formatPrice(item.product.price)}
                              </Typography>
                            </Box>

                            {/* Quantity Controls */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                sx={{
                                  width: 28,
                                  height: 28,
                                  bgcolor: 'rgba(0,0,0,0.04)',
                                  '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' },
                                }}
                              >
                                <RemoveIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <TextField
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1;
                                  handleQuantityChange(item, val);
                                }}
                                inputProps={{
                                  min: 1,
                                  max: item.product.stockQuantity,
                                  style: { textAlign: 'center', width: 50, height: 28, padding: 0 },
                                }}
                                variant="outlined"
                                size="small"
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stockQuantity}
                                sx={{
                                  width: 28,
                                  height: 28,
                                  bgcolor: 'rgba(0,0,0,0.04)',
                                  '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' },
                                  '&:disabled': { bgcolor: 'rgba(0,0,0,0.02)' },
                                }}
                              >
                                <AddIcon sx={{ fontSize: 16 }} />
                              </IconButton>

                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                库存: {item.product.stockQuantity}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Delete Button */}
                          <IconButton
                            size="small"
                            onClick={() => removeItem(item.id)}
                            sx={{
                              color: 'error',
                              '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.04)' },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        {/* Item Total */}
                        <Box sx={{ mt: 1, textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            小计: {formatCurrency(item.product.price * item.quantity)}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>
            </>
          )}
        </Box>

        {/* Footer */}
        {items.length > 0 && (
          <Box
            sx={{
              p: 2,
              bgcolor: 'white',
              borderTop: '1px solid rgba(0,0,0,0.12)',
            }}
          >
            {/* Summary */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  已选择 {getTotalSelectedItems()} 件商品
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  总计: {formatCurrency(getTotalSelectedPrice())}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">合计</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {formatCurrency(getTotalSelectedPrice())}
                </Typography>
              </Box>
            </Box>

            {/* Checkout Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCheckout}
              disabled={getTotalSelectedItems() === 0}
              sx={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                color: '#1B3A2B',
                fontWeight: 'bold',
                fontSize: '16px',
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #B8941F 0%, #D4AF37 100%)',
                },
                '&:disabled': {
                  bgcolor: 'rgba(0,0,0,0.12)',
                  color: 'rgba(0,0,0,0.26)',
                },
              }}
            >
              去结算 ({getTotalSelectedItems()})
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;