package com.flower.shop.controller;

import com.flower.shop.dto.LoginRequest;
import com.flower.shop.dto.LoginResponse;
import com.flower.shop.dto.Result;
import com.flower.shop.dto.UserRegisterRequest;
import com.flower.shop.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 普通用户认证控制器
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<String> register(@RequestBody @Validated UserRegisterRequest request) {
        try {
            userService.register(request);
            return Result.success("注册成功，请登录");
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("用户注册失败", e);
            return Result.error("注册失败，请稍后重试");
        }
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody @Validated LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return Result.success("登录成功", response);
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("用户登录失败", e);
            return Result.error("登录失败，请稍后重试");
        }
    }
}
