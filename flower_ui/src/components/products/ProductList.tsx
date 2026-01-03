import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
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
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
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
    sortBy: 'created_at-desc',
  });

  // 防抖搜索
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

    // 解析复合排序字段（如 "created_at-desc" -> sortBy: "created_at", sortOrder: "desc"）
    let sortBy: string = 'created_at';
    let sortOrder: string = 'desc';

    if (searchForm.sortBy && searchForm.sortBy.includes('-')) {
      const [sortField, sortDirection] = searchForm.sortBy.split('-');
      sortBy = sortField;
      sortOrder = sortDirection;
    } else {
      sortBy = searchForm.sortBy || 'created_at';
      sortOrder = 'desc';
    }

    const newFilters: ProductFilters = {
      ...filters,
      current: 1,
      keyword: debouncedKeyword || undefined,
      categoryId: searchForm.categoryId ? Number(searchForm.categoryId) : undefined,
      status: searchForm.status ? (searchForm.status === '1' ? 1 : 0) as 0 | 1 : undefined,
      featured: searchForm.featured ? (searchForm.featured === '1' ? 1 : 0) as 0 | 1 : undefined,
      minPrice: searchForm.minPrice ? Number(searchForm.minPrice) : undefined,
      maxPrice: searchForm.maxPrice ? Number(searchForm.maxPrice) : undefined,
      stockStatus: searchForm.stockStatus as any || undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
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

  // 当筛选条件变化时自动搜索
  useEffect(() => {
    handleSearch();
  }, [debouncedKeyword, searchForm.categoryId, searchForm.status, searchForm.stockStatus, searchForm.sortBy]);

  const handleReset = () => {
    setSearchForm({
      keyword: '',
      categoryId: '',
      status: '',
      featured: '',
      minPrice: '',
      maxPrice: '',
      stockStatus: '',
      sortBy: 'created_at-desc',
    });
    setFilters({
      current: 1,
      size: 8,
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
        <CardContent sx={{ py: 2, px: 2 }}>
          {/* 第一行：搜索框 + 添加按钮 */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="搜索商品..."
              value={searchForm.keyword}
              onChange={(e) => setSearchForm({ ...searchForm, keyword: e.target.value })}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '18px' }} />,
                endAdornment: searchForm.keyword && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchForm({ ...searchForm, keyword: '' })}
                    sx={{ color: 'text.secondary' }}
                  >
                    <CloseIcon sx={{ fontSize: '16px' }} />
                  </IconButton>
                ),
              }}
              sx={{
                flex: 1,
                maxWidth: { md: '400px' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingProductId(null);
                setEditDialogOpen(true);
              }}
              sx={{
                background: 'linear-gradient(135deg, #2C5F3C 0%, #1B3A2B 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1B3A2B 0%, #2C5F3C 100%)',
                },
                color: 'white',
                fontWeight: 600,
                height: 36,
                px: 2,
              }}
            >
              添加商品
            </Button>
          </Box>

          {/* 第二行：分类 + 上架 + 库存 chips */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {/* 分类 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                  分类:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <Chip
                    label="全部"
                    onClick={() => setSearchForm({ ...searchForm, categoryId: '' })}
                    size="small"
                    sx={{
                      height: 28,
                      bgcolor: searchForm.categoryId === '' ? 'primary.main' : 'transparent',
                      color: searchForm.categoryId === '' ? 'white' : 'text.primary',
                      fontWeight: searchForm.categoryId === '' ? 600 : 400,
                      border: '1px solid',
                      borderColor: searchForm.categoryId === '' ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      fontSize: '13px',
                      '&:hover': {
                        bgcolor: searchForm.categoryId === '' ? 'primary.dark' : 'action.hover',
                      },
                    }}
                  />
                  {categories.map((category) => (
                    <Chip
                      key={category.id}
                      label={category.name}
                      onClick={() => setSearchForm({ ...searchForm, categoryId: String(category.id) })}
                      size="small"
                      sx={{
                        height: 28,
                        bgcolor: searchForm.categoryId === String(category.id) ? 'primary.main' : 'transparent',
                        color: searchForm.categoryId === String(category.id) ? 'white' : 'text.primary',
                        fontWeight: searchForm.categoryId === String(category.id) ? 600 : 400,
                        border: '1px solid',
                        borderColor: searchForm.categoryId === String(category.id) ? 'primary.main' : 'divider',
                        cursor: 'pointer',
                        fontSize: '13px',
                        '&:hover': {
                          bgcolor: searchForm.categoryId === String(category.id) ? 'primary.dark' : 'action.hover',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* 分隔符 */}
              <Typography sx={{ color: 'rgba(0,0,0,0.2)', fontSize: '18px', display: { xs: 'none', md: 'block' } }}>
                |
              </Typography>

              {/* 上架状态 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                  上架:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <Chip
                    label="全部"
                    onClick={() => setSearchForm({ ...searchForm, status: '' })}
                    size="small"
                    sx={{
                      height: 28,
                      bgcolor: searchForm.status === '' ? 'success.main' : 'transparent',
                      color: searchForm.status === '' ? 'white' : 'text.primary',
                      fontWeight: searchForm.status === '' ? 600 : 400,
                      border: '1px solid',
                      borderColor: searchForm.status === '' ? 'success.main' : 'divider',
                      cursor: 'pointer',
                      fontSize: '13px',
                      '&:hover': {
                        bgcolor: searchForm.status === '' ? 'success.dark' : 'action.hover',
                      },
                    }}
                  />
                  <Chip
                    label="已上架"
                    onClick={() => setSearchForm({ ...searchForm, status: '1' })}
                    size="small"
                    sx={{
                      height: 28,
                      bgcolor: searchForm.status === '1' ? 'success.main' : 'transparent',
                      color: searchForm.status === '1' ? 'white' : 'text.primary',
                      fontWeight: searchForm.status === '1' ? 600 : 400,
                      border: '1px solid',
                      borderColor: searchForm.status === '1' ? 'success.main' : 'divider',
                      cursor: 'pointer',
                      fontSize: '13px',
                      '&:hover': {
                        bgcolor: searchForm.status === '1' ? 'success.dark' : 'action.hover',
                      },
                    }}
                  />
                  <Chip
                    label="已下架"
                    onClick={() => setSearchForm({ ...searchForm, status: '0' })}
                    size="small"
                    sx={{
                      height: 28,
                      bgcolor: searchForm.status === '0' ? 'error.main' : 'transparent',
                      color: searchForm.status === '0' ? 'white' : 'text.primary',
                      fontWeight: searchForm.status === '0' ? 600 : 400,
                      border: '1px solid',
                      borderColor: searchForm.status === '0' ? 'error.main' : 'divider',
                      cursor: 'pointer',
                      fontSize: '13px',
                      '&:hover': {
                        bgcolor: searchForm.status === '0' ? 'error.dark' : 'action.hover',
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* 分隔符 */}
              <Typography sx={{ color: 'rgba(0,0,0,0.2)', fontSize: '18px', display: { xs: 'none', md: 'block' } }}>
                |
              </Typography>

              {/* 库存状态 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                  库存:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <Chip
                    label="全部"
                    onClick={() => setSearchForm({ ...searchForm, stockStatus: '' })}
                    size="small"
                    sx={{
                      height: 28,
                      bgcolor: searchForm.stockStatus === '' ? 'info.main' : 'transparent',
                      color: searchForm.stockStatus === '' ? 'white' : 'text.primary',
                      fontWeight: searchForm.stockStatus === '' ? 600 : 400,
                      border: '1px solid',
                      borderColor: searchForm.stockStatus === '' ? 'info.main' : 'divider',
                      cursor: 'pointer',
                      fontSize: '13px',
                      '&:hover': {
                        bgcolor: searchForm.stockStatus === '' ? 'info.dark' : 'action.hover',
                      },
                    }}
                  />
                  <Chip
                    label="充足"
                    onClick={() => setSearchForm({ ...searchForm, stockStatus: 'in_stock' })}
                    size="small"
                    sx={{
                      height: 28,
                      bgcolor: searchForm.stockStatus === 'in_stock' ? 'info.main' : 'transparent',
                      color: searchForm.stockStatus === 'in_stock' ? 'white' : 'text.primary',
                      fontWeight: searchForm.stockStatus === 'in_stock' ? 600 : 400,
                      border: '1px solid',
                      borderColor: searchForm.stockStatus === 'in_stock' ? 'info.main' : 'divider',
                      cursor: 'pointer',
                      fontSize: '13px',
                      '&:hover': {
                        bgcolor: searchForm.stockStatus === 'in_stock' ? 'info.dark' : 'action.hover',
                      },
                    }}
                  />
                  <Chip
                    label="不足"
                    onClick={() => setSearchForm({ ...searchForm, stockStatus: 'low_stock' })}
                    size="small"
                    sx={{
                      height: 28,
                      bgcolor: searchForm.stockStatus === 'low_stock' ? 'warning.main' : 'transparent',
                      color: searchForm.stockStatus === 'low_stock' ? 'white' : 'text.primary',
                      fontWeight: searchForm.stockStatus === 'low_stock' ? 600 : 400,
                      border: '1px solid',
                      borderColor: searchForm.stockStatus === 'low_stock' ? 'warning.main' : 'divider',
                      cursor: 'pointer',
                      fontSize: '13px',
                      '&:hover': {
                        bgcolor: searchForm.stockStatus === 'low_stock' ? 'warning.dark' : 'action.hover',
                      },
                    }}
                  />
                  <Chip
                    label="缺货"
                    onClick={() => setSearchForm({ ...searchForm, stockStatus: 'out_of_stock' })}
                    size="small"
                    sx={{
                      height: 28,
                      bgcolor: searchForm.stockStatus === 'out_of_stock' ? 'error.main' : 'transparent',
                      color: searchForm.stockStatus === 'out_of_stock' ? 'white' : 'text.primary',
                      fontWeight: searchForm.stockStatus === 'out_of_stock' ? 600 : 400,
                      border: '1px solid',
                      borderColor: searchForm.stockStatus === 'out_of_stock' ? 'error.main' : 'divider',
                      cursor: 'pointer',
                      fontSize: '13px',
                      '&:hover': {
                        bgcolor: searchForm.stockStatus === 'out_of_stock' ? 'error.dark' : 'action.hover',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* 第三行：价格区间 + 排序 + 重置 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {/* 价格区间 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                价格:
              </Typography>
              <TextField
                size="small"
                type="number"
                placeholder="最低"
                value={searchForm.minPrice}
                onChange={(e) => setSearchForm({ ...searchForm, minPrice: e.target.value })}
                inputProps={{ min: 0, step: 0.01, style: { fontSize: '13px', padding: '4px 8px' } }}
                sx={{
                  width: 80,
                  '& .MuiOutlinedInput-root': {
                    height: 28,
                    '& input': {
                      height: 28,
                    },
                  },
                }}
              />
              <Box sx={{ color: 'text.secondary', fontSize: '14px' }}>-</Box>
              <TextField
                size="small"
                type="number"
                placeholder="最高"
                value={searchForm.maxPrice}
                onChange={(e) => setSearchForm({ ...searchForm, maxPrice: e.target.value })}
                inputProps={{ min: 0, step: 0.01, style: { fontSize: '13px', padding: '4px 8px' } }}
                sx={{
                  width: 80,
                  '& .MuiOutlinedInput-root': {
                    height: 28,
                    '& input': {
                      height: 28,
                    },
                  },
                }}
              />
            </Box>

            {/* 分隔符 */}
            <Typography sx={{ color: 'rgba(0,0,0,0.2)', fontSize: '18px', display: { xs: 'none', md: 'block' } }}>
              |
            </Typography>

            {/* 排序 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                排序:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                <Chip
                  label="最新"
                  onClick={() => setSearchForm({ ...searchForm, sortBy: 'created_at-desc' })}
                  size="small"
                  sx={{
                    height: 28,
                    bgcolor: searchForm.sortBy === 'created_at-desc' ? 'primary.main' : 'transparent',
                    color: searchForm.sortBy === 'created_at-desc' ? 'white' : 'text.primary',
                    fontWeight: searchForm.sortBy === 'created_at-desc' ? 600 : 400,
                    border: '1px solid',
                    borderColor: searchForm.sortBy === 'created_at-desc' ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    fontSize: '13px',
                    '&:hover': {
                      bgcolor: searchForm.sortBy === 'created_at-desc' ? 'primary.dark' : 'action.hover',
                    },
                  }}
                />
                <Chip
                  label="价格↑"
                  onClick={() => setSearchForm({ ...searchForm, sortBy: 'price-asc' })}
                  size="small"
                  sx={{
                    height: 28,
                    bgcolor: searchForm.sortBy === 'price-asc' ? 'primary.main' : 'transparent',
                    color: searchForm.sortBy === 'price-asc' ? 'white' : 'text.primary',
                    fontWeight: searchForm.sortBy === 'price-asc' ? 600 : 400,
                    border: '1px solid',
                    borderColor: searchForm.sortBy === 'price-asc' ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    fontSize: '13px',
                    '&:hover': {
                      bgcolor: searchForm.sortBy === 'price-asc' ? 'primary.dark' : 'action.hover',
                    },
                  }}
                />
                <Chip
                  label="价格↓"
                  onClick={() => setSearchForm({ ...searchForm, sortBy: 'price-desc' })}
                  size="small"
                  sx={{
                    height: 28,
                    bgcolor: searchForm.sortBy === 'price-desc' ? 'primary.main' : 'transparent',
                    color: searchForm.sortBy === 'price-desc' ? 'white' : 'text.primary',
                    fontWeight: searchForm.sortBy === 'price-desc' ? 600 : 400,
                    border: '1px solid',
                    borderColor: searchForm.sortBy === 'price-desc' ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    fontSize: '13px',
                    '&:hover': {
                      bgcolor: searchForm.sortBy === 'price-desc' ? 'primary.dark' : 'action.hover',
                    },
                  }}
                />
              </Box>
            </Box>

            {/* 重置按钮 */}
            <Box sx={{ ml: 'auto' }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                size="small"
                sx={{
                  borderColor: 'divider',
                  color: 'text.primary',
                  fontWeight: 600,
                  height: 28,
                  fontSize: '13px',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                重置筛选
              </Button>
            </Box>
          </Box>
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

      {/* Products Table */}
      {!loading && (
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: 80 }}>图片</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>商品名称</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 100 }}>价格</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 100 }}>库存</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 100 }}>分类</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 150 }}>状态</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 150 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => {
                const images = parseImages(product);
                const stockStatus = getStockStatusText(product);
                const isDiscounted = hasDiscount(product);
                const discountPercent = getDiscountPercentage(product);

                return (
                  <TableRow
                    key={product.id}
                    hover
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    {/* Image */}
                    <TableCell>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: 'grey.100',
                          borderRadius: 1,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {images.length > 0 ? (
                          <Box
                            component="img"
                            src={images[0]}
                            alt={product.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
                            <Typography variant="caption" color="text.secondary">
                              暂无
                            </Typography>
                          </Avatar>
                        )}
                      </Box>
                    </TableCell>

                    {/* Name & Badge */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                        {isDiscounted && (
                          <Chip
                            label={`${discountPercent}% OFF`}
                            color="error"
                            size="small"
                            sx={{ height: 18, fontSize: '10px', mt: 0.5 }}
                          />
                        )}
                      </Box>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        ¥{product.price}
                      </Typography>
                      {isDiscounted && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through', display: 'block' }}
                        >
                          ¥{product.originalPrice}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Stock */}
                    <TableCell>
                      <Box>
                        <Chip
                          label={stockStatus}
                          color={getStockStatusColor(product)}
                          size="small"
                          sx={{ height: 20, fontSize: '11px' }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {product.stockQuantity} 件
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {product.categoryName || '未分类'}
                      </Typography>
                    </TableCell>

                    {/* Status & Featured (Interactive) */}
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {/* Status Chip - Clickable */}
                        <Tooltip title="点击切换上架/下架">
                          <Chip
                            label={getProductStatusText(product.status)}
                            color={getProductStatusColor(product.status)}
                            size="small"
                            onClick={() => handleToggleStatus(product.id, product.status)}
                            sx={{
                              height: 24,
                              fontSize: '12px',
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.8,
                                filter: 'brightness(1.1)',
                              },
                            }}
                          />
                        </Tooltip>

                        {/* Featured Star - Clickable */}
                        <Tooltip title={product.featured === 1 ? '点击取消推荐' : '点击设为推荐'}>
                          <Box
                            onClick={() => handleToggleFeatured(product.id, product.featured)}
                            sx={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 0.5,
                              borderRadius: 1,
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            {product.featured === 1 ? (
                              <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                            ) : (
                              <StarBorderIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                            )}
                          </Box>
                        </Tooltip>
                      </Stack>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="编辑">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(product.id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(product.id, product.name)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Empty state */}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      暂无商品数据
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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