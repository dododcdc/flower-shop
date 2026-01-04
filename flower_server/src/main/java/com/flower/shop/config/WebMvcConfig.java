package com.flower.shop.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Web MVC 配置
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final FileUploadConfig fileUploadConfig;

    /**
     * 配置静态资源访问
     * 将 /uploads/** 映射到本地 uploads/ 目录
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 确保使用绝对路径
        String uploadPath = fileUploadConfig.getUploadPath();
        Path path = Paths.get(uploadPath);
        String absolutePath = path.isAbsolute() ? uploadPath : path.toAbsolutePath().toString();

        System.out.println("📁 静态资源映射: /uploads/** -> file:" + absolutePath);

        // 配置上传文件的访问路径
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absolutePath + "/");
    }

    /**
     * 配置跨域
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
