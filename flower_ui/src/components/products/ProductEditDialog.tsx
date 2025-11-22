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
import { type Product, type ProductFormData, parseImagesJson } from '../../models/product';
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
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
        setExistingImages([]);
        setImagePreviews([]);
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
            const images = parseImagesJson(product.images);
            setExistingImages(images);
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
        const totalImages = existingImages.length + selectedImages.length + fileArray.length;

        // 限制最多9张图片
        if (totalImages > 9) {
            setError(`最多只能上传9张图片，当前已有${existingImages.length + selectedImages.length}张`);
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

    // 删除新选择的图片
    const handleRemoveNewImage = (index: number) => {
        setSelectedImages(selectedImages.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    // 删除现有图片
    const handleRemoveExistingImage = (index: number) => {
        setExistingImages(existingImages.filter((_, i) => i !== index));
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
        if (existingImages.length === 0 && selectedImages.length === 0) {
            setError('请至少上传一张商品图片');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // 构建提交数据
            const productData: ProductFormData = {
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
                images: selectedImages, // 新上传的图片
            };

            // 如果有现有图片，需要保留它们
            // 注意：这里简化处理，实际应该在后端合并新旧图片
            // 暂时只上传新图片，如果没有新图片则保持原有图片不变

            await productAPI.updateProduct(productId, productData);
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

    const totalImages = existingImages.length + selectedImages.length;

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
                                    商品图片 ({totalImages}/9) {totalImages > 0 && <Chip label="第一张为主图" size="small" color="primary" />}
                                </Typography>

                                {/* 现有图片 */}
                                {existingImages.length > 0 && (
                                    <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                                        {existingImages.map((img, index) => (
                                            <Card key={`existing-${index}`} sx={{ width: 100, height: 100, position: 'relative' }}>
                                                <CardMedia
                                                    component="img"
                                                    image={`http://localhost:8080/api${img}`}
                                                    alt={`现有图片 ${index + 1}`}
                                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                {index === 0 && (
                                                    <Chip
                                                        label="主图"
                                                        size="small"
                                                        color="primary"
                                                        sx={{ position: 'absolute', top: 4, left: 4, fontSize: '0.7rem' }}
                                                    />
                                                )}
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveExistingImage(index)}
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
                                        ))}
                                    </Stack>
                                )}

                                {/* 新选择的图片预览 */}
                                {imagePreviews.length > 0 && (
                                    <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                                        {imagePreviews.map((preview, index) => (
                                            <Card key={`new-${index}`} sx={{ width: 100, height: 100, position: 'relative' }}>
                                                <CardMedia
                                                    component="img"
                                                    image={preview}
                                                    alt={`新图片 ${index + 1}`}
                                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <Chip
                                                    label="新"
                                                    size="small"
                                                    color="success"
                                                    sx={{ position: 'absolute', top: 4, left: 4, fontSize: '0.7rem' }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveNewImage(index)}
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
                                        ))}
                                    </Stack>
                                )}

                                {/* 上传按钮 */}
                                {totalImages < 9 && (
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<UploadIcon />}
                                        disabled={submitting}
                                    >
                                        选择图片
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
