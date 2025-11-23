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
import { type Product, parseProductImages } from '../../models/product';
import { productAPI } from '../../api/productAPI';
import { categoryAPI, type Category } from '../../api/categoryAPI';

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

    // 加载商品数据
    useEffect(() => {
        if (open && productId) {
            loadProduct();
        } else if (!open) {
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
        setImageList([]);
        setMainImageId(null);
        setPrevMainImageId(null);
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

            // 解析现有图片并转换为统一格式
            const images = parseProductImages(product.images);
            const newImageList: ImageItem[] = [];

            // 处理主图
            if (images.main) {
                newImageList.push({
                    id: images.main,
                    url: images.main,
                    isExisting: true,
                    isDeleted: false
                });
            }

            // 处理副图 (去重：如果主图也在副图中，跳过)
            images.subImages.forEach(imgUrl => {
                if (imgUrl !== images.main) {
                    newImageList.push({
                        id: imgUrl,
                        url: imgUrl,
                        isExisting: true,
                        isDeleted: false
                    });
                }
            });

            setImageList(newImageList);
            // 初始化主图指针
            if (images.main) {
                setMainImageId(images.main);
            } else if (newImageList.length > 0) {
                setMainImageId(newImageList[0].id);
            }
            setPrevMainImageId(null); // 初始加载没有"上一任"

        } catch (err) {
            setError(err instanceof Error ? err.message : '加载商品失败');
        } finally {
            setLoading(false);
        }
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

        const newItems: ImageItem[] = [];

        fileArray.forEach(file => {
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
                if (!mainImageId && getActiveImageCount() === 0) {
                    setMainImageId(newItems[0].id);
                    // 这种情况不需要设置 prevMainImageId，因为是从无到有
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
        if (!productId) return;

        // 验证
        if (!formData.name || !formData.categoryId || !formData.price) {
            setError('请填写所有必填字段');
            return;
        }
        if (getActiveImageCount() === 0) {
            setError('请至少保留一张商品图片');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // --- 准备提交数据 ---

            // 1. 待删除的已有图片路径
            const imagesToDelete = imageList
                .filter(item => item.isExisting && item.isDeleted)
                .map(item => item.url); // 对于已有图片，url就是path

            // 2. 待上传的新文件
            const newFiles = imageList
                .filter(item => !item.isExisting && !item.isDeleted && item.file)
                .map(item => item.file!);

            // 3. 构建 product.images JSON 结构 (仅包含保留的已有图片)
            // 后端逻辑：先处理删除，再处理上传。所以这里我们只传"保留下来的已有图片"
            // 新图片由后端上传后自动追加/插入
            const keptExistingImages = imageList
                .filter(item => item.isExisting && !item.isDeleted);

            // 确定主图
            // 如果当前主图是"已有图片"，直接设置
            // 如果当前主图是"新图片"，需要计算它在 newFiles 中的索引
            let finalMainPath: string | undefined = undefined;
            let newImageMainIndex: number | null = null;

            const mainItem = imageList.find(item => item.id === mainImageId);

            if (mainItem) {
                if (mainItem.isExisting) {
                    finalMainPath = mainItem.url;
                } else {
                    // 是新图片，找到它在 newFiles 里的下标
                    // 注意：newFiles 的顺序必须和 imageList 中新图片的顺序一致
                    // 我们的 filter 逻辑保持了顺序
                    const newFilesIds = imageList
                        .filter(item => !item.isExisting && !item.isDeleted)
                        .map(item => item.id);
                    const index = newFilesIds.indexOf(mainItem.id);
                    if (index !== -1) {
                        newImageMainIndex = index;
                    }
                }
            }

            // 构建传给后端的 images 结构 (只包含已有图片)
            const imagesStruct = {
                main: finalMainPath, // 如果是新图片，这里是 undefined，后端会忽略
                subImages: keptExistingImages
                    .filter(item => item.url !== finalMainPath) // 排除已设为主图的
                    .map(item => item.url)
            };

            const completeProductData = {
                ...formData,
                images: imagesStruct, // 传递当前保留的已有图片结构
                newImageMainIndex: newImageMainIndex, // 告诉后端哪个新文件是主图
            };

            // @ts-ignore - 忽略类型检查，因为我们传的是构造好的特殊对象
            await productAPI.updateProductWithImagesState(
                productId,
                completeProductData,
                newFiles,
                imagesToDelete
            );

            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : '更新商品失败');
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
                                                        ? `http://localhost:8080/api${item.url}`
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
                                    支持 JPG、PNG、GIF、WebP，单张不超过5MB。点击图片可设为主图。
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
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    disabled={submitting}
                                    inputProps={{ min: 0, step: 0.01 }}
                                />
                            </Stack>

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
