import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Pagination,
  Stack,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { z } from 'zod';

import {
  type Product,
  type ProductFilters,
  productSearchSchema,
  getStockStatusText,
  getStockStatusColor,
  hasDiscount,
  getDiscountPercentage,
  getProductStatusText,
  getProductStatusColor,
} from '../../models/product';
import { productAPI } from '../../api/productAPI';
import { categoryAPI, type Category } from '../../api/categoryAPI';
import ProductEditDialog from './ProductEditDialog';
import { API_BASE_URL } from '../../constants';

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ProductList: React.FC = () => {
  // State for products and pagination
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    size: 8,
    total: 0,
    pages: 0,
  });

  // Search and filter state
  const [filters, setFilters] = useState<ProductFilters>({
    current: 1,
    size: 8,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Form state
  const [searchForm, setSearchForm] = useState({
    keyword: '',
    categoryId: '',
    status: '',
    featured: '',
    minPrice: '',
    maxPrice: '',
    stockStatus: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [deletingProductName, setDeletingProductName] = useState<string>('');

  // Load products on component mount and when filters change
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const data = await categoryAPI.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      // 统一使用 search 接口，简化逻辑并确保所有筛选条件生效
      const response = await productAPI.searchProducts(filters);

      setProducts(response.records);
      setPagination({
        current: response.current,
        size: response.size,
        total: response.total,
        pages: response.pages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载商品失败');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Price validation: either both filled or both empty
    if ((searchForm.minPrice && !searchForm.maxPrice) || (!searchForm.minPrice && searchForm.maxPrice)) {
      setError('价格区间验证失败：最低价格和最高价格必须同时填写或同时留空');
      return;
    }

    // Additional price validation: min should be less than max
    if (searchForm.minPrice && searchForm.maxPrice && Number(searchForm.minPrice) > Number(searchForm.maxPrice)) {
      setError('价格区间验证失败：最低价格不能大于最高价格');
      return;
    }

    const newFilters: ProductFilters = {
      ...filters,
      current: 1, // Reset to first page when searching
      keyword: searchForm.keyword || undefined,
      categoryId: searchForm.categoryId ? Number(searchForm.categoryId) : undefined,
      status: searchForm.status ? (searchForm.status === '1' ? 1 : 0) as 0 | 1 : undefined,
      featured: searchForm.featured ? (searchForm.featured === '1' ? 1 : 0) as 0 | 1 : undefined,
      minPrice: searchForm.minPrice ? Number(searchForm.minPrice) : undefined,
      maxPrice: searchForm.maxPrice ? Number(searchForm.maxPrice) : undefined,
      stockStatus: searchForm.stockStatus as any || undefined,
      sortBy: searchForm.sortBy as any,
      sortOrder: searchForm.sortOrder as any,
    };

    // Validate with Zod schema
    try {
      productSearchSchema.parse(newFilters);
      setFilters(newFilters);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(`搜索参数错误: ${validationError.issues.map((e) => e.message).join(', ')}`);
      }
    }
  };

  const handleReset = () => {
    setSearchForm({
      keyword: '',
      categoryId: '',
      status: '',
      featured: '',
      minPrice: '',
      maxPrice: '',
      stockStatus: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
    setFilters({
      current: 1,
      size: 12,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setFilters({ ...filters, current: value });
  };

  const handleEdit = (productId: number) => {
    setEditingProductId(productId);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    loadProducts(); // Reload products after successful edit
  };

  const handleToggleStatus = async (productId: number, currentStatus: 0 | 1) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await productAPI.toggleProductStatus(productId, newStatus);
      loadProducts(); // Reload to show updated status
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新状态失败');
    }
  };

  const handleToggleFeatured = async (productId: number, currentFeatured: 0 | 1) => {
    try {
      const newFeatured = currentFeatured === 1 ? 0 : 1;
      await productAPI.setProductFeatured(productId, newFeatured);
      loadProducts(); // Reload to show updated featured status
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新推荐状态失败');
    }
  };

  const handleDeleteClick = (productId: number, productName: string) => {
    setDeletingProductId(productId);
    setDeletingProductName(productName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;

    try {
      await productAPI.deleteProduct(deletingProductId);
      loadProducts(); // Reload products after successful deletion
      setDeleteDialogOpen(false);
      setDeletingProductId(null);
      setDeletingProductName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除商品失败');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingProductId(null);
    setDeletingProductName('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const parseImages = (product: Product) => {
    try {
      // 使用新的主图路径字段
      if (product.mainImagePath) {
        // Convert main image path to URL that browsers can load
        let imageUrl = product.mainImagePath;

        // If already a URL (starts with http), return as‑is
        if (!/^https?:/i.test(imageUrl)) {
          // If it's a relative path starting with /uploads/, convert to full API URL
          if (imageUrl.startsWith('/uploads/')) {
            imageUrl = `${API_BASE_URL}${imageUrl}`;
          }
          // Legacy absolute file system path support (convert to API URL)
          else if (imageUrl.startsWith('/Users/wenbin/Projects/flower_shop/flower_server/uploads')) {
            const relativePath = imageUrl.replace('/Users/wenbin/Projects/flower_shop/flower_server', '');
            imageUrl = `${API_BASE_URL}${relativePath}`;
          }
        }

        return [imageUrl];
      }

      return [];
    } catch {
      return [];
    }
  };
  return (
    <Box sx={{ px: 1, pt: 1 }}>
      {/* Search and Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5, px: 2 }}>
          <Grid container spacing={1}>
            {/* 第一行：搜索框 + 主要筛选 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="搜索关键词"
                value={searchForm.keyword}
                onChange={(e) => setSearchForm({ ...searchForm, keyword: e.target.value })}
                placeholder="商品名称、描述或花语"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 0.5 }} />,
                }}
                sx={{ '& .MuiInputBase-input': { py: 0.75, px: 1, fontSize: '0.875rem' } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel shrink sx={{ '&.Mui-focused': { fontSize: '0.875rem' } }}>商品分类</InputLabel>
                <Select
                  value={searchForm.categoryId}
                  label="商品分类"
                  displayEmpty
                  onChange={(e) => setSearchForm({ ...searchForm, categoryId: e.target.value })}
                  sx={{ '& .MuiSelect-select': { py: 0.75, px: 1, fontSize: '0.875rem' } }}
                >
                  <MenuItem value="">全部</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={String(category.id)} sx={{ fontSize: '0.875rem' }}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel shrink sx={{ '&.Mui-focused': { fontSize: '0.875rem' } }}>上架状态</InputLabel>
                <Select
                  value={searchForm.status}
                  label="上架状态"
                  displayEmpty
                  onChange={(e) => setSearchForm({ ...searchForm, status: e.target.value })}
                  sx={{ '& .MuiSelect-select': { py: 0.75, px: 1, fontSize: '0.875rem' } }}
                >
                  <MenuItem value="">全部</MenuItem>
                  <MenuItem value="1" sx={{ fontSize: '0.875rem' }}>上架</MenuItem>
                  <MenuItem value="0" sx={{ fontSize: '0.875rem' }}>下架</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel shrink sx={{ '&.Mui-focused': { fontSize: '0.875rem' } }}>库存状态</InputLabel>
                <Select
                  value={searchForm.stockStatus}
                  label="库存状态"
                  displayEmpty
                  onChange={(e) => setSearchForm({ ...searchForm, stockStatus: e.target.value })}
                  sx={{ '& .MuiSelect-select': { py: 0.75, px: 1, fontSize: '0.875rem' } }}
                >
                  <MenuItem value="">全部</MenuItem>
                  <MenuItem value="in_stock" sx={{ fontSize: '0.875rem' }}>库存充足</MenuItem>
                  <MenuItem value="low_stock" sx={{ fontSize: '0.875rem' }}>库存不足</MenuItem>
                  <MenuItem value="out_of_stock" sx={{ fontSize: '0.875rem' }}>缺货</MenuItem>
                </Select>
              </FormControl>
            </Grid>


            {/* 第二行：价格和排序 + 操作按钮 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="最低价"
                  type="number"
                  value={searchForm.minPrice}
                  onChange={(e) => setSearchForm({ ...searchForm, minPrice: e.target.value })}
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ '& .MuiInputBase-input': { py: 0.75, px: 1, fontSize: '0.875rem' } }}
                />
                <Box sx={{ mx: 0.5, color: 'text.secondary', fontWeight: 'bold', fontSize: '0.875rem' }}>-</Box>
                <TextField
                  fullWidth
                  size="small"
                  label="最高价"
                  type="number"
                  value={searchForm.maxPrice}
                  onChange={(e) => setSearchForm({ ...searchForm, maxPrice: e.target.value })}
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ '& .MuiInputBase-input': { py: 0.75, px: 1, fontSize: '0.875rem' } }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ '&.Mui-focused': { fontSize: '0.875rem' } }}>排序方式</InputLabel>
                <Select
                  value={searchForm.sortBy}
                  label="排序方式"
                  onChange={(e) => setSearchForm({ ...searchForm, sortBy: e.target.value })}
                  sx={{ '& .MuiSelect-select': { py: 0.75, px: 1, fontSize: '0.875rem' } }}
                >
                  <MenuItem value="created_at" sx={{ fontSize: '0.875rem' }}>创建时间</MenuItem>
                  <MenuItem value="price" sx={{ fontSize: '0.875rem' }}>价格</MenuItem>
                  <MenuItem value="name" sx={{ fontSize: '0.875rem' }}>名称</MenuItem>
                  <MenuItem value="stock_quantity" sx={{ fontSize: '0.875rem' }}>库存数量</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ '&.Mui-focused': { fontSize: '0.875rem' } }}>排序顺序</InputLabel>
                <Select
                  value={searchForm.sortOrder}
                  label="排序顺序"
                  onChange={(e) => setSearchForm({ ...searchForm, sortOrder: e.target.value })}
                  sx={{ '& .MuiSelect-select': { py: 0.75, px: 1, fontSize: '0.875rem' } }}
                >
                  <MenuItem value="desc" sx={{ fontSize: '0.875rem' }}>降序</MenuItem>
                  <MenuItem value="asc" sx={{ fontSize: '0.875rem' }}>升序</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 8, md: 3 }}>
              <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                  onClick={() => {
                    setEditingProductId(null);
                    setEditDialogOpen(true);
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #2C5F3C 0%, #1B3A2B 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1B3A2B 0%, #2C5F3C 100%)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    },
                    color: 'white',
                    fontWeight: 600,
                    height: 32,
                    px: 1.5,
                    fontSize: '0.75rem',
                    minWidth: 60,
                    borderRadius: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  添加
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon sx={{ fontSize: '1rem' }} />}
                  onClick={handleSearch}
                  sx={{
                    background: 'linear-gradient(135deg, #1B3A2B 0%, #2C5F3C 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2C5F3C 0%, #1B3A2B 100%)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    },
                    color: 'white',
                    fontWeight: 600,
                    height: 32,
                    px: 1.5,
                    fontSize: '0.75rem',
                    minWidth: 60,
                    borderRadius: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  搜索
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  sx={{
                    height: 32,
                    px: 1.5,
                    fontSize: '0.75rem',
                    minWidth: 60,
                    borderRadius: 1,
                    borderColor: 'grey.300',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  重置
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>加载中...</Typography>
        </Box>
      )}

      {/* Products Grid */}
      {!loading && (
        <Grid container spacing={3}>
          {products.map((product) => {
            const images = parseImages(product);
            const stockStatus = getStockStatusText(product);
            const stockColor = getStockStatusColor(product);
            const isDiscounted = hasDiscount(product);
            const discountPercent = getDiscountPercentage(product);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  >
                    {/* Product Image */}
                    <CardMedia
                      component="div"
                      sx={{
                        height: 200,
                        backgroundColor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {images.length > 0 ? (
                        <img
                          src={images[0]}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{ width: 80, height: 80, bgcolor: 'grey.300' }}
                          variant="square"
                        >
                          <Typography variant="body2" color="text.secondary">
                            暂无图片
                          </Typography>
                        </Avatar>
                      )}

                      {/* Discount badge */}
                      {isDiscounted && (
                        <Chip
                          label={`${discountPercent}% OFF`}
                          color="error"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            fontWeight: 'bold',
                          }}
                        />
                      )}

                      {/* Featured badge */}
                      {product.featured === 1 && (
                        <Chip
                          icon={<StarIcon />}
                          label="推荐"
                          color="warning"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            fontWeight: 'bold',
                          }}
                        />
                      )}
                    </CardMedia>

                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Product Name */}
                      <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                        {product.name}
                      </Typography>

                      {/* Product Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {product.description || '暂无描述'}
                      </Typography>

                      {/* Price */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          ¥{product.price}
                        </Typography>
                        {isDiscounted && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            ¥{product.originalPrice}
                          </Typography>
                        )}
                      </Box>

                      {/* Stock Status */}
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={stockStatus}
                          color={stockColor}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          库存: {product.stockQuantity} 件
                        </Typography>
                      </Box>

                      {/* Product Status */}
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={getProductStatusText(product.status)}
                          color={getProductStatusColor(product.status)}
                          size="small"
                        />
                      </Box>

                      {/* Category */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        分类: {product.categoryName || '未分类'}
                      </Typography>

                      {/* Date */}
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                        创建时间: {formatDate(product.createdAt)}
                      </Typography>

                      {/* Action Buttons */}
                      <Box sx={{ mt: 'auto' }}>
                        <Stack direction="row" spacing={1} justifyContent="space-between">
                          <Box>
                            <Tooltip title="查看详情">
                              <IconButton size="small" color="info">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="编辑">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(product.id)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="删除">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(product.id, product.name)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Box>
                            <Tooltip title={product.status === 1 ? '下架' : '上架'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(product.id, product.status)}
                                color={product.status === 1 ? 'success' : 'default'}
                              >
                                {product.status === 1 ? <ToggleOnIcon /> : <ToggleOffIcon />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={product.featured === 1 ? '取消推荐' : '设为推荐'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleFeatured(product.id, product.featured)}
                                color={product.featured === 1 ? 'warning' : 'default'}
                              >
                                {product.featured === 1 ? <StarIcon /> : <StarBorderIcon />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}

          {/* Empty state */}
          {!loading && products.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  暂无商品数据
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  请调整搜索条件、添加新商品，或初始化示例数据进行测试
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.current}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'text.primary', // 修正：使用主题文本颜色，确保在浅色背景上可见
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#FFF9C4', // 浅浅的鸡蛋黄 (Pale Yellow)
                  color: '#333', // Hover 时文字变深色，保证对比度
                },
                '&.Mui-selected': {
                  fontWeight: 'bold',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              },
            }}
          />
        </Box>
      )}

      {/* Edit Dialog */}
      <ProductEditDialog
        open={editDialogOpen}
        productId={editingProductId}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>确认删除商品</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除商品 "{deletingProductName}" 吗？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            此操作不可撤销，删除后将无法恢复。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            取消
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductList;