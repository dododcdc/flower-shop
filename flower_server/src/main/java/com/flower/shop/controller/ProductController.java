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
import java.util.ArrayList;
import java.util.List;

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
     * 根据ID获取商品详情
     */
    @GetMapping("/{id}")
    public Result<Product> getProductById(@PathVariable("id") @NotNull Long id) {
        try {
            Product product = productService.getProductWithDetails(id);
            if (product == null) {
                return Result.error("商品不存在");
            }

            return Result.success("获取商品详情成功", product);
        } catch (Exception e) {
            log.error("获取商品详情失败", e);
            return Result.error("获取商品详情失败");
        }
    }

    /**
     * 创建新商品（支持图片上传）
     */
    @PostMapping(consumes = { "multipart/form-data" }, produces = { "application/json" })
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Product> createProductWithImages(
            @RequestPart("product") String productJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "newImageMainIndex", required = false) Integer newImageMainIndex) {
        try {
            // 解析JSON字符串为Product对象
            Product product = JSON.parseObject(productJson, Product.class);

            // 处理图片上传
            if (images != null && !images.isEmpty()) {
                List<String> imagePaths = FileUploadUtil.uploadFiles(images, fileUploadConfig.getUploadPath());

                // 设置图片结构
                ProductImagesUtil.ProductImages productImages = new ProductImagesUtil.ProductImages();

                // 根据主图索引设置主图
                int mainIndex = (newImageMainIndex != null && newImageMainIndex >= 0 && newImageMainIndex < imagePaths.size())
                    ? newImageMainIndex : 0;

                productImages.setMain(imagePaths.get(mainIndex));

                // 添加副图（除了主图之外的图片）
                for (int i = 0; i < imagePaths.size(); i++) {
                    if (i != mainIndex) {
                        productImages.getSubImages().add(imagePaths.get(i));
                    }
                }

                product.setImages(productImages.toJson());
            }

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
}