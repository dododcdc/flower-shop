package com.flower.shop.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.flower.shop.entity.Category;
import com.flower.shop.mapper.CategoryMapper;

import java.util.List;
import java.util.Map;

/**
 * 商品分类服务接口
 *
 * 功能说明：
 * - 分类管理业务逻辑
 * - 层级分类处理
 * - 分类状态管理
 */
public interface CategoryService extends IService<Category> {

    /**
     * 获取所有顶级分类（花材类型）
     */
    List<Category> getTopLevelCategories();

    /**
     * 获取指定父分类下的子分类（包装类型）
     */
    List<Category> getSubCategoriesByParentId(Long parentId);

    /**
     * 获取所有启用的分类
     */
    List<Category> getEnabledCategories();

    /**
     * 获取完整的分类树结构
     */
    List<Map<String, Object>> getCategoryTree();

    /**
     * 获取启用的分类树结构
     */
    List<Map<String, Object>> getEnabledCategoryTree();

    /**
     * 创建新分类
     */
    Category createCategory(Category category);

    /**
     * 更新分类信息
     */
    Category updateCategory(Category category);

    /**
     * 删除分类（检查是否有子分类或关联商品）
     */
    boolean deleteCategory(Long categoryId);

    /**
     * 启用/禁用分类
     */
    boolean toggleCategoryStatus(Long categoryId, Integer status);

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
     */
    boolean isNameDuplicate(String name, Long excludeId);

    /**
     * 获取分类详情（包含父分类信息）
     */
    Category getCategoryWithDetails(Long categoryId);

    /**
     * 获取子分类数量
     */
    int getSubCategoryCount(Long parentId);

    /**
     * 判断是否可以删除分类
     */
    boolean canDeleteCategory(Long categoryId);

    /**
     * 根据状态查询分类
     */
    List<Category> getCategoriesByStatus(Integer status);

    /**
     * 初始化默认分类数据
     */
    void initDefaultCategories();

    /**
     * 获取花材分类列表（顶级分类）
     */
    List<Category> getFlowerCategories();

    /**
     * 获取包装分类列表（子分类）
     */
    List<Category> getPackagingCategories();

    /**
     * 根据花材分类获取对应的包装分类
     */
    List<Category> getPackagingByFlowerCategory(Long flowerCategoryId);
}