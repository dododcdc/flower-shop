package com.flower.shop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.flower.shop.common.Result;
import com.flower.shop.dto.ProductSearchRequest;
import com.flower.shop.entity.Product;
import com.flower.shop.service.ProductService;
import com.flower.shop.service.impl.ProductServiceImpl;
import com.flower.shop.config.FileUploadConfig;
import com.flower.shop.util.FileUploadUtil;
import com.alibaba.fastjson.JSON;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Validated
@Tag(name = "商品管理", description = "商品CRUD和搜索接口")
public class ProductController {

    private final ProductService productService;
    private final FileUploadConfig fileUploadConfig;

    /**
     * 搜索商品（支持多条件查询）
     */
    @PostMapping("/search")
    @Operation(summary = "搜索商品", description = "按分类、价格、关键词等条件搜索商品，支持分页")
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
    @Operation(summary = "获取商品详情", description = "根据ID获取商品详情，包含图片信息")
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
     * 创建新商品（必须包含图片）
     */
    @PostMapping(consumes = { "multipart/form-data" }, produces = { "application/json" })
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "创建商品", description = "管理员：创建新商品，必须上传至少一张图片")
    public Result<Product> createProduct(
            @RequestPart("product") String productJson,
            @RequestPart(value = "images") List<MultipartFile> images,
            @RequestParam(value = "mainImageIndex") Integer mainImageIndex) {
        try {
            // 验证必须提供图片
            if (images == null || images.isEmpty()) {
                return Result.validationError("创建商品必须至少上传一张图片");
            }

            // 验证主图索引有效性（数组索引）
            if (mainImageIndex < 0 || mainImageIndex >= images.size()) {
                return Result.validationError("主图索引无效：" + mainImageIndex + "，图片总数：" + images.size());
            }

            // 解析JSON字符串为Product对象
            Product product = JSON.parseObject(productJson, Product.class);

            // 处理图片上传
            List<String> imagePaths = FileUploadUtil.uploadFiles(images, fileUploadConfig.getUploadPath());

            Product createdProduct = productService.createProductWithImages(product, imagePaths, mainImageIndex);
            return Result.success("创建商品成功", createdProduct);
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("创建商品失败", e);
            return Result.error("创建商品失败");
        }
    }

    /**
     * 更新商品信息（支持图片管理）
     */
    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "更新商品", description = "管理员：更新商品信息和图片")
    public Result<Product> updateProductWithImages(
            @PathVariable("id") @NotNull Long id,
            @RequestPart("product") String productJson,
            @RequestPart(value = "existingImages", required = false) String existingImagesJson,
            @RequestPart(value = "newImages", required = false) String newImagesJson,
            @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles) {
        try {
            // 解析商品基本信息
            Product product = JSON.parseObject(productJson, Product.class);
            product.setId(id);

            // 构建更新请求
            ProductServiceImpl.ProductUpdateRequest request = new ProductServiceImpl.ProductUpdateRequest();
            request.setProduct(product);

            // 解析现有图片信息
            if (existingImagesJson != null && !existingImagesJson.trim().isEmpty()) {
                List<ProductServiceImpl.ExistingImageInfo> existingImages = JSON.parseArray(
                    existingImagesJson, ProductServiceImpl.ExistingImageInfo.class);
                request.setExistingImages(existingImages);
            }

            // 解析新图片信息
            if (newImagesJson != null && !newImagesJson.trim().isEmpty() && imageFiles != null) {
                List<ProductService.NewImageInfo> newImages = JSON.parseArray(
                    newImagesJson, ProductService.NewImageInfo.class);

                // 验证文件数量匹配
                if (newImages.size() != imageFiles.size()) {
                    throw new IllegalArgumentException("新图片信息数量与文件数量不匹配");
                }

                // 将文件与新图片信息关联（按顺序对应）
                for (int i = 0; i < newImages.size(); i++) {
                    newImages.get(i).setImageFile(imageFiles.get(i));
                }
                request.setNewImages(newImages);
            }

            // 调用服务更新商品
            Product updatedProduct = productService.updateProductWithImages(request);
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
    @Operation(summary = "删除商品", description = "管理员：删除指定商品")
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
    @Operation(summary = "切换商品状态", description = "管理员：上架或下架商品")
    public Result<String> toggleProductStatus(
            @PathVariable("id") @NotNull Long id,
            @RequestParam("status") @NotNull Integer status) {
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
    @Operation(summary = "设置推荐商品", description = "管理员：设置或取消商品推荐状态")
    public Result<String> setFeaturedProduct(
            @PathVariable("id") @NotNull Long id,
            @RequestParam("featured") @NotNull Integer featured) {
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