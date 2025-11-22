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
    Image as ImageIcon,
} from '@mui/icons-material';
import { type Product, type ProductFormData, type ProductImages, parseProductImages, productImagesToJson } from '../../models/product';
import { productAPI } from '../../api/productAPI';
import { categoryAPI, type Category } from '../../api/categoryAPI';

interface ProductEditDialogProps {
    open: boolean;
    productId: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

const ProductEditDialog: React.FC<ProductEditDialogProps> = ({
    open,
    productId,
    onClose,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        categoryId: 0,
        description: '',
        price: 0,
        originalPrice: 0,
        stockQuantity: 0,
        lowStockThreshold: 5,
        status: 1,
        featured: 0,
        flowerLanguage: '',
        careGuide: '',
    });

    // 图片相关状态
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [productImages, setProductImages] = useState<ProductImages>({ subImages: [] });
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    // 保存图片的原始显示顺序（用于位置保持）
    const [imageDisplayOrder, setImageDisplayOrder] = useState<string[]>([]);
    // 标记要删除的已保存图片
    const [imagesToDelete, setImagesToDelete] = useState<Set<string>>(new Set());
    // 跟踪新图片中哪张被设为主图（存储preview index）
    const [newImageMainIndex, setNewImageMainIndex] = useState<number | null>(null);

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

    // 加载商品数据
    useEffect(() => {
        if (open && productId) {
            loadProduct();
        } else if (!open) {
            // 关闭对话框时清理状态
            resetForm();
        }
    }, [open, productId]);

    const resetForm = () => {
        setFormData({
            name: '',
            categoryId: 0,
            description: '',
            price: 0,
            originalPrice: 0,
            stockQuantity: 0,
            lowStockThreshold: 5,
            status: 1,
            featured: 0,
            flowerLanguage: '',
            careGuide: '',
        });
        setSelectedImages([]);
        setProductImages({ subImages: [] });
        setImagePreviews([]);
        setImageDisplayOrder([]);
        setImagesToDelete(new Set());
        setNewImageMainIndex(null);
        setError(null);
    };

    const loadProduct = async () => {
        if (!productId) return;

        setLoading(true);
        setError(null);
        try {
            const product = await productAPI.getProductById(productId);
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

            // 加载现有图片
            const images = parseProductImages(product.images);
            setProductImages(images);

            // 设置图片显示顺序：保持后端的原始顺序
            // 后端的逻辑：主图在subImages中可能存在也可能不存在
            // 如果主图不在subImages中，应该先显示主图，再显示副图
            // 如果主图在subImages中，只按副图顺序显示
            let displayOrder = [];
            if (images.main && !images.subImages.includes(images.main)) {
                // 主图不在副图中，先显示主图，再显示副图
                displayOrder = [images.main, ...images.subImages];
            } else {
                // 主图在副图中或者没有主图，按副图顺序显示
                displayOrder = [...images.subImages];
            }
            setImageDisplayOrder(displayOrder);
        } catch (err) {
            setError(err instanceof Error ? err.message : '加载商品失败');
        } finally {
            setLoading(false);
        }
    };

    // 处理图片选择
    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const fileArray = Array.from(files);
        const totalImages = getTotalImageCount() + fileArray.length;

        // 限制最多9张图片
        if (totalImages > 9) {
            setError(`最多只能上传9张图片，当前已有${getTotalImageCount()}张`);
            return;
        }

        // 验证文件类型和大小
        const validFiles: File[] = [];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        for (const file of fileArray) {
            if (!allowedTypes.includes(file.type)) {
                setError(`文件 ${file.name} 格式不支持，仅支持 jpg, png, gif, webp`);
                continue;
            }
            if (file.size > maxSize) {
                setError(`文件 ${file.name} 大小超过5MB`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            setSelectedImages([...selectedImages, ...validFiles]);

            // 生成预览
            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // 获取当前总图片数
    const getTotalImageCount = () => {
        return selectedImages.length + (productImages.main ? 1 : 0) + productImages.subImages.length;
    };

  // 设置主图（仅前端状态变更，位置不变）
    const handleSetMainImage = (imagePath: string) => {
        // Check if this is a new image (preview path)
        const isNewImage = imagePath.startsWith('preview-');

        if (isNewImage) {
            // Extract the index from preview path
            const index = parseInt(imagePath.replace('preview-', ''));
            setNewImageMainIndex(index);
            // 保持原有主图信息，不清除！让后端处理主图切换
            return;
        }

        // For existing images, clear new image main selection and update productImages
        setNewImageMainIndex(null);

        setProductImages(prev => {
            const newImages = { ...prev };
            const oldMain = newImages.main;

            // 设置新主图
            newImages.main = imagePath;

            // 如果旧主图不在副图中，且新主图在副图中，需要将旧主图添加到副图
            if (oldMain && oldMain !== imagePath && !newImages.subImages.includes(oldMain)) {
                // 将旧主图添加到副图中
                newImages.subImages.push(oldMain);
            }

            // 从副图中移除新主图（避免重复）
            newImages.subImages = newImages.subImages.filter(img => img !== imagePath);

            return newImages;
        });
    };

    // 删除图片
    const handleRemoveImage = (imagePath: string) => {
        // 检查是否是已保存的图片（在productImages中）
        const isExistingImage = productImages.main === imagePath ||
                               productImages.subImages.includes(imagePath);

        if (isExistingImage) {
            // 已保存的图片：标记为要删除
            setImagesToDelete(prev => new Set([...prev, imagePath]));

            // 从显示顺序中移除
            setImageDisplayOrder(prev => prev.filter(path => path !== imagePath));

            // 从前端显示中移除
            setProductImages(prev => {
                const newImages = { ...prev };
                if (prev.main === imagePath) {
                    // 删除主图，提升第一张副图为主图
                    if (prev.subImages.length > 0) {
                        newImages.main = prev.subImages[0];
                        newImages.subImages = prev.subImages.slice(1);
                    } else {
                        newImages.main = undefined;
                    }
                } else {
                    // 从副图中移除
                    newImages.subImages = prev.subImages.filter(img => img !== imagePath);
                }
                return newImages;
            });
        }
        // 如果是新添加的图片，在提交时不会包含，所以不需要特殊处理
    };

    // 删除新选择的图片
    const handleRemoveNewImage = (index: number) => {
        setSelectedImages(selectedImages.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));

        // 如果删除的新图片是主图，清除主图状态
        if (newImageMainIndex === index) {
            setNewImageMainIndex(null);
        } else if (newImageMainIndex !== null && newImageMainIndex > index) {
            // 如果删除的图片在主图之前，需要调整主图索引
            setNewImageMainIndex(newImageMainIndex - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!productId) return;

        // 验证必填字段
        if (!formData.name || !formData.categoryId || !formData.price) {
            setError('请填写所有必填字段');
            return;
        }

        // 验证价格
        if (formData.originalPrice && formData.price > formData.originalPrice) {
            setError('售价不能高于原价');
            return;
        }

        // 验证至少有一张图片
        const totalImages = getTotalImageCount();
        if (totalImages === 0) {
            setError('请至少上传一张商品图片');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // 构建完整的商品数据（包含当前图片状态）
            // 简化逻辑：直接传递当前的productImages状态
            // 新图片的主图设置将在后端处理
            let finalImagesState = { ...productImages };

            // 如果没有已保存图片，且有新图片，自动将第一张新图片设为主图
            let finalNewImageMainIndex = newImageMainIndex;
            if (imageDisplayOrder.length === 0 && selectedImages.length > 0 && newImageMainIndex === null) {
                finalNewImageMainIndex = 0; // 第一张新图片为主图
            }

            const completeProductData = {
                name: formData.name!,
                categoryId: formData.categoryId!,
                description: formData.description || '',
                price: formData.price!,
                originalPrice: formData.originalPrice,
                stockQuantity: formData.stockQuantity || 0,
                lowStockThreshold: formData.lowStockThreshold || 5,
                status: formData.status!,
                featured: formData.featured!,
                flowerLanguage: formData.flowerLanguage,
                careGuide: formData.careGuide,
                // 直接传递当前状态，让后端处理新图片主图逻辑
                images: finalImagesState,
                // 添加标记：哪个新图片被设为主图（可能自动设置为第一张）
                newImageMainIndex: finalNewImageMainIndex,
            };

            // 统一使用新的API处理图片
            await productAPI.updateProductWithImagesState(productId, completeProductData, selectedImages, Array.from(imagesToDelete));

            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : '更新商品失败');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            onClose();
        }
    };

    const totalImages = getTotalImageCount();

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Typography variant="h5" component="div" fontWeight="bold">
                    编辑商品
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handleSubmit}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        <Stack spacing={2}>
                            {/* 商品图片上传 */}
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    商品图片 ({totalImages}/9)
                                </Typography>

                                {/* 所有图片 - 已保存的 + 新添加的 */}
                                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                                    {/* 获取所有图片并合并 */}
                                    {(() => {
                                        // 收集所有图片数据，按原始显示顺序排列
                                        const allImages = [];

                                        // 按原始顺序显示已保存的图片
                                        imageDisplayOrder.forEach(path => {
                                            // 跳过已标记删除的图片
                                            if (imagesToDelete.has(path)) {
                                                return;
                                            }
                                            // 判断是否为主图：考虑新图片主图设置
                                            let isMainImage = path === productImages.main;
                                            // 如果有新图片被设为主图，则没有图片是主图（新图片在后续逻辑中处理）
                                            if (newImageMainIndex !== null) {
                                                isMainImage = false;
                                            }
                                            allImages.push({
                                                path,
                                                isMain: isMainImage,
                                                isNew: false
                                            });
                                        });

                                        // 添加新图片
                                        imagePreviews.forEach((preview, index) => {
                                            // 判断是否为主图
                                            let shouldbeMain = false;
                                            if (newImageMainIndex !== null) {
                                                // 有明确设置的主图
                                                shouldbeMain = newImageMainIndex === index;
                                            } else if (imageDisplayOrder.length === 0 && index === 0) {
                                                // 没有已保存图片且没有手动设置主图时，第一张新图片自动为主图
                                                shouldbeMain = true;
                                            }
                                            allImages.push({
                                                path: `preview-${index}`,
                                                isMain: shouldbeMain,
                                                isNew: true,
                                                preview,
                                                newIndex: index
                                            });
                                        });

                                        return allImages.map((imageData, index) => {
                                            const isMainImage = imageData.isMain;

                                            return (
                                                <Card key={`image-${index}`} sx={{
                                                    width: 100,
                                                    height: 100,
                                                    position: 'relative',
                                                    border: isMainImage ? '2px solid primary.main' : 'none'
                                                }}>
                                                    <CardMedia
                                                        component="img"
                                                        image={imageData.preview || (imageData.path.startsWith('/uploads/')
                                                            ? `http://localhost:8080/api${imageData.path}`
                                                            : imageData.path)}
                                                        alt={`图片 ${index + 1}`}
                                                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />

                                                    {/* 主图标签 */}
                                                    {isMainImage && (
                                                        <Chip
                                                            label="主图"
                                                            size="small"
                                                            color="primary"
                                                            sx={{ position: 'absolute', top: 4, left: 4, fontSize: '0.7rem' }}
                                                        />
                                                    )}

                                                    {/* 新图片不显示"新"标记，因为已有"已保存"标记区分 */}

                                                    {/* 已保存标签 */}
                                                    {!imageData.isNew && (
                                                        <Chip
                                                            label="已保存"
                                                            size="small"
                                                            sx={{ position: 'absolute', bottom: 4, left: 4, fontSize: '0.6rem' }}
                                                        />
                                                    )}

                                                    {/* 设为主图按钮 - 对所有非主图图片显示 */}
                                                    {!isMainImage && getTotalImageCount() > 1 && (
                                                        <Button
                                                            size="small"
                                                            onClick={() => handleSetMainImage(imageData.path)}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 4,
                                                                left: 4,
                                                                fontSize: '0.6rem',
                                                                minWidth: 'auto',
                                                                px: 0.5,
                                                                py: 0.25,
                                                                bgcolor: 'rgba(255,255,255,0.9)',
                                                                '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                                                            }}
                                                        >
                                                            设为主图
                                                        </Button>
                                                    )}

                                                    {/* 删除按钮 */}
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            if (imageData.isNew) {
                                                                // 删除新图片
                                                                const newImageIndex = parseInt(imageData.path.split('preview-')[1]);
                                                                handleRemoveNewImage(newImageIndex);
                                                            } else {
                                                                // 删除已保存图片
                                                                handleRemoveImage(imageData.path);
                                                            }
                                                        }}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 4,
                                                            right: 4,
                                                            bgcolor: 'rgba(0,0,0,0.6)',
                                                            color: 'white',
                                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Card>
                                            );
                                        });
                                    })()}
                                </Stack>

                                {/* 上传按钮 */}
                                {totalImages < 9 && (
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<UploadIcon />}
                                        disabled={submitting}
                                    >
                                        添加图片
                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                            onChange={handleImageSelect}
                                        />
                                    </Button>
                                )}
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                    支持 JPG、PNG、GIF、WebP 格式，单张不超过5MB
                                </Typography>
                            </Box>

                            {/* 商品名称 */}
                            <TextField
                                fullWidth
                                required
                                label="商品名称"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={submitting}
                            />

                            {/* 商品分类和售价 */}
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
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    disabled={submitting}
                                    inputProps={{ min: 0, step: 0.01 }}
                                />
                            </Stack>

                            {/* 原价和库存 */}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="原价（选填）"
                                    value={formData.originalPrice || ''}
                                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                                    disabled={submitting}
                                    inputProps={{ min: 0, step: 0.01 }}
                                />

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="库存数量"
                                    value={formData.stockQuantity}
                                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                                    disabled={submitting}
                                    inputProps={{ min: 0 }}
                                />

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="库存预警阈值"
                                    value={formData.lowStockThreshold}
                                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                                    disabled={submitting}
                                    inputProps={{ min: 0 }}
                                />
                            </Stack>

                            {/* 商品描述 */}
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="商品描述"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                disabled={submitting}
                            />

                            {/* 花语 */}
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="花语（选填）"
                                value={formData.flowerLanguage}
                                onChange={(e) => setFormData({ ...formData, flowerLanguage: e.target.value })}
                                disabled={submitting}
                            />

                            {/* 养护指南 */}
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="养护指南（选填）"
                                value={formData.careGuide}
                                onChange={(e) => setFormData({ ...formData, careGuide: e.target.value })}
                                disabled={submitting}
                            />

                            {/* 状态开关 */}
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
                    disabled={loading || submitting}
                    startIcon={submitting && <CircularProgress size={20} />}
                >
                    {submitting ? '保存中...' : '保存'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductEditDialog;
