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
  Chip,
  Pagination,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  ShoppingCart as CartIcon,
  LocalFlorist,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import {
  type Product,
  type ProductFilters,
  getStockStatusText,
  getStockStatusColor,
  hasDiscount,
  getDiscountPercentage,
} from '../../models/product';
import { productAPI } from '../../api/productAPI';
import { categoryAPI, type Category } from '../../api/categoryAPI';
import { API_BASE_URL } from '../../constants';

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

import { useSnackbar } from 'notistack';

interface PublicProductListProps {
  onAddToCart?: (product: Product, quantity: number) => { success: boolean; message?: string };
  onViewDetails?: (product: Product) => void;
}

const PublicProductList: React.FC<PublicProductListProps> = ({
  onAddToCart,
  onViewDetails
}) => {
  const { enqueueSnackbar } = useSnackbar();

  // State for products and pagination
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    size: 12,
    total: 0,
    pages: 0,
  });

  // Search and filter state
  const [filters, setFilters] = useState<ProductFilters>({
    current: 1,
    size: 12,
    status: 1, // 只显示上架商品
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Search form state
  const [searchForm, setSearchForm] = useState({
    keyword: '',
    categoryId: '',
    sortBy: 'created_at-desc',
  });

  // 防抖搜索
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [isComposing, setIsComposing] = useState(false); // 是否正在使用输入法

  useEffect(() => {
    // 只有在不在输入法状态下才触发搜索
    if (!isComposing) {
      const timer = setTimeout(() => {
        setDebouncedKeyword(searchForm.keyword);
      }, 500); // 500ms 延迟

      return () => clearTimeout(timer);
    }
  }, [searchForm.keyword, isComposing]);

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const productData = await productAPI.searchProducts(filters);

      if (productData && productData.records) {
        setProducts(productData.records || []);
        setPagination(prev => ({
          ...prev,
          current: filters.current,
          total: productData.total || 0,
          pages: Math.ceil((productData.total || 0) / filters.size),
        }));
      }
    } catch (err) {
      console.error('加载商品失败:', err);
      setError('加载商品失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const categoriesData = await categoryAPI.getAllCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('加载分类失败:', err);
    }
  };

  // 当筛选条件变化时自动搜索
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [filters]);

  // 当搜索条件变化时，更新filters并重置到第一页
  useEffect(() => {
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

    const searchFilters: ProductFilters = {
      current: 1,
      size: 12,
      status: 1,
      keyword: debouncedKeyword || undefined,
      categoryId: searchForm.categoryId ? Number(searchForm.categoryId) : undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    };

    setFilters(searchFilters);
  }, [debouncedKeyword, searchForm.categoryId, searchForm.sortBy]);

  const handleReset = () => {
    setSearchForm({
      keyword: '',
      categoryId: '',
      sortBy: 'created_at-desc',
    });
    setFilters({
      current: 1,
      size: 12,
      status: 1,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setFilters({ ...filters, current: value });
  };

  const flyToCart = (startEl: HTMLElement, imageSrc: string) => {
    const cartBtn = document.getElementById('cart-icon-btn');
    if (!cartBtn) return;

    const startRect = startEl.getBoundingClientRect();
    const endRect = cartBtn.getBoundingClientRect();

    // 动画配置
    const duration = 1.2; // 动画时长(秒)。想要更慢就改大这个数字，例如 1.5

    const flyer = document.createElement('img');
    flyer.src = imageSrc;
    flyer.style.position = 'fixed';
    flyer.style.left = `${startRect.left}px`;
    flyer.style.top = `${startRect.top}px`;
    flyer.style.width = '50px';
    flyer.style.height = '50px';
    flyer.style.borderRadius = '50%';
    flyer.style.objectFit = 'cover';
    flyer.style.zIndex = '9999';
    flyer.style.pointerEvents = 'none';
    // 使用变量设置动画时间
    flyer.style.transition = `all ${duration}s cubic-bezier(0.2, 0.8, 0.2, 1)`;
    flyer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';

    document.body.appendChild(flyer);

    // Force reflow
    flyer.getBoundingClientRect();

    requestAnimationFrame(() => {
      flyer.style.left = `${endRect.left + endRect.width / 2 - 10}px`;
      flyer.style.top = `${endRect.top + endRect.height / 2 - 10}px`;
      flyer.style.width = '20px';
      flyer.style.height = '20px';
      flyer.style.opacity = '0';
      flyer.style.transform = 'scale(0.5)';
    });

    // 清理时间也要跟随动画时间
    setTimeout(() => {
      if (document.body.contains(flyer)) {
        document.body.removeChild(flyer);
      }
    }, duration * 1000);
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>, product: Product) => {
    e.stopPropagation();

    if (onAddToCart) {
      const result = onAddToCart(product, 1); // 默认添加1个

      if (result && result.success) {
        // Success: Trigger animation and global cart feedback
        const images = parseImages(product);
        const imageSrc = images.length > 0 ? images[0] : '/placeholder-flower.jpg'; // Fallback image
        flyToCart(e.currentTarget, imageSrc);

        // Trigger global cart feedback
        if ((window as any).triggerCartFeedback) {
          (window as any).triggerCartFeedback({
            name: product.name,
            image: imageSrc,
          });
        }
      } else {
        // Error: Show error toast
        enqueueSnackbar(result?.message || '添加失败', {
          variant: 'error',
          autoHideDuration: 3000
        });
      }
    }
  };

  const handleViewDetails = (product: Product) => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  const parseImages = (product: Product) => {
    try {
      if (product.mainImagePath) {
        let imageUrl = product.mainImagePath;
        if (!/^https?:/i.test(imageUrl)) {
          if (imageUrl.startsWith('/uploads/')) {
            imageUrl = `${API_BASE_URL}${imageUrl}`;
          }
        }
        return [imageUrl];
      }
      return [];
    } catch (error) {
      console.error('Error parsing images:', error);
      return [];
    }
  };

  return (
    <Box>
      {/* Search and Filter Section */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {/* 第一行：搜索框 */}
        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="搜索商品..."
            value={searchForm.keyword}
            onChange={(e) => setSearchForm({ ...searchForm, keyword: e.target.value })}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: '#D4AF37', fontSize: '18px' }} />,
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
              width: { xs: '100%', md: '400px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                '&:hover fieldset': {
                  borderColor: '#D4AF37',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#D4AF37',
                },
              },
            }}
          />
        </Box>

        {/* 第二行：分类 + 排序 chips */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* 分类 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1B3A2B', fontSize: '13px' }}>
              分类:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              <Chip
                label="全部"
                onClick={() => setSearchForm({ ...searchForm, categoryId: '' })}
                size="small"
                sx={{
                  height: 28,
                  bgcolor: searchForm.categoryId === '' ? '#D4AF37' : 'transparent',
                  color: searchForm.categoryId === '' ? '#1B3A2B' : '#D4AF37',
                  fontWeight: searchForm.categoryId === '' ? 600 : 400,
                  border: '1px solid #D4AF37',
                  cursor: 'pointer',
                  fontSize: '13px',
                  '&:hover': {
                    bgcolor: 'rgba(212, 175, 55, 0.2)',
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
                    bgcolor: searchForm.categoryId === String(category.id) ? '#D4AF37' : 'transparent',
                    color: searchForm.categoryId === String(category.id) ? '#1B3A2B' : '#D4AF37',
                    fontWeight: searchForm.categoryId === String(category.id) ? 600 : 400,
                    border: '1px solid #D4AF37',
                    cursor: 'pointer',
                    fontSize: '13px',
                    '&:hover': {
                      bgcolor: 'rgba(212, 175, 55, 0.2)',
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

          {/* 排序 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1B3A2B', fontSize: '13px' }}>
              排序:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              <Chip
                label="最新"
                onClick={() => setSearchForm({ ...searchForm, sortBy: 'created_at-desc' })}
                size="small"
                sx={{
                  height: 28,
                  bgcolor: searchForm.sortBy === 'created_at-desc' ? '#D4AF37' : 'transparent',
                  color: searchForm.sortBy === 'created_at-desc' ? '#1B3A2B' : '#D4AF37',
                  fontWeight: searchForm.sortBy === 'created_at-desc' ? 600 : 400,
                  border: '1px solid #D4AF37',
                  cursor: 'pointer',
                  fontSize: '13px',
                  '&:hover': {
                    bgcolor: 'rgba(212, 175, 55, 0.2)',
                  },
                }}
              />
              <Chip
                label="价格↑"
                onClick={() => setSearchForm({ ...searchForm, sortBy: 'price-asc' })}
                size="small"
                sx={{
                  height: 28,
                  bgcolor: searchForm.sortBy === 'price-asc' ? '#D4AF37' : 'transparent',
                  color: searchForm.sortBy === 'price-asc' ? '#1B3A2B' : '#D4AF37',
                  fontWeight: searchForm.sortBy === 'price-asc' ? 600 : 400,
                  border: '1px solid #D4AF37',
                  cursor: 'pointer',
                  fontSize: '13px',
                  '&:hover': {
                    bgcolor: 'rgba(212, 175, 55, 0.2)',
                  },
                }}
              />
              <Chip
                label="价格↓"
                onClick={() => setSearchForm({ ...searchForm, sortBy: 'price-desc' })}
                size="small"
                sx={{
                  height: 28,
                  bgcolor: searchForm.sortBy === 'price-desc' ? '#D4AF37' : 'transparent',
                  color: searchForm.sortBy === 'price-desc' ? '#1B3A2B' : '#D4AF37',
                  fontWeight: searchForm.sortBy === 'price-desc' ? 600 : 400,
                  border: '1px solid #D4AF37',
                  cursor: 'pointer',
                  fontSize: '13px',
                  '&:hover': {
                    bgcolor: 'rgba(212, 175, 55, 0.2)',
                  },
                }}
              />
              <Chip
                label="销量"
                onClick={() => setSearchForm({ ...searchForm, sortBy: 'sales-desc' })}
                size="small"
                sx={{
                  height: 28,
                  bgcolor: searchForm.sortBy === 'sales-desc' ? '#D4AF37' : 'transparent',
                  color: searchForm.sortBy === 'sales-desc' ? '#1B3A2B' : '#D4AF37',
                  fontWeight: searchForm.sortBy === 'sales-desc' ? 600 : 400,
                  border: '1px solid #D4AF37',
                  cursor: 'pointer',
                  fontSize: '13px',
                  '&:hover': {
                    bgcolor: 'rgba(212, 175, 55, 0.2)',
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Typography>加载中...</Typography>
        </Box>
      )}

      {/* Error state */}
      {error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={loadProducts}>
            重新加载
          </Button>
        </Box>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <Grid container spacing={3}>
          {products.map((product, index) => {
            const images = parseImages(product);
            const isDiscounted = hasDiscount(product);
            const discountPercent = getDiscountPercentage(product);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
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
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <LocalFlorist sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            暂无图片
                          </Typography>
                        </Box>
                      )}

                      {/* Discount badge */}
                      {isDiscounted && (
                        <Chip
                          label={`${discountPercent}% OFF`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            bgcolor: '#D4AF37',
                            color: '#1B3A2B',
                            fontWeight: 'bold',
                          }}
                        />
                      )}

                      {/* Featured badge */}
                      {product.featured === 1 && (
                        <Chip
                          label="推荐"
                          size="small"
                          color="primary"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            fontWeight: 'bold',
                          }}
                        />
                      )}
                    </CardMedia>

                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                      {/* Category */}
                      <Chip
                        label={product.categoryName || '精选花艺'}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(212, 175, 55, 0.1)',
                          color: '#D4AF37',
                          mb: 1,
                          alignSelf: 'flex-start',
                          fontSize: '12px',
                          height: 24,
                        }}
                      />

                      {/* Product Name */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#1B3A2B',
                          mb: 1,
                          lineHeight: 1.2,
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.name}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: '14px',
                          mb: 2,
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          flexGrow: 1,
                        }}
                      >
                        {product.description || '精选花材，精心搭配'}
                      </Typography>

                      {/* Price */}
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: '20px',
                            color: '#D4AF37',
                            fontWeight: 'bold',
                          }}
                        >
                          ¥{product.price.toFixed(2)}
                        </Typography>
                        {isDiscounted && product.originalPrice && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: 'line-through', fontSize: '14px' }}
                          >
                            ¥{product.originalPrice.toFixed(2)}
                          </Typography>
                        )}
                      </Box>

                      {/* Stock Status */}
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: getStockStatusColor(product),
                            fontSize: '13px',
                            fontWeight: 500,
                          }}
                        >
                          {getStockStatusText(product)}
                        </Typography>
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => handleViewDetails(product)}
                          sx={{
                            flex: 1,
                            height: 40,
                            fontSize: '13px',
                            fontWeight: 500,
                            borderColor: '#D4AF37',
                            color: '#1B3A2B',
                            minWidth: 100,
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            '&:hover': {
                              borderColor: '#1B3A2B',
                              bgcolor: 'rgba(212, 175, 55, 0.1)',
                            },
                          }}
                        >
                          查看详情
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CartIcon />}
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.stockQuantity === 0}
                          sx={{
                            flex: 1,
                            height: 40,
                            fontSize: '13px',
                            fontWeight: 600,
                            bgcolor: '#D4AF37',
                            color: '#1B3A2B',
                            minWidth: 110,
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            '&:hover': {
                              bgcolor: '#B8941F',
                            },
                            '&:disabled': {
                              bgcolor: 'rgba(0, 0, 0, 0.12)',
                              color: 'rgba(0, 0, 0, 0.26)',
                            },
                          }}
                        >
                          加入购物车
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}

          {/* Empty state */}
          {!loading && products.length === 0 && (
            <Grid size={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <LocalFlorist sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  暂无相关商品
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  请调整搜索条件或浏览其他分类
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Pagination */}
      {!loading && !error && products.length > 0 && pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.current}
            onChange={handlePageChange}
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#1B3A2B',
                '&.Mui-selected': {
                  bgcolor: '#D4AF37',
                  color: '#1B3A2B',
                },
                '&:hover': {
                  bgcolor: 'rgba(212, 175, 55, 0.1)',
                },
              },
            }}
            showFirstButton
            showLastButton
          />
        </Box>
      )}

    </Box>
  );
};

export default PublicProductList;