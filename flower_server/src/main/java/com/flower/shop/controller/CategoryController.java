package com.flower.shop.controller;

import com.flower.shop.dto.Result;
import com.flower.shop.entity.Category;
import com.flower.shop.service.CategoryService;
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
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 获取所有分类列表
     */
    @GetMapping("/list")
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
     * 获取所有分类列表
     */
    @GetMapping
    public Result<List<Category>> getCategories(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer status) {
        try {
            List<Category> categories;

            if (type != null && status != null) {
                categories = categoryService.getCategoriesByTypeAndStatus(type, status);
            } else if (type != null) {
                categories = categoryService.getCategoriesByType(type);
            } else if (status != null) {
                categories = categoryService.getCategoriesByStatus(status);
            } else {
                categories = categoryService.list();
            }

            return Result.success("获取分类列表成功", categories);
        } catch (Exception e) {
            log.error("获取分类列表失败", e);
            return Result.error("获取分类列表失败");
        }
    }

    /**
     * 获取花材分类列表
     */
    @GetMapping("/flowers")
    public Result<List<Category>> getFlowerCategories() {
        try {
            List<Category> categories = categoryService.getFlowerCategories();
            return Result.success("获取花材分类成功", categories);
        } catch (Exception e) {
            log.error("获取花材分类失败", e);
            return Result.error("获取花材分类失败");
        }
    }

    /**
     * 获取包装分类列表
     */
    @GetMapping("/packaging")
    public Result<List<Category>> getPackagingCategories() {
        try {
            List<Category> categories = categoryService.getPackagingCategories();
            return Result.success("获取包装分类成功", categories);
        } catch (Exception e) {
            log.error("获取包装分类失败", e);
            return Result.error("获取包装分类失败");
        }
    }

    /**
     * 获取启用的分类列表
     */
    @GetMapping("/enabled")
    public Result<List<Category>> getEnabledCategories(
            @RequestParam(required = false) String type) {
        try {
            List<Category> categories;
            if (type != null) {
                categories = categoryService.getCategoriesByTypeAndStatus(type, 1);
            } else {
                categories = categoryService.getEnabledCategories();
            }
            return Result.success("获取启用分类成功", categories);
        } catch (Exception e) {
            log.error("获取启用分类失败", e);
            return Result.error("获取启用分类失败");
        }
    }

    /**
     * 分页查询分类列表
     */
    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getCategoryPage(
            @RequestParam(defaultValue = "1") @Min(1) Integer current,
            @RequestParam(defaultValue = "10") @Min(1) Integer size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer status) {
        try {
            List<Category> categories;

            if (name != null && !name.trim().isEmpty()) {
                Category category = categoryService.getByName(name.trim());
                categories = category != null ? List.of(category) : List.of();
            } else if (type != null && status != null) {
                categories = categoryService.getCategoriesByTypeAndStatus(type, status);
            } else if (type != null) {
                categories = categoryService.getCategoriesByType(type);
            } else if (status != null) {
                categories = categoryService.getCategoriesByStatus(status);
            } else {
                categories = categoryService.list();
            }

            Map<String, Object> result = Map.of(
                    "records", categories,
                    "total", categories.size(),
                    "current", current,
                    "size", size,
                    "pages", (categories.size() + size - 1) / size);

            return Result.success("获取分类列表成功", result);
        } catch (Exception e) {
            log.error("获取分类列表失败", e);
            return Result.error("获取分类列表失败");
        }
    }

    /**
     * 根据ID获取分类详情
     */
    @GetMapping("/{id}")
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

    /**
     * 根据名称查询分类
     */
    @GetMapping("/search")
    public Result<Category> getCategoryByName(@RequestParam @NotNull String name) {
        try {
            Category category = categoryService.getByName(name.trim());
            if (category == null) {
                return Result.error("未找到分类：" + name);
            }
            return Result.success("查询分类成功", category);
        } catch (Exception e) {
            log.error("查询分类失败", e);
            return Result.error("查询分类失败");
        }
    }

    /**
     * 检查分类名称是否重复
     */
    @GetMapping("/check-name")
    public Result<Boolean> checkNameDuplicate(
            @RequestParam @NotNull String name,
            @RequestParam @NotNull String type,
            @RequestParam(required = false) Long excludeId) {
        try {
            boolean isDuplicate = categoryService.isNameDuplicate(name.trim(), type, excludeId);
            return Result.success("检查完成", isDuplicate);
        } catch (Exception e) {
            log.error("检查分类名称重复失败", e);
            return Result.error("检查分类名称重复失败");
        }
    }

    /**
     * 获取分类统计信息
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getCategoryStatistics() {
        try {
            int totalCategories = categoryService.countCategories();
            int flowerCategories = categoryService.countFlowerCategories();
            int packagingCategories = categoryService.countPackagingCategories();
            int enabledCategories = categoryService.getEnabledCategories().size();

            Map<String, Object> statistics = Map.of(
                    "totalCategories", totalCategories,
                    "enabledCategories", enabledCategories,
                    "flowerCategories", flowerCategories,
                    "packagingCategories", packagingCategories);

            return Result.success("获取分类统计成功", statistics);
        } catch (Exception e) {
            log.error("获取分类统计失败", e);
            return Result.error("获取分类统计失败");
        }
    }

    /**
     * 初始化默认分类数据
     */
    @PostMapping("/init")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> initDefaultCategories() {
        try {
            categoryService.initDefaultCategories();
            return Result.success("初始化默认分类成功");
        } catch (Exception e) {
            log.error("初始化默认分类失败", e);
            return Result.error("初始化默认分类失败");
        }
    }
}