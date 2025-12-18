import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress,
    Stack,
    IconButton,
    Card,
    CardMedia,
    Chip,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { type Product } from '../../models/product';
import { useProduct, useUpdateProduct, useCreateProduct } from '../../hooks/useProducts';
import { categoryAPI, type Category } from '../../api/categoryAPI';
import { API_BASE_URL } from '../../constants';

interface ProductEditDialogProps {
    open: boolean;
    productId: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

// 统一图片项接口
interface ImageItem {
    id: string;          // 唯一标识：已有图片用URL作为ID，新图片用随机ID
    url: string;         // 预览/显示URL
    file?: File;         // 新图片文件对象
    isExisting: boolean; // 是否为数据库已有图片
    isDeleted: boolean;  // 是否标记为删除
}

// 表单数据类型，允许 undefined
interface ProductFormData extends Omit<Partial<Product>, 'price' | 'originalPrice'> {
    price?: number | undefined;
    originalPrice?: number | undefined;
}

const ProductEditDialog: React.FC<ProductEditDialogProps> = ({
    open,
    productId,
    onClose,
    onSuccess,
}) => {
    // React Query hooks
    const { data: product, isLoading: productLoading, error: productError } = useProduct(productId);
    const updateProduct = useUpdateProduct();
    const createProduct = useCreateProduct();

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        categoryId: 0,
        description: '',
        price: undefined,
        originalPrice: undefined,
        stockQuantity: 0,
        lowStockThreshold: 5,
        status: 1,
        featured: 0,
        flowerLanguage: '',
        careGuide: '',
    });

    // --- 新的图片状态管理 ---
    const [imageList, setImageList] = useState<ImageItem[]>([]);
    const [mainImageId, setMainImageId] = useState<string | null>(null);
    const [prevMainImageId, setPrevMainImageId] = useState<string | null>(null);

    // 加载分类列表
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await categoryAPI.getAllCategories();
                setCategories(data);
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        };
        loadCategories();
    }, []);

    // 加载商品数据 - 使用 React Query 自动处理
    useEffect(() => {
        if (product && productId) {
            // 编辑模式：加载商品数据
            setFormData({
                name: product.name,
                categoryId: product.categoryId,
                description: product.description,
                price: product.price,
                originalPrice: product.originalPrice,
                stockQuantity: product.stockQuantity,
                lowStockThreshold: product.lowStockThreshold,
                status: product.status,
                featured: product.featured,
                flowerLanguage: product.flowerLanguage || '',
                careGuide: product.careGuide || '',
            });

            // 解析现有图片并转换为统一格式
            const newImageList: ImageItem[] = [];

            if (product.images && product.images.length > 0) {
                product.images.forEach((imageDetail: any) => {
                    newImageList.push({
                        id: imageDetail.id.toString(),
                        url: imageDetail.imageUrl || imageDetail.imagePath,
                        isExisting: true,
                        isDeleted: false
                    });
                });
            }

            setImageList(newImageList);
            // 初始化主图指针（找到主图）
            const mainImage = product.images?.find((img: any) => img.imageType === 1);
            if (mainImage) {
                setMainImageId(mainImage.id.toString());
            } else if (newImageList.length > 0) {
                setMainImageId(newImageList[0]!.id);
            }
            setPrevMainImageId(null);
        } else if (!productId && open) {
            // 添加模式：重置表单为空
            resetForm();
        } else if (!open) {
            // 对话框关闭时也重置
            resetForm();
        }
    }, [product, productId, open]);

    const resetForm = () => {
        setFormData({
            name: '',
            categoryId: 0,
            description: '',
            price: undefined,
            originalPrice: undefined,
            stockQuantity: 0,
            lowStockThreshold: 5,
            status: 1,
            featured: 0,
            flowerLanguage: '',
            careGuide: '',
        });
        setImageList([]);
        setMainImageId(null);
        setPrevMainImageId(null);
        setError(null);
    };

    // 获取当前有效图片数量（未删除的）
    const getActiveImageCount = () => {
        return imageList.filter(img => !img.isDeleted).length;
    };

    // 处理图片选择
    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const fileArray = Array.from(files);
        const currentCount = getActiveImageCount();

        if (currentCount + fileArray.length > 9) {
            setError(`最多只能上传9张图片，当前已有${currentCount}张`);
            return;
        }

        // 检查重复图片（新文件之间）
        const newFileHash = new Map<string, File>();
        const duplicateNewFiles: string[] = [];

        fileArray.forEach(file => {
            const fileKey = `${file.name}_${file.size}_${file.lastModified}`;
            if (newFileHash.has(fileKey)) {
                duplicateNewFiles.push(file.name);
            } else {
                newFileHash.set(fileKey, file);
            }
        });

        if (duplicateNewFiles.length > 0) {
            setError(`本次选择了重复的图片：${duplicateNewFiles.join(', ')}`);
            return;
        }

        // 检查与现有图片的重复
        const existingFiles = imageList.filter(img => !img.isDeleted && img.file);
        const duplicateExistingFiles: string[] = [];

        newFileHash.forEach((file, fileKey) => {
            existingFiles.forEach(existingImg => {
                if (existingImg.file) {
                    const existingKey = `${existingImg.file.name}_${existingImg.file.size}_${existingImg.file.lastModified}`;
                    if (fileKey === existingKey) {
                        duplicateExistingFiles.push(file.name);
                    }
                }
            });
        });

        if (duplicateExistingFiles.length > 0) {
            setError(`以下图片已经添加过了：${duplicateExistingFiles.join(', ')}`);
            return;
        }

        const newItems: ImageItem[] = [];

        newFileHash.forEach(file => {
            // 简单验证
            if (file.size > 5 * 1024 * 1024) {
                setError(`文件 ${file.name} 超过5MB`);
                return;
            }

            // 创建临时ID和预览URL
            const tempId = `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const previewUrl = URL.createObjectURL(file);

            newItems.push({
                id: tempId,
                url: previewUrl,
                file: file,
                isExisting: false,
                isDeleted: false
            });
        });

        if (newItems.length > 0) {
            setImageList(prev => {
                const updatedList = [...prev, ...newItems];
                // 如果之前没有主图（比如全删了），新加的第一张自动成为主图
                // 修复：即使已经有主图记录，但如果主图已被删除或不存在于当前列表中，也要设置第一张新图为默认主图
                if (!mainImageId || (mainImageId && !prev.find(item => item.id === mainImageId && !item.isDeleted))) {
                    // 查找当前有效的第一张图片作为主图
                    const firstActive = updatedList.find(item => !item.isDeleted);
                    if (firstActive) {
                        setMainImageId(firstActive.id);
                    }
                }
                return updatedList;
            });
        }

        // 清空input防止重复选择同一文件不触发onChange
        event.target.value = '';
    };

    // 设为主图
    const handleSetMainImage = (id: string) => {
        if (mainImageId === id) return;

        // 记录上一任主图
        setPrevMainImageId(mainImageId);
        // 设置新主图
        setMainImageId(id);
    };

    // 删除图片
    const handleRemoveImage = (id: string) => {
        setImageList(prevList => {
            const targetIndex = prevList.findIndex(item => item.id === id);
            if (targetIndex === -1) return prevList;

            const targetItem = prevList[targetIndex];
            if (!targetItem) return prevList;

            let newList = [...prevList];

            // 逻辑分支：已有图片标记删除，新图片直接移除
            if (targetItem.isExisting) {
                newList[targetIndex] = { ...targetItem, isDeleted: true };
            } else {
                newList.splice(targetIndex, 1);
            }

            // --- 智能主图回溯逻辑 ---
            if (mainImageId === id) {
                // 1. 尝试回溯到上一任
                const prevItem = prevMainImageId ? newList.find(item => item.id === prevMainImageId) : null;

                if (prevItem && !prevItem.isDeleted) {
                    // 上一任还在且没被删，回退成功
                    setMainImageId(prevItem.id);
                    // prevMainImageId 保持不变或者置空？置空比较合理，因为已经用掉了这次"后悔药"
                    setPrevMainImageId(null);
                } else {
                    // 2. 上一任也不在了，找列表里第一个活着的
                    const firstActive = newList.find(item => !item.isDeleted);
                    if (firstActive) {
                        setMainImageId(firstActive.id);
                    } else {
                        setMainImageId(null); // 全军覆没
                    }
                    setPrevMainImageId(null); // 链条断了
                }
            } else if (prevMainImageId === id) {
                // 如果删除的是"上一任"，把记录清空即可，不影响当前主图
                setPrevMainImageId(null);
            }

            return newList;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 验证
        if (!formData.name || !formData.categoryId || formData.price === undefined) {
            setError('请填写所有必填字段');
            return;
        }
        if (getActiveImageCount() === 0) {
            setError('请至少上传一张商品图片');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const newFiles = imageList
                .filter(item => !item.isExisting && !item.isDeleted && item.file)
                .map(item => item.file!);

            // 确定主图索引（对于新图片）
            let newImageMainIndex: number = 0; // 默认第一张图为主图
            const mainItem = imageList.find(item => item.id === mainImageId);

            if (mainItem && !mainItem.isExisting) {
                const newFilesIds = imageList
                    .filter(item => !item.isExisting && !item.isDeleted)
                    .map(item => item.id);
                const index = newFilesIds.indexOf(mainItem.id);
                if (index !== -1) {
                    newImageMainIndex = index;
                }
            }
            // 创建商品时如果没有选择主图，默认第一张图为主图

            // 根据是否有productId判断是创建还是编辑
            if (productId) {
                // 编辑模式：更新现有商品
                const existingImages = imageList
                    .filter(item => item.isExisting)
                    .map((item, index) => {
                        const isMainImage = item.id === mainImageId;
                        return {
                            id: parseInt(item.id),
                            imagePath: item.url,
                            imageType: isMainImage ? 1 : 2,
                            sortOrder: index,
                            isDeleted: item.isDeleted || false
                        };
                    });

                const newImages = imageList
                    .filter(item => !item.isExisting && !item.isDeleted)
                    .map((item, index) => {
                        const isMainImage = item.id === mainImageId;
                        return {
                            imageType: isMainImage ? 1 : 2,
                            sortOrder: index
                        };
                    });

                const newImageFiles = imageList
                    .filter(item => !item.isExisting && !item.isDeleted && item.file)
                    .map(item => item.file!);

                const completeProductData = {
                    ...formData,
                };

                await updateProduct.mutateAsync({
                    id: productId,
                    productData: completeProductData,
                    updateRequest: {
                        existingImages,
                        newImages,
                        imageFiles: newImageFiles
                    }
                });
            } else {
                // 创建模式：创建新商品
                const newProductData = {
                    name: formData.name,
                    categoryId: formData.categoryId,
                    description: formData.description || '',
                    price: formData.price,
                    originalPrice: formData.originalPrice,
                    stockQuantity: formData.stockQuantity,
                    lowStockThreshold: formData.lowStockThreshold,
                    status: formData.status || 1,
                    featured: formData.featured || 0,
                    flowerLanguage: formData.flowerLanguage || '',
                    careGuide: formData.careGuide || '',
                    images: newFiles,
                };

                await createProduct.mutateAsync({
                    formData: newProductData,
                    mainImageIndex: newImageMainIndex
                });
            }

            onSuccess();
            onClose();
        } catch (err) {
            const errorMessage = productId ? '更新商品失败' : '创建商品失败';
            setError(err instanceof Error ? err.message : errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) onClose();
    };

    const activeCount = getActiveImageCount();

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h5" component="div" fontWeight="bold">
                    {productId ? '编辑商品' : '添加商品'}
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                {productLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handleSubmit}>
                        {(error || productError) && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => {
                                setError(null);
                                // productError 会通过 React Query 自动处理
                            }}>
                                {error || (productError instanceof Error ? productError.message : '加载商品失败')}
                            </Alert>
                        )}

                        <Stack spacing={2}>
                            {/* 图片管理区域 */}
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    商品图片 ({activeCount}/9)
                                </Typography>

                                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                                    {imageList.map((item) => {
                                        // 不渲染已标记删除的图片
                                        if (item.isDeleted) return null;

                                        const isMain = item.id === mainImageId;

                                        return (
                                            <Card key={item.id} sx={{
                                                width: 100,
                                                height: 100,
                                                position: 'relative',
                                                border: isMain ? '2px solid' : '1px solid',
                                                borderColor: isMain ? 'primary.main' : 'grey.300',
                                            }}>
                                                <CardMedia
                                                    component="img"
                                                    image={item.isExisting && item.url.startsWith('/uploads/')
                                                        ? `${API_BASE_URL}${item.url}`
                                                        : item.url}
                                                    alt="商品图片"
                                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />

                                                {/* 主图标识 */}
                                                {isMain && (
                                                    <Chip
                                                        label="主图"
                                                        size="small"
                                                        color="primary"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 4,
                                                            left: 4,
                                                            height: 20,
                                                            fontSize: '0.7rem',
                                                            zIndex: 2
                                                        }}
                                                    />
                                                )}

                                                {/* 设为主图按钮 */}
                                                {!isMain && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            bgcolor: 'rgba(0,0,0,0.3)',
                                                            opacity: 0,
                                                            transition: 'opacity 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            '&:hover': { opacity: 1 }
                                                        }}
                                                    >
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => handleSetMainImage(item.id)}
                                                            sx={{ fontSize: '0.7rem', py: 0.5, minWidth: 'auto' }}
                                                        >
                                                            设为主图
                                                        </Button>
                                                    </Box>
                                                )}

                                                {/* 删除按钮 */}
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveImage(item.id)}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 4,
                                                        right: 4,
                                                        bgcolor: 'rgba(0,0,0,0.6)',
                                                        color: 'white',
                                                        width: 20,
                                                        height: 20,
                                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                                                        zIndex: 2
                                                    }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Card>
                                        );
                                    })}

                                    {/* 上传按钮 */}
                                    {activeCount < 9 && (
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                borderStyle: 'dashed',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <UploadIcon sx={{ mb: 1 }} />
                                            <Typography variant="caption">添加图片</Typography>
                                            <input
                                                type="file"
                                                hidden
                                                multiple
                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                onChange={handleImageSelect}
                                            />
                                        </Button>
                                    )}
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                    支持 JPG、PNG、GIF、WebP，单张不超过5MB。不允许上传重复图片。点击图片可设为主图。
                                </Typography>
                            </Box>

                            {/* 其他表单字段保持不变 */}
                            <TextField
                                fullWidth
                                required
                                label="商品名称"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={submitting}
                            />

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <FormControl fullWidth required>
                                    <InputLabel>商品分类</InputLabel>
                                    <Select
                                        value={formData.categoryId || ''}
                                        label="商品分类"
                                        onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                                        disabled={submitting}
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    required
                                    type="number"
                                    label="售价"
                                    value={formData.price === undefined || formData.price === 0 ? '' : formData.price}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({
                                            ...formData,
                                            price: value ? Number(value) : undefined
                                        });
                                    }}
                                    disabled={submitting}
                                    inputProps={{ min: 0, step: 0.01 }}
                                    placeholder="请输入售价"
                                />
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="原价（选填）"
                                    value={formData.originalPrice === undefined || formData.originalPrice === 0 ? '' : formData.originalPrice}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({
                                            ...formData,
                                            originalPrice: value ? Number(value) : undefined
                                        });
                                    }}
                                    disabled={submitting}
                                    inputProps={{ min: 0, step: 0.01 }}
                                    placeholder="可选"
                                />

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="库存数量"
                                    value={formData.stockQuantity === 0 ? '' : formData.stockQuantity}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({
                                            ...formData,
                                            stockQuantity: value ? Number(value) : 0
                                        });
                                    }}
                                    disabled={submitting}
                                    inputProps={{ min: 0 }}
                                    placeholder="0"
                                />

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="库存预警阈值"
                                    value={formData.lowStockThreshold === 0 ? '' : formData.lowStockThreshold}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({
                                            ...formData,
                                            lowStockThreshold: value ? Number(value) : 0
                                        });
                                    }}
                                    disabled={submitting}
                                    inputProps={{ min: 0 }}
                                    placeholder="0"
                                />
                            </Stack>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="商品描述"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                disabled={submitting}
                            />

                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="花语（选填）"
                                value={formData.flowerLanguage}
                                onChange={(e) => setFormData({ ...formData, flowerLanguage: e.target.value })}
                                disabled={submitting}
                            />

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="养护指南（选填）"
                                value={formData.careGuide}
                                onChange={(e) => setFormData({ ...formData, careGuide: e.target.value })}
                                disabled={submitting}
                            />

                            <Stack direction="row" spacing={3}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.status === 1}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                                            disabled={submitting}
                                        />
                                    }
                                    label="上架销售"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.featured === 1}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked ? 1 : 0 })}
                                            disabled={submitting}
                                        />
                                    }
                                    label="设为推荐"
                                />
                            </Stack>
                        </Stack>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} disabled={submitting}>
                    取消
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={productLoading || submitting || updateProduct.isPending || createProduct.isPending}
                    startIcon={(submitting || updateProduct.isPending || createProduct.isPending) && <CircularProgress size={20} />}
                >
                    {(submitting || updateProduct.isPending || createProduct.isPending)
                        ? (productId ? '更新中...' : '创建中...')
                        : (productId ? '更新' : '创建')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductEditDialog;
