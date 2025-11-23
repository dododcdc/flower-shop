package com.flower.shop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.flower.shop.dto.ProductSearchRequest;
import com.flower.shop.entity.Product;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 商品服务接口
 *
 * 功能说明：
 * - 商品管理业务逻辑
 * - 商品搜索和筛选
 * - 商品状态管理
 */
public interface ProductService extends IService<Product> {

    
    /**
     * 搜索商品（多条件查询）
     */
    IPage<Product> searchProductsAdvanced(ProductSearchRequest request);

    
    /**
     * 创建新商品
     */
    Product createProduct(Product product);

    /**
     * 删除商品
     */
    boolean deleteProduct(Long productId);

    /**
     * 上架/下架商品
     */
    boolean toggleProductStatus(Long productId, Integer status);

    /**
     * 获取商品详情（包含分类和库存信息）
     */
    Product getProductWithDetails(Long productId);

    /**
     * 创建商品并保存图片信息
     */
    Product createProductWithImages(Product product, List<String> imagePaths, Integer mainImageIndex);

    /**
     * 更新商品并处理图片信息
     */
    Product updateProductWithImages(ProductUpdateRequest request);

    
    // ==================== 图片管理支持类 ====================

    /**
     * 商品更新请求类
     */
    @lombok.Data
    class ProductUpdateRequest {
        private Product product;
        private java.util.List<ExistingImageInfo> existingImages;
        private java.util.List<NewImageInfo> newImages;
    }

    /**
     * 现有图片信息类
     */
    @lombok.Data
    class ExistingImageInfo {
        private Long id;
        private String imagePath;
        private Integer imageType;    // 1-主图, 2-副图
        private Integer sortOrder;
        private Boolean isDeleted;    // 是否标记删除
    }

    /**
     * 新图片信息类
     */
    @lombok.Data
    class NewImageInfo {
        private org.springframework.web.multipart.MultipartFile imageFile;
        private Integer imageType;    // 1-主图, 2-副图
        private Integer sortOrder;
    }
}