package com.flower.shop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 配置
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 禁用CSRF
            .csrf(AbstractHttpConfigurer::disable)
            // 配置请求授权
            .authorizeHttpRequests(auth -> auth
                // 允许测试接口无需认证访问
                .requestMatchers("/test/**").permitAll()
                // 允许静态资源访问
                .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**").permitAll()
                // 允许错误页面访问
                .requestMatchers("/error").permitAll()
                // 其他所有请求都需要认证
                .anyRequest().authenticated()
            );

        return http.build();
    }
}