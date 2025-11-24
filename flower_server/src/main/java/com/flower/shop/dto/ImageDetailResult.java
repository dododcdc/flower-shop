package com.flower.shop.dto;

import com.flower.shop.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 商品图片详情结果
 * 封装商品图片相关的查询结果
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ImageDetailResult {

    /**
     * 图片路径列表
     */
    private List<String> imagePaths;

    /**
     * 详细图片信息列表
     */
    private List<Product.ProductImageDetail> imageDetails;

    /**
     * 主图路径
     */
    private String mainImagePath;
}