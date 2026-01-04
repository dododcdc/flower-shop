package com.flower.shop.service;

import com.flower.shop.dto.ImageDetailResult;
import com.flower.shop.entity.Product;
import com.flower.shop.entity.ProductImage;
import com.flower.shop.mapper.ProductImageMapper;
import com.flower.shop.mapper.ProductMapper;
import com.flower.shop.config.FileUploadConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 商品图片服务
 * 负责处理商品图片相关的业务逻辑
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductImageService {

    private final ProductImageMapper productImageMapper;
    private final ProductMapper productMapper;
    private final FileUploadConfig fileUploadConfig;

    /**
     * 获取商品完整图片信息
     * @param productId 商品ID
     * @return 图片详情结果
     */
    public ImageDetailResult getProductImageDetails(Long productId) {
        log.debug("获取商品图片详情，商品ID: {}", productId);

        List<ProductMapper.ProductImageInfo> imageInfos =
            productMapper.selectProductImagesWithDetails(productId);

        return ImageDetailResult.builder()
            .imagePaths(extractImagePaths(imageInfos))
            .imageDetails(convertToImageDetails(imageInfos))
            .mainImagePath(findMainImagePath(productId, imageInfos))
            .build();
    }

    /**
     * 提取图片路径列表
     */
    private List<String> extractImagePaths(List<ProductMapper.ProductImageInfo> imageInfos) {
        return imageInfos.stream()
            .filter(Objects::nonNull)
            .map(ProductMapper.ProductImageInfo::getImagePath)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    /**
     * 转换为详细图片信息
     */
    private List<Product.ProductImageDetail> convertToImageDetails(
            List<ProductMapper.ProductImageInfo> imageInfos) {
        return imageInfos.stream()
            .filter(Objects::nonNull)
            .map(info -> {
                Product.ProductImageDetail detail = new Product.ProductImageDetail();
                detail.setId(info.getId());
                detail.setImagePath(info.getImagePath());
                detail.setImageType(info.getImageType());
                detail.setSortOrder(info.getSortOrder());
                // 直接使用相对路径，由前端根据环境拼接完整URL
                detail.setImageUrl(info.getImagePath());
                return detail;
            })
            .collect(Collectors.toList());
    }

    /**
     * 查找主图路径
     */
    private String findMainImagePath(Long productId,
                                   List<ProductMapper.ProductImageInfo> imageInfos) {
        // 首先尝试从数据库查询主图
        ProductImage mainImage = productImageMapper.selectMainImage(productId);
        if (mainImage != null) {
            return mainImage.getImagePath();
        }

        // 如果没有主图，使用第一张图片
        return imageInfos.isEmpty() ? null : imageInfos.get(0).getImagePath();
    }

    }