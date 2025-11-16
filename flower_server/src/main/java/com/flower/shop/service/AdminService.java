package com.flower.shop.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.flower.shop.dto.AdminInitRequest;
import com.flower.shop.dto.LoginRequest;
import com.flower.shop.dto.LoginResponse;
import com.flower.shop.entity.User;
import com.flower.shop.mapper.UserMapper;
import com.flower.shop.util.JwtUtil;
import com.flower.shop.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 管理员服务
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserMapper userMapper;

    /**
     * 检查系统是否已初始化（是否有管理员）
     */
    public boolean isSystemInitialized() {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("role", "ADMIN");
        queryWrapper.eq("is_active", true);

        Long count = userMapper.selectCount(queryWrapper);
        return count > 0;
    }

    /**
     * 初始化管理员
     */
    public void initializeAdmin(AdminInitRequest request) {
        // 验证两次密码是否一致
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("两次输入的密码不一致");
        }

        // 检查用户名是否已存在
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", request.getUsername());
        User existingUser = userMapper.selectOne(queryWrapper);
        if (existingUser != null) {
            throw new IllegalArgumentException("用户名已存在");
        }

        // 创建管理员用户
        User admin = new User();
        admin.setUsername(request.getUsername())
              .setPassword(PasswordUtil.encode(request.getPassword()))
              .setEmail(request.getEmail())
              .setPhone(request.getPhone())
              .setRole("ADMIN")
              .setIsActive(true)
              .setLastLogin(LocalDateTime.now());

        userMapper.insert(admin);
    }

    /**
     * 管理员登录
     */
    public LoginResponse login(LoginRequest request) {
        // 查找用户
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", request.getUsername());
        queryWrapper.eq("is_active", true);

        User user = userMapper.selectOne(queryWrapper);
        if (user == null) {
            throw new IllegalArgumentException("用户名或密码错误");
        }

        // 验证密码
        if (!PasswordUtil.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("用户名或密码错误");
        }

        // 检查角色
        if (!"ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("无权限访问管理员系统");
        }

        // 更新最后登录时间
        user.setLastLogin(LocalDateTime.now());
        userMapper.updateById(user);

        // 生成JWT Token
        String token = JwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole());

        // 构建响应
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setRole(user.getRole());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setLastLogin(user.getLastLogin().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        return response;
    }

    /**
     * 根据用户名查找用户
     */
    public User findByUsername(String username) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        queryWrapper.eq("is_active", true);
        return userMapper.selectOne(queryWrapper);
    }
}