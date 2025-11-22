package com.flower.shop.util;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.annotation.JSONField;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

/**
 * 商品图片工具类
 * 处理主副图结构的转换和操作
 */
@Slf4j
public class ProductImagesUtil {

    /**
     * 图片结构类
     */
    public static class ProductImages {
        private String main;
        private List<String> subImages;

        public ProductImages() {
            this.subImages = new ArrayList<>();
        }

        public ProductImages(String main, List<String> subImages) {
            this.main = main;
            this.subImages = subImages != null ? subImages : new ArrayList<>();
        }

        public String getMain() {
            return main;
        }

        public void setMain(String main) {
            this.main = main;
        }

        public List<String> getSubImages() {
            return subImages;
        }

        public void setSubImages(List<String> subImages) {
            this.subImages = subImages;
        }

        /**
         * 获取所有图片（主图 + 副图）
         */
        @JSONField(serialize = false)
        public List<String> getAllImages() {
            List<String> allImages = new ArrayList<>();
            if (main != null && !main.isEmpty()) {
                allImages.add(main);
            }
            allImages.addAll(subImages);
            return allImages;
        }

        /**
         * 获取图片总数
         */
        @JSONField(serialize = false)
        public int getTotalCount() {
            return (main != null && !main.isEmpty() ? 1 : 0) + subImages.size();
        }

        /**
         * 设置主图
         * 简单的设置主图标识，不改变副图顺序
         */
        public void setMainImage(String image) {
            if (image == null || image.isEmpty()) {
                return;
            }

            String oldMain = this.main;
            this.main = image;

            // 如果旧主图不在副图中，需要将其添加到副图中
            if (oldMain != null && !oldMain.isEmpty() && !oldMain.equals(image) && !subImages.contains(oldMain)) {
                // 将旧主图添加到副图末尾，保持原有顺序
                subImages.add(oldMain);
            }

            // 从副图中移除新主图（避免重复）
            subImages.remove(image);
        }

        /**
         * 添加图片
         * 如果是第一张图片，设为主图；否则添加到副图
         */
        public void addImage(String image) {
            if (image == null || image.isEmpty()) {
                return;
            }

            if (main == null || main.isEmpty()) {
                // 第一张图片作为主图
                main = image;
            } else {
                // 添加到副图
                subImages.add(image);
            }
        }

        /**
         * 批量添加图片
         */
        public void addImages(List<String> images) {
            if (images == null || images.isEmpty()) {
                return;
            }

            for (String image : images) {
                addImage(image);
            }
        }

        /**
         * 移除图片
         */
        public boolean removeImage(String image) {
            if (image == null || image.isEmpty()) {
                return false;
            }

            boolean removed = false;

            // 检查是否是主图
            if (image.equals(main)) {
                if (!subImages.isEmpty()) {
                    // 将第一张副图提升为主图
                    main = subImages.remove(0);
                } else {
                    // 没有副图了，清空主图
                    main = null;
                }
                removed = true;
            } else {
                // 从副图中移除
                removed = subImages.remove(image);
            }

            return removed;
        }

        /**
         * 转换为JSON字符串
         */
        public String toJson() {
            return JSON.toJSONString(this);
        }

        /**
         * 从JSON字符串转换
         */
        public static ProductImages fromJson(String json) {
            if (json == null || json.trim().isEmpty()) {
                return new ProductImages();
            }

            try {
                // 尝试解析新的主副图格式
                JSONObject jsonObject = JSON.parseObject(json);
                ProductImages productImages = new ProductImages();

                String mainImage = jsonObject.getString("main");
                if (mainImage != null && !mainImage.trim().isEmpty()) {
                    productImages.setMain(mainImage);
                }

                List<String> subImages = jsonObject.getJSONArray("subImages") != null
                    ? jsonObject.getJSONArray("subImages").toJavaList(String.class)
                    : new ArrayList<>();
                productImages.setSubImages(subImages);

                return productImages;
            } catch (Exception e) {
                log.warn("解析图片JSON失败，尝试解析为数组格式: {}", json, e);

                try {
                    // 尝试解析旧的数组格式
                    List<String> imageList = JSON.parseArray(json, String.class);
                    ProductImages productImages = new ProductImages();
                    productImages.addImages(imageList);
                    return productImages;
                } catch (Exception ex) {
                    log.error("解析图片数组格式也失败: {}", json, ex);
                    return new ProductImages();
                }
            }
        }
    }
}