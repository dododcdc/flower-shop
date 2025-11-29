package com.flower.shop.config;

import com.flower.shop.filter.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Spring Security 配置
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 启用CORS - 直接内联配置，避免Bean冲突
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 禁用CSRF
                .csrf(AbstractHttpConfigurer::disable)
                // 配置请求授权
                .authorizeHttpRequests(auth -> auth
                        // 允许测试接口无需认证访问
                        .requestMatchers("/test/**").permitAll()
                        // 允许管理员初始化和登录接口无需认证访问
                        .requestMatchers("/admin/init/**").permitAll()
                        .requestMatchers("/admin/auth/login").permitAll()
                        // 允许游客端商品接口无需认证访问
                        .requestMatchers("/products/**").permitAll()
                        .requestMatchers("/categories/**").permitAll()
                        // 允许游客端订单接口无需认证访问（游客下单）
                        .requestMatchers("/orders/**").permitAll()
                        // 允许静态资源访问
                        .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**", "/uploads/**").permitAll()
                        // 允许错误页面访问
                        .requestMatchers("/error").permitAll()
                        // 其他所有请求都需要认证
                        .anyRequest().authenticated())
                // 添加JWT认证过滤器
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * 内联CORS配置，避免Bean冲突
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}