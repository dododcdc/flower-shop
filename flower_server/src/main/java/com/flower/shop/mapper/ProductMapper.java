package com.flower.shop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.flower.shop.dto.ProductSearchRequest;
import com.flower.shop.entity.Product;
import lombok.Data;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 商品Mapper接口
 *
 * 功能说明：
 * - 商品CRUD操作
 * - 多条件查询和筛选
 * - 关联分类查询
 */
@Mapper
public interface ProductMapper extends BaseMapper<Product> {

    /**
     * 检查商品名称是否存在
     */
    @Select("SELECT COUNT(*) FROM products WHERE name = #{name} AND id != #{excludeId}")
    int countByNameExcludeId(@Param("name") String name, @Param("excludeId") Long excludeId);

    /**
     * 多条件动态搜索商品（分页）- 优化版本，包含主图信息
     */
    IPage<Product> searchProductsWithMainImage(Page<Product> page, @Param("request") ProductSearchRequest request);

    /**
     * 查询商品的所有图片详情（包含完整信息）
     */
    @Select("SELECT id, image_path, image_type, sort_order FROM product_images " +
            "WHERE product_id = #{productId} ORDER BY image_type ASC, sort_order ASC, id ASC")
    List<ProductImageInfo> selectProductImagesWithDetails(@Param("productId") Long productId);

    /**
     * 查询商品的图片详情内部类
     */
    @Data
    class ProductImageInfo {
        private Long id;
        private String imagePath;
        private Integer imageType;
        private Integer sortOrder;
    }
}