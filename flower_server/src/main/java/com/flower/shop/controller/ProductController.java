package com.flower.shop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.flower.shop.dto.Result;
import com.flower.shop.dto.ProductSearchRequest;
import com.flower.shop.entity.Product;
import com.flower.shop.service.ProductService;
import com.flower.shop.config.FileUploadConfig;
import com.flower.shop.util.FileUploadUtil;
import com.flower.shop.util.ProductImagesUtil;
import com.alibaba.fastjson.JSON;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 商品控制器
 *
 * 功能说明：
 * - 商品CRUD接口
 * - 商品搜索和筛选
 * - 商品状态管理
 */
@Slf4j
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@CrossOrigin
@Validated
public class ProductController {

    private final ProductService productService;
    private final FileUploadConfig fileUploadConfig;

    /**
     * 分页查询商品列表
     */
    @GetMapping("/page")
    public Result<IPage<Product>> getProductPage(
            @RequestParam(value = "current", defaultValue = "1") @Min(1) Integer current,
            @RequestParam(value = "size", defaultValue = "10") @Min(1) Integer size) {
        try {
            IPage<Product> productPage = productService.getProductPage(current, size);
            return Result.success("获取商品列表成功", productPage);
        } catch (Exception e) {
            log.error("获取商品列表失败", e);
            return Result.error("获取商品列表失败");
        }
    }

    /**
     * 获取上架商品列表（分页）
     */
    @GetMapping("/online")
    public Result<IPage<Product>> getOnlineProducts(
            @RequestParam(value = "current", defaultValue = "1") @Min(1) Integer current,
            @RequestParam(value = "size", defaultValue = "12") @Min(1) Integer size) {
        try {
            IPage<Product> productPage = productService.getOnlineProductsPage(current, size);
            return Result.success("获取上架商品成功", productPage);
        } catch (Exception e) {
            log.error("获取上架商品失败", e);
            return Result.error("获取上架商品失败");
        }
    }

    /**
     * 获取推荐商品列表
     */
    @GetMapping("/featured")
    public Result<List<Product>> getFeaturedProducts(
            @RequestParam(defaultValue = "10") @Min(1) Integer limit) {
        try {
            List<Product> products = productService.getFeaturedProducts(limit);
            return Result.success("获取推荐商品成功", products);
        } catch (Exception e) {
            log.error("获取推荐商品失败", e);
            return Result.error("获取推荐商品失败");
        }
    }

    /**
     * 获取热销商品列表
     */
    @GetMapping("/top-selling")
    public Result<List<Product>> getTopSellingProducts(
            @RequestParam(defaultValue = "10") @Min(1) Integer limit) {
        try {
            List<Product> products = productService.getTopSellingProducts(limit);
            return Result.success("获取热销商品成功", products);
        } catch (Exception e) {
            log.error("获取热销商品失败", e);
            return Result.error("获取热销商品失败");
        }
    }

    /**
     * 搜索商品（支持多条件查询）
     */
    @PostMapping("/search")
    public Result<IPage<Product>> searchProducts(@RequestBody @Valid ProductSearchRequest request) {
        try {
            // 验证价格范围
            if (!request.hasValidPriceRange()) {
                return Result.validationError("最低价格不能大于最高价格");
            }

            IPage<Product> productPage = productService.searchProductsAdvanced(request);
            return Result.success("搜索商品成功", productPage);
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("搜索商品失败", e);
            return Result.error("搜索商品失败");
        }
    }

    /**
     * 按分类查询商品
     */
    @GetMapping("/category/{categoryId}")
    public Result<List<Product>> getProductsByCategory(@PathVariable("categoryId") @NotNull Long categoryId) {
        try {
            List<Product> products = productService.getProductsByCategoryId(categoryId);
            return Result.success("获取分类商品成功", products);
        } catch (Exception e) {
            log.error("获取分类商品失败", e);
            return Result.error("获取分类商品失败");
        }
    }

    /**
     * 按价格区间查询商品
     */
    @GetMapping("/price-range")
    public Result<List<Product>> getProductsByPriceRange(
            @RequestParam @NotNull BigDecimal minPrice,
            @RequestParam @NotNull BigDecimal maxPrice) {
        try {
            List<Product> products = productService.getProductsByPriceRange(minPrice, maxPrice);
            return Result.success("获取价格区间商品成功", products);
        } catch (Exception e) {
            log.error("获取价格区间商品失败", e);
            return Result.error("获取价格区间商品失败");
        }
    }

    /**
     * 根据ID获取商品详情
     */
    @GetMapping("/{id}")
    public Result<Product> getProductById(@PathVariable("id") @NotNull Long id) {
        try {
            Product product = productService.getProductWithDetails(id);
            if (product == null) {
                return Result.error("商品不存在");
            }

            // 浏览量功能暂不实现

            return Result.success("获取商品详情成功", product);
        } catch (Exception e) {
            log.error("获取商品详情失败", e);
            return Result.error("获取商品详情失败");
        }
    }

    /**
     * 创建新商品
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Product> createProduct(@RequestBody @Valid Product product) {
        try {
            Product createdProduct = productService.createProduct(product);
            return Result.success("创建商品成功", createdProduct);
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("创建商品失败", e);
            return Result.error("创建商品失败");
        }
    }

    /**
     * 更新商品信息（支持图片上传）
     */
    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Product> updateProductWithImages(
            @PathVariable("id") @NotNull Long id,
            @RequestPart("product") String productJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "imagesToDelete", required = false) String imagesToDeleteJson,
            @RequestParam(value = "newImageMainIndex", required = false) Integer newImageMainIndex) {
        try {
            // 解析 JSON 字符串为 Product 对象
            Product product = JSON.parseObject(productJson, Product.class);
            product.setId(id);

            // 获取图片删除列表
            List<String> imagesToDelete = new ArrayList<>();
            if (imagesToDeleteJson != null && !imagesToDeleteJson.trim().isEmpty()) {
                imagesToDelete = JSON.parseArray(imagesToDeleteJson, String.class);
            }

            // 如果有删除的图片，先从当前图片状态中移除
            if (!imagesToDelete.isEmpty()) {
                ProductImagesUtil.ProductImages productImages = ProductImagesUtil.ProductImages.fromJson(product.getImages());

                // 从当前图片结构中移除要删除的图片
                for (String imagePath : imagesToDelete) {
                    if (productImages.getMain() != null && productImages.getMain().equals(imagePath)) {
                        // 删除主图，提升第一张副图为主图
                        if (productImages.getSubImages().size() > 0) {
                            productImages.setMain(productImages.getSubImages().get(0));
                            productImages.getSubImages().remove(0);
                        } else {
                            productImages.setMain(null);
                        }
                    } else {
                        // 从副图中移除
                        productImages.getSubImages().remove(imagePath);
                    }

                    // 删除物理文件
                    try {
                        FileUploadUtil.deleteFile(imagePath, fileUploadConfig.getUploadPath());
                    } catch (Exception e) {
                        log.warn("删除物理文件失败: {}", imagePath, e);
                    }
                }

                product.setImages(productImages.toJson());
            }

            // 处理新图片上传
            if (images != null && !images.isEmpty()) {
                List<String> imagePaths = FileUploadUtil.uploadFiles(images, fileUploadConfig.getUploadPath());

                // 解析当前的图片结构（可能已经被删除操作修改过）
                ProductImagesUtil.ProductImages productImages = ProductImagesUtil.ProductImages.fromJson(product.getImages());

                // 如果有新图片被指定为主图，设置主图逻辑
                if (newImageMainIndex != null && newImageMainIndex >= 0 && newImageMainIndex < imagePaths.size()) {
                    String newMainImagePath = imagePaths.get(newImageMainIndex);
                    String oldMain = productImages.getMain();

                    // 直接设置新主图，不调用setMainImage方法（避免副图重新排列）
                    productImages.setMain(newMainImagePath);

                    // 手动处理旧主图：将其添加到副图开头（如果存在且不重复）
                    if (oldMain != null && !oldMain.isEmpty() && !oldMain.equals(newMainImagePath)) {
                        if (!productImages.getSubImages().contains(oldMain)) {
                            productImages.getSubImages().add(0, oldMain);
                        }
                    }

                    // 添加其他新图片到副图（不是主图的那些）
                    for (int i = 0; i < imagePaths.size(); i++) {
                        if (i != newImageMainIndex) {
                            productImages.getSubImages().add(imagePaths.get(i));
                        }
                    }
                } else {
                    // 没有指定新图片为主图，全部添加到副图
                    for (String imagePath : imagePaths) {
                        productImages.getSubImages().add(imagePath);
                    }
                }

                product.setImages(productImages.toJson());
            }

            Product updatedProduct = productService.updateProduct(product);
            return Result.success("更新商品成功", updatedProduct);
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("更新商品失败", e);
            return Result.error("更新商品失败: " + e.getMessage());
        }
    }

    /**
     * 更新商品信息（仅JSON，不含图片）
     */
    @PutMapping(value = "/{id}", consumes = { "application/json" })
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Product> updateProduct(
            @PathVariable("id") @NotNull Long id,
            @RequestBody @Valid Product product) {
        try {
            product.setId(id);
            Product updatedProduct = productService.updateProduct(product);
            return Result.success("更新商品成功", updatedProduct);
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("更新商品失败", e);
            return Result.error("更新商品失败");
        }
    }

    /**
     * 删除商品
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> deleteProduct(@PathVariable("id") @NotNull Long id) {
        try {
            boolean result = productService.deleteProduct(id);
            if (result) {
                return Result.success("删除商品成功");
            } else {
                return Result.error("删除商品失败");
            }
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("删除商品失败", e);
            return Result.error("删除商品失败");
        }
    }

    /**
     * 上架/下架商品
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> toggleProductStatus(
            @PathVariable("id") @NotNull Long id,
            @RequestParam @NotNull Integer status) {
        try {
            boolean result = productService.toggleProductStatus(id, status);
            if (result) {
                String statusText = status == 1 ? "上架" : "下架";
                return Result.success(statusText + "商品成功");
            } else {
                return Result.error("更新商品状态失败");
            }
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("更新商品状态失败", e);
            return Result.error("更新商品状态失败");
        }
    }

    /**
     * 设置推荐商品
     */
    @PutMapping("/{id}/featured")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> setFeaturedProduct(
            @PathVariable("id") @NotNull Long id,
            @RequestParam @NotNull Integer featured) {
        try {
            Product product = productService.getById(id);
            if (product == null) {
                return Result.error("商品不存在");
            }

            product.setFeatured(featured);
            boolean result = productService.updateById(product);

            if (result) {
                String featuredText = featured == 1 ? "设为推荐" : "取消推荐";
                return Result.success(featuredText + "成功");
            } else {
                return Result.error("更新推荐状态失败");
            }
        } catch (Exception e) {
            log.error("更新推荐状态失败", e);
            return Result.error("更新推荐状态失败");
        }
    }

    /**
     * 批量更新商品状态
     */
    @PutMapping("/batch-status")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> batchUpdateStatus(
            @RequestParam @NotNull List<Long> productIds,
            @RequestParam @NotNull Integer status) {
        try {
            boolean result = productService.batchUpdateStatus(productIds, status);
            if (result) {
                String statusText = status == 1 ? "上架" : "下架";
                return Result.success("批量" + statusText + "成功，共" + productIds.size() + "个商品");
            } else {
                return Result.error("批量更新状态失败");
            }
        } catch (Exception e) {
            log.error("批量更新商品状态失败", e);
            return Result.error("批量更新商品状态失败");
        }
    }

    /**
     * 检查商品名称是否重复
     */
    @GetMapping("/check-name")
    public Result<Boolean> checkNameDuplicate(
            @RequestParam @NotNull String name,
            @RequestParam(required = false) Long excludeId) {
        try {
            boolean isDuplicate = productService.isNameDuplicate(name.trim(), excludeId);
            return Result.success("检查完成", isDuplicate);
        } catch (Exception e) {
            log.error("检查商品名称重复失败", e);
            return Result.error("检查商品名称重复失败");
        }
    }

    /**
     * 获取推荐商品详情
     */
    @GetMapping("/recommended")
    public Result<List<Product>> getRecommendedProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "5") @Min(1) Integer limit) {
        try {
            List<Product> products = productService.getRecommendedProducts(categoryId, limit);
            return Result.success("获取推荐商品成功", products);
        } catch (Exception e) {
            log.error("获取推荐商品失败", e);
            return Result.error("获取推荐商品失败");
        }
    }

    /**
     * 检查商品库存是否充足
     */
    @GetMapping("/{id}/stock-check")
    public Result<Boolean> checkStockAvailable(
            @PathVariable("id") @NotNull Long id,
            @RequestParam @NotNull @Min(1) Integer quantity) {
        try {
            Product product = productService.getById(id);
            if (product == null) {
                return Result.error("商品不存在");
            }

            boolean isAvailable = product.getStockQuantity() != null &&
                    product.getStockQuantity() >= quantity;
            return Result.success("库存检查完成", isAvailable);
        } catch (Exception e) {
            log.error("检查商品库存失败", e);
            return Result.error("检查商品库存失败");
        }
    }

    /**
     * 获取库存不足商品列表
     */
    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<List<Product>> getLowStockProducts() {
        try {
            List<Product> products = productService.getLowStockProducts();
            return Result.success("获取库存不足商品成功", products);
        } catch (Exception e) {
            log.error("获取库存不足商品失败", e);
            return Result.error("获取库存不足商品失败");
        }
    }

    /**
     * 设置商品主图
     */
    @PutMapping("/{id}/main-image")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> setMainImage(
            @PathVariable("id") @NotNull Long id,
            @RequestParam @NotNull String mainImagePath) {
        try {
            Product product = productService.getById(id);
            if (product == null) {
                return Result.error("商品不存在");
            }

            // 解析现有的图片结构
            ProductImagesUtil.ProductImages productImages = ProductImagesUtil.ProductImages.fromJson(product.getImages());

            // 设置主图
            productImages.setMainImage(mainImagePath);

            product.setImages(productImages.toJson());
            boolean result = productService.updateById(product);

            if (result) {
                return Result.success("设置主图成功");
            } else {
                return Result.error("设置主图失败");
            }
        } catch (Exception e) {
            log.error("设置主图失败", e);
            return Result.error("设置主图失败: " + e.getMessage());
        }
    }

    /**
     * 删除商品图片
     */
    @DeleteMapping("/{id}/images")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> removeProductImage(
            @PathVariable("id") @NotNull Long id,
            @RequestParam @NotNull String imagePath) {
        try {
            Product product = productService.getById(id);
            if (product == null) {
                return Result.error("商品不存在");
            }

            // 解析现有的图片结构
            ProductImagesUtil.ProductImages productImages = ProductImagesUtil.ProductImages.fromJson(product.getImages());

            // 移除图片
            boolean removed = productImages.removeImage(imagePath);

            if (removed) {
                // 删除物理文件
                try {
                    FileUploadUtil.deleteFile(imagePath, fileUploadConfig.getUploadPath());
                } catch (Exception e) {
                    log.warn("删除物理文件失败: {}", imagePath, e);
                }

                // 检查是否还有图片
                if (productImages.getTotalCount() == 0) {
                    return Result.error("至少需要保留一张图片");
                }

                product.setImages(productImages.toJson());
                boolean result = productService.updateById(product);

                if (result) {
                    return Result.success("删除图片成功");
                } else {
                    return Result.error("删除图片失败");
                }
            } else {
                return Result.error("图片不存在");
            }
        } catch (Exception e) {
            log.error("删除图片失败", e);
            return Result.error("删除图片失败: " + e.getMessage());
        }
    }

    /**
     * 获取商品统计信息
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getProductStatistics() {
        try {
            Map<String, Object> statistics = productService.getProductStatistics();
            return Result.success("获取商品统计成功", statistics);
        } catch (Exception e) {
            log.error("获取商品统计失败", e);
            return Result.error("获取商品统计失败");
        }
    }

    /**
     * 创建示例商品数据
     */
    @PostMapping("/create-samples")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> createSampleProducts() {
        try {
            productService.createSampleProducts();
            return Result.success("创建示例商品成功");
        } catch (Exception e) {
            log.error("创建示例商品失败", e);
            return Result.error("创建示例商品失败");
        }
    }

    /**
     * 批量查询商品信息
     */
    @PostMapping("/batch")
    public Result<List<Product>> getProductsByIds(@RequestBody @NotNull List<Long> productIds) {
        try {
            if (productIds.isEmpty()) {
                return Result.success("查询成功", List.of());
            }

            List<Product> products = productService.getProductsByIds(productIds);
            return Result.success("批量查询商品成功", products);
        } catch (Exception e) {
            log.error("批量查询商品失败", e);
            return Result.error("批量查询商品失败");
        }
    }

    /**
     * 获取相关推荐商品
     */
    @GetMapping("/{id}/related")
    public Result<List<Product>> getRelatedProducts(
            @PathVariable("id") @NotNull Long id,
            @RequestParam(defaultValue = "5") @Min(1) Integer limit) {
        try {
            Product product = productService.getById(id);
            if (product == null) {
                return Result.error("商品不存在");
            }

            List<Product> relatedProducts = productService.getRecommendedProducts(
                    product.getCategoryId(), limit);

            // 排除当前商品
            List<Product> filteredProducts = relatedProducts.stream()
                    .filter(p -> !p.getId().equals(id))
                    .limit(limit)
                    .toList();

            return Result.success("获取相关商品成功", filteredProducts);
        } catch (Exception e) {
            log.error("获取相关商品失败", e);
            return Result.error("获取相关商品失败");
        }
    }
}