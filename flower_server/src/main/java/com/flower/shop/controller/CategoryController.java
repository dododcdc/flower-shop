package com.flower.shop.controller;

import com.flower.shop.common.Result;
import com.flower.shop.entity.Category;
import com.flower.shop.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

/**
 * 商品分类控制器
 *
 * 功能说明：
 * - 分类CRUD接口
 * - 按类型查询分类（FLOWER/PACKAGING）
 * - 分类状态管理
 *
 * 设计说明：
 * - 扁平化分类结构，不支持树形层级
 * - 通过type字段区分花材(FLOWER)和包装(PACKAGING)
 */
@Slf4j
@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@CrossOrigin
@Validated
@Tag(name = "分类管理", description = "商品分类管理接口")
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 获取所有分类列表
     */
    @GetMapping("/list")
    @Operation(summary = "获取所有分类", description = "获取所有分类列表")
    public Result<List<Category>> getAllCategories() {
        try {
            List<Category> categories = categoryService.list();
            return Result.success("获取分类列表成功", categories);
        } catch (Exception e) {
            log.error("获取分类列表失败", e);
            return Result.error("获取分类列表失败");
        }
    }

  
    
    
    /**
     * 根据ID获取分类详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取分类详情", description = "根据ID获取单个分类的详细信息")
    public Result<Category> getCategoryById(@PathVariable("id") @NotNull Long id) {
        try {
            Category category = categoryService.getById(id);
            if (category == null) {
                return Result.error("分类不存在");
            }
            return Result.success("获取分类详情成功", category);
        } catch (Exception e) {
            log.error("获取分类详情失败", e);
            return Result.error("获取分类详情失败");
        }
    }

    /**
     * 创建新分类
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "创建分类", description = "管理员：创建新的商品分类")
    public Result<String> createCategory(@RequestBody @Valid Category category) {
        try {
            boolean success = categoryService.createCategory(category);
            if (success) {
                return Result.success("创建分类成功");
            } else {
                return Result.error("创建分类失败");
            }
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("创建分类失败", e);
            return Result.error("创建分类失败");
        }
    }

    /**
     * 更新分类信息
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "更新分类", description = "管理员：更新分类信息")
    public Result<String> updateCategory(
            @PathVariable("id") @NotNull Long id,
            @RequestBody @Valid Category category) {
        try {
            category.setId(id);
            boolean success = categoryService.updateCategory(category);
            if (success) {
                return Result.success("更新分类成功");
            } else {
                return Result.error("更新分类失败");
            }
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("更新分类失败", e);
            return Result.error("更新分类失败");
        }
    }

    /**
     * 删除分类
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "删除分类", description = "管理员：删除指定分类")
    public Result<String> deleteCategory(@PathVariable("id") @NotNull Long id) {
        try {
            boolean result = categoryService.deleteCategory(id);
            if (result) {
                return Result.success("删除分类成功");
            } else {
                return Result.error("删除分类失败");
            }
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("删除分类失败", e);
            return Result.error("删除分类失败");
        }
    }

    /**
     * 启用/禁用分类
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "切换分类状态", description = "管理员：启用或禁用分类")
    public Result<String> toggleCategoryStatus(@PathVariable("id") @NotNull Long id) {
        try {
            boolean result = categoryService.toggleCategoryStatus(id);
            if (result) {
                return Result.success("切换分类状态成功");
            } else {
                return Result.error("切换分类状态失败");
            }
        } catch (IllegalArgumentException e) {
            return Result.validationError(e.getMessage());
        } catch (Exception e) {
            log.error("更新分类状态失败", e);
            return Result.error("更新分类状态失败");
        }
    }

    /**
     * 批量更新分类排序
     */
    @PutMapping("/sort")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "更新分类排序", description = "管理员：批量更新分类的排序")
    public Result<String> updateCategorySort(@RequestBody @Valid List<Map<String, Object>> sortData) {
        try {
            boolean result = categoryService.updateCategorySort(sortData);
            if (result) {
                return Result.success("更新分类排序成功");
            } else {
                return Result.error("更新分类排序失败");
            }
        } catch (Exception e) {
            log.error("更新分类排序失败", e);
            return Result.error("更新分类排序失败");
        }
    }

    }