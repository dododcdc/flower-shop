package com.flower.shop.controller;

import com.flower.shop.dto.AdminInitRequest;
import com.flower.shop.dto.LoginRequest;
import com.flower.shop.dto.LoginResponse;
import com.flower.shop.common.Result;
import com.flower.shop.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员控制器
 */
@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "管理员管理", description = "管理员初始化和登录接口")
public class AdminController {

    private final AdminService adminService;



    /**
     * 检查系统是否已初始化
     */
    @GetMapping("/init/check")
    @Operation(summary = "检查系统初始化状态", description = "检查系统是否已创建管理员账号")
    public Result<Boolean> checkInitialization() {
        try {
            boolean isInitialized = adminService.isSystemInitialized();
            return Result.success("检查完成", isInitialized);
        } catch (Exception e) {
            log.error("检查系统初始化状态失败", e);
            return Result.error("检查系统初始化状态失败");
        }
    }

    /**
     * 初始化管理员
     */
    @PostMapping("/init/setup")
    @Operation(summary = "初始化管理员", description = "首次使用时创建管理员账号")
    public Result<String> initializeAdmin(@RequestBody @Validated AdminInitRequest request) {
        try {
            // 检查系统是否已经初始化
            if (adminService.isSystemInitialized()) {
                return Result.error("系统已经初始化，请直接登录");
            }

            adminService.initializeAdmin(request);
            return Result.success("管理员初始化成功");
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("初始化管理员失败", e);
            return Result.error("初始化管理员失败，请稍后重试");
        }
    }

    /**
     * 管理员登录
     */
    @PostMapping("/auth/login")
    @Operation(summary = "管理员登录", description = "管理员登录，返回JWT Token")
    public Result<LoginResponse> login(@RequestBody @Validated LoginRequest request) {
        try {
            LoginResponse response = adminService.login(request);
            return Result.success("登录成功", response);
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("管理员登录失败", e);
            return Result.error("登录失败，请稍后重试");
        }
    }

  }