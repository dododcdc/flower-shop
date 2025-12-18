package com.flower.shop.service;

import com.flower.shop.dto.LoginRequest;
import com.flower.shop.dto.LoginResponse;
import com.flower.shop.dto.UserRegisterRequest;
import com.flower.shop.entity.User;

/**
 * 普通用户服务接口
 */
public interface UserService {

    /**
     * 用户注册
     * 
     * @param request 注册请求参数
     */
    void register(UserRegisterRequest request);

    /**
     * 用户登录
     * 
     * @param request 登录请求参数
     * @return 登录响应（包含Token和用户信息）
     */
    LoginResponse login(LoginRequest request);

    /**
     * 根据ID获取用户
     * 
     * @param id 用户ID
     * @return 用户实体
     */
    User getById(Long id);
}
