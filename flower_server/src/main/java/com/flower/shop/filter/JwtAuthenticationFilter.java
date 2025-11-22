package com.flower.shop.filter;

import com.flower.shop.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT认证过滤器
 *
 * 功能说明：
 * - 从请求头中提取JWT Token
 * - 验证Token的有效性
 * - 将用户信息设置到Spring Security上下文中
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String TOKEN_HEADER = "Authorization";
    private static final String TOKEN_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {

        try {
            // 1. 从请求头中提取Token
            String token = extractTokenFromRequest(request);

            if (StringUtils.hasText(token)) {
                // 2. 验证Token并提取用户信息
                String username = JwtUtil.getUsernameFromToken(token);
                String role = JwtUtil.getRoleFromToken(token);

                // 3. 检查Token是否过期
                if (!JwtUtil.isTokenExpired(token)) {
                    // 4. 创建认证对象
                    List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_" + role.replace("ROLE_", ""))
                    );

                    UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);

                    // 5. 设置到Security上下文
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    log.debug("JWT认证成功，用户: {}, 角色: {}", username, role);
                } else {
                    log.warn("JWT Token已过期: {}", username);
                }
            }
        } catch (Exception e) {
            log.error("JWT认证失败", e);
            // 清理认证上下文
            SecurityContextHolder.clearContext();
        }

        // 继续过滤器链
        filterChain.doFilter(request, response);
    }

    /**
     * 从请求中提取JWT Token
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(TOKEN_HEADER);

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(TOKEN_PREFIX)) {
            return bearerToken.substring(TOKEN_PREFIX.length());
        }

        return null;
    }

    /**
     * 判断是否需要跳过JWT验证的路径
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();

        // 跳过这些路径的JWT验证
        return path.startsWith("/test/") ||
               path.startsWith("/admin/init/") ||
               path.equals("/admin/auth/login") ||
               path.startsWith("/static/") ||
               path.startsWith("/css/") ||
               path.startsWith("/js/") ||
               path.startsWith("/images/") ||
               path.equals("/error");
    }
}