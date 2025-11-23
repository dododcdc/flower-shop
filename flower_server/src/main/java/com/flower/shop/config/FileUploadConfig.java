package com.flower.shop.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 文件上传配置
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "flower-shop.upload")
public class FileUploadConfig {

    /**
     * 上传文件保存路径
     */
    private String uploadPath = "uploads/";

    /**
     * 允许的文件类型
     */
    private String allowedTypes = "jpg,jpeg,png,gif,webp";

    /**
     * 最大文件大小（字符串格式，如 "5MB"）
     */
    private String maxFileSize = "5MB";

    /**
     * 图片访问基础URL
     */
    private String baseUrl = "http://localhost:8080/api";
}
