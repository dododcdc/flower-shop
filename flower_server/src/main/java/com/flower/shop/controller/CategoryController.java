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
 * - 分类树结构查询
 * - 分类状态管理
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
     * 获取分类树结构（所有分类）
     */
    @GetMapping("/tree")
    public Result<List<Map<String, Object>>> getCategoryTree() {
        try {
            List<Map<String, Object>> categoryTree = categoryService.getCategoryTree();
            return Result.success("获取分类树成功", categoryTree);
        } catch (Exception e) {
            log.error("获取分类树失败", e);
            return Result.error("获取分类树失败");
        }
    }

    /**
     * 获取启用的分类树结构
     */
    @GetMapping("/tree/enabled")
    public Result<List<Map<String, Object>>> getEnabledCategoryTree() {
        try {
            List<Map<String, Object>> categoryTree = categoryService.getEnabledCategoryTree();
            return Result.success("获取启用分类树成功", categoryTree);
        } catch (Exception e) {
            log.error("获取启用分类树失败", e);
            return Result.error("获取启用分类树失败");
        }
    }

    /**
     * 获取所有顶级分类（花材类型）
     */
    @GetMapping("/top-level")
    public Result<List<Category>> getTopLevelCategories() {
        try {
            List<Category> categories = categoryService.getTopLevelCategories();
            return Result.success("获取顶级分类成功", categories);
        } catch (Exception e) {
            log.error("获取顶级分类失败", e);
            return Result.error("获取顶级分类失败");
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
     * 获取指定父分类下的子分类
     */
    @GetMapping("/{parentId}/children")
    public Result<List<Category>> getSubCategories(@PathVariable @NotNull Long parentId) {
        try {
            List<Category> categories = categoryService.getSubCategoriesByParentId(parentId);
            return Result.success("获取子分类成功", categories);
        } catch (Exception e) {
            log.error("获取子分类失败", e);
            return Result.error("获取子分类失败");
        }
    }

    /**
     * 根据花材分类获取包装分类
     */
    @GetMapping("/{flowerCategoryId}/packaging")
    public Result<List<Category>> getPackagingByFlowerCategory(@PathVariable @NotNull Long flowerCategoryId) {
        try {
            List<Category> categories = categoryService.getPackagingByFlowerCategory(flowerCategoryId);
            return Result.success("获取包装分类成功", categories);
        } catch (Exception e) {
            log.error("获取包装分类失败", e);
            return Result.error("获取包装分类失败");
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
            @RequestParam(required = false) Integer status) {
        try {
            // 这里简化处理，实际应该使用分页查询
            List<Category> categories;
            if (name != null && !name.trim().isEmpty()) {
                Category category = categoryService.getByName(name.trim());
                categories = category != null ? List.of(category) : List.of();
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
                "pages", (categories.size() + size - 1) / size
            );

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
    public Result<Category> getCategoryById(@PathVariable @NotNull Long id) {
        try {
            Category category = categoryService.getCategoryWithDetails(id);
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
    public Result<Category> createCategory(@RequestBody @Valid Category category) {
        try {
            Category createdCategory = categoryService.createCategory(category);
            return Result.success("创建分类成功", createdCategory);
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
    public Result<Category> updateCategory(
            @PathVariable @NotNull Long id,
            @RequestBody @Valid Category category) {
        try {
            category.setId(id);
            Category updatedCategory = categoryService.updateCategory(category);
            return Result.success("更新分类成功", updatedCategory);
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
    public Result<String> deleteCategory(@PathVariable @NotNull Long id) {
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
    public Result<String> toggleCategoryStatus(
            @PathVariable @NotNull Long id,
            @RequestParam @NotNull Integer status) {
        try {
            boolean result = categoryService.toggleCategoryStatus(id, status);
            if (result) {
                String statusText = status == 1 ? "启用" : "禁用";
                return Result.success(statusText + "分类成功");
            } else {
                return Result.error("更新分类状态失败");
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
            @RequestParam(required = false) Long excludeId) {
        try {
            boolean isDuplicate = categoryService.isNameDuplicate(name.trim(), excludeId);
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
            List<Category> allCategories = categoryService.list();
            List<Category> enabledCategories = categoryService.getEnabledCategories();
            List<Category> topLevelCategories = categoryService.getTopLevelCategories();

            Map<String, Object> statistics = Map.of(
                "totalCategories", allCategories.size(),
                "enabledCategories", enabledCategories.size(),
                "topLevelCategories", topLevelCategories.size(),
                "subCategories", allCategories.size() - topLevelCategories.size()
            );

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
    public Result<List<Category>> getEnabledCategories() {
        try {
            List<Category> categories = categoryService.getEnabledCategories();
            return Result.success("获取启用分类成功", categories);
        } catch (Exception e) {
            log.error("获取启用分类失败", e);
            return Result.error("获取启用分类失败");
        }
    }
}