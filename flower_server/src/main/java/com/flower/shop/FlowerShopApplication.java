package com.flower.shop;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 【花言花语】鲜花售卖系统 - 启动类
 */
@SpringBootApplication
@MapperScan("com.flower.shop.mapper")
public class FlowerShopApplication {

    public static void main(String[] args) {
        SpringApplication.run(FlowerShopApplication.class, args);
        System.out.println("🌺 【花言花语】鲜花售卖系统启动成功！");
        System.out.println("📱 访问地址: http://localhost:8080/api");
    }
}