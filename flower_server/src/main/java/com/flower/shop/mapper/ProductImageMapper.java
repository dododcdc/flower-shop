package com.flower.shop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.flower.shop.entity.ProductImage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 商品图片Mapper接口
 */
@Mapper
public interface ProductImageMapper extends BaseMapper<ProductImage> {

    /**
     * 根据商品ID获取图片列表
     * @param productId 商品ID
     * @return 图片列表
     */
    List<ProductImage> selectByProductId(@Param("productId") Long productId);

    /**
     * 根据商品ID删除所有图片
     * @param productId 商品ID
     * @return 删除记录数
     */
    int deleteByProductId(@Param("productId") Long productId);

    /**
     * 获取商品的主图
     * @param productId 商品ID
     * @return 主图路径
     */
    ProductImage selectMainImage(@Param("productId") Long productId);

    /**
     * 设置商品主图
     * @param productId 商品ID
     * @param imagePath 图片路径
     * @return 更新记录数
     */
    int setMainImage(@Param("productId") Long productId, @Param("imagePath") String imagePath);

    /**
     * 获取商品的所有主图（用于验证主图唯一性）
     * @param productId 商品ID
     * @return 主图列表
     */
    List<ProductImage> selectMainImages(@Param("productId") Long productId);
}