package com.flower.shop.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.flower.shop.entity.Category;

import java.util.List;
import java.util.Map;

/**
 * 商品分类服务接口
 *
 * 功能说明：
 * - 分类管理业务逻辑
 * - 按类型查询（FLOWER/PACKAGING）
 * - 分类状态管理
 *
 * 设计说明：
 * - 扁平化分类结构，不支持树形层级
 * - 通过type字段区分花材和包装
 */
public interface CategoryService extends IService<Category> {

    /**
     * 创建新分类
     */
    boolean createCategory(Category category);

    /**
     * 更新分类信息
     */
    boolean updateCategory(Category category);

    /**
     * 删除分类（检查是否有关联商品）
     */
    boolean deleteCategory(Long categoryId);

    /**
     * 启用/禁用分类
     */
    boolean toggleCategoryStatus(Long categoryId);

    /**
     * 批量更新分类排序
     */
    boolean updateCategorySort(List<Map<String, Object>> sortData);

    /**
     * 根据名称查询分类
     */
    Category getByName(String name);

    /**
     * 检查分类名称是否重复
     *
     * @param name      分类名称
     * @param type      分类类型
     * @param excludeId 排除的ID（用于更新时检查）
     */
    boolean isNameDuplicate(String name, String type, Long excludeId);

    /**
     * 判断是否可以删除分类（检查是否有关联商品）
     */
    boolean canDeleteCategory(Long categoryId);
}