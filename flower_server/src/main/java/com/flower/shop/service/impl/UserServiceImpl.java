package com.flower.shop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.flower.shop.dto.LoginRequest;
import com.flower.shop.dto.LoginResponse;
import com.flower.shop.dto.UserRegisterRequest;
import com.flower.shop.entity.User;
import com.flower.shop.mapper.UserMapper;
import com.flower.shop.service.UserService;
import com.flower.shop.util.JwtUtil;
import com.flower.shop.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 普通用户服务实现类
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long register(UserRegisterRequest request) {
        // 1. 校验确认密码
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("两次输入的密码不一致");
        }

        // 2. 校验用户名是否已存在
        QueryWrapper<User> usernameWrapper = new QueryWrapper<>();
        usernameWrapper.eq("username", request.getUsername());
        if (userMapper.selectCount(usernameWrapper) > 0) {
            throw new IllegalArgumentException("用户名已存在");
        }

        // 3. 校验手机号是否已存在
        QueryWrapper<User> phoneWrapper = new QueryWrapper<>();
        phoneWrapper.eq("phone", request.getPhone());
        if (userMapper.selectCount(phoneWrapper) > 0) {
            throw new IllegalArgumentException("该手机号已被注册");
        }

        // 4. 创建用户
        User user = new User();
        user.setUsername(request.getUsername())
                .setPassword(PasswordUtil.encode(request.getPassword()))
                .setPhone(request.getPhone())
                .setEmail(request.getEmail())
                .setRole("ROLE_CUSTOMER") // 普通用户角色
                .setIsActive(true) // 默认启用
                .setLastLogin(null); // 尚未登录

        userMapper.insert(user);
        return user.getId();
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // 1. 根据用户名查找用户
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", request.getUsername());
        // 注意：这里不限制角色，但通常前台入口只允许 CUSTOMER 登录，这里可以根据业务需求加校验
        // 为了灵活性，我们暂时只校验状态
        queryWrapper.eq("is_active", true);

        User user = userMapper.selectOne(queryWrapper);
        if (user == null) {
            throw new IllegalArgumentException("用户名或密码错误");
        }

        // 2. 校验密码
        if (!PasswordUtil.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("用户名或密码错误");
        }

        // 3. 校验角色 (可选：如果你希望前台只能登录普通用户)
        // if (!"ROLE_CUSTOMER".equals(user.getRole())) {
        // throw new IllegalArgumentException("请通过管理员后台登录");
        // }

        // 4. 更新最后登录时间
        user.setLastLogin(LocalDateTime.now());
        userMapper.updateById(user);

        // 5. 生成 Token
        String token = JwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole());

        // 6. 构建响应
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setRole(user.getRole());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        if (user.getLastLogin() != null) {
            response.setLastLogin(user.getLastLogin().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        } else {
            response.setLastLogin("首次登录");
        }

        return response;
    }

    @Override
    public User getById(Long id) {
        return userMapper.selectById(id);
    }
}
