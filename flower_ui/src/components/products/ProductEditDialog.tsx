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
} from '@mui/material';
import { CloudUpload as UploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { type Product, type ProductFormData } from '../../models/product';
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
        }
    }, [open, productId]);

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
        } catch (err) {
            setError(err instanceof Error ? err.message : '加载商品失败');
        } finally {
            setLoading(false);
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

        setSubmitting(true);
        setError(null);

        try {
            // 构建提交数据（不包含图片，图片上传需要单独处理）
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
                images: [], // 暂不支持图片编辑
            };

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
            setError(null);
        }
    };

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
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Stack spacing={2}>
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
