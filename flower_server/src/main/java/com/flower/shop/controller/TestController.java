package com.flower.shop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * 测试控制器
 */
@RestController
@RequestMapping("/test")
public class TestController {

    @Autowired
    private DataSource dataSource;

    /**
     * 健康检查接口
     */
    @GetMapping("/health")
    public String health() {
        return "🌺 【花言花语】系统运行正常！";
    }

    /**
     * 数据库连接测试接口
     */
    @GetMapping("/db")
    public String testDatabase() {
        try {
            Connection connection = dataSource.getConnection();
            String databaseInfo = connection.getMetaData().getDatabaseProductName() +
                                " " + connection.getMetaData().getDatabaseProductVersion();
            connection.close();
            return "✅ 数据库连接成功！\n数据库: " + databaseInfo;
        } catch (SQLException e) {
            return "❌ 数据库连接失败: " + e.getMessage();
        }
    }

    /**
     * 系统信息接口
     */
    @GetMapping("/info")
    public String systemInfo() {
        return """
            🌺 【花言花语】鲜花售卖系统信息:
            📝 Java版本: %s
            🗄️ 数据库: MySQL flower_shop
            🚀 框架: Spring Boot 3.2.0 + MyBatis-Plus 3.5.5
            👤 管理员账号: admin / admin123
            📱 API地址: http://localhost:8080/api
            """.formatted(
                System.getProperty("java.version"),
                System.getProperty("java.home")
            );
    }
}