package com.flower.shop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.flower.shop.entity.Category;
import com.flower.shop.mapper.CategoryMapper;
import com.flower.shop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 商品分类服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    private final CategoryMapper categoryMapper;

    @Override
    public List<Category> getFlowerCategories() {
        return lambdaQuery()
                .eq(Category::getType, "FLOWER")
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getSortOrder)
                .list();
    }

    @Override
    public List<Category> getPackagingCategories() {
        return lambdaQuery()
                .eq(Category::getType, "PACKAGING")
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getSortOrder)
                .list();
    }

    @Override
    public List<Category> getTopLevelCategories() {
        return getFlowerCategories(); // 花材分类就是顶级分类
    }

    @Override
    public List<Category> getSubCategoriesByParentId(Long parentId) {
        return getPackagingCategories(); // 包装分类就是子分类
    }

    @Override
    public List<Category> getEnabledCategories() {
        return lambdaQuery()
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getType)
                .orderByAsc(Category::getSortOrder)
                .list();
    }

    @Override
    public List<Map<String, Object>> getCategoryTree() {
        List<Category> allCategories = getEnabledCategories();
        return buildCategoryTree(allCategories);
    }

    @Override
    public List<Map<String, Object>> getEnabledCategoryTree() {
        return getCategoryTree(); // 已经过滤了启用的分类
    }

    /**
     * 构建分类树结构（基于type字段）
     */
    private List<Map<String, Object>> buildCategoryTree(List<Category> categories) {
        // 分离花材和包装类型
        List<Category> flowerCategories = categories.stream()
                .filter(category -> "FLOWER".equals(category.getType()))
                .sorted(Comparator.comparing(Category::getSortOrder))
                .collect(Collectors.toList());

        List<Category> packagingCategories = categories.stream()
                .filter(category -> "PACKAGING".equals(category.getType()))
                .sorted(Comparator.comparing(Category::getSortOrder))
                .collect(Collectors.toList());

        // 构建树结构
        List<Map<String, Object>> tree = new ArrayList<>();

        // 为每个花材分类创建节点，并将包装分类作为子分类
        for (Category flowerCategory : flowerCategories) {
            Map<String, Object> treeNode = new HashMap<>();
            treeNode.put("id", flowerCategory.getId());
            treeNode.put("name", flowerCategory.getName());
            treeNode.put("type", flowerCategory.getType());
            treeNode.put("status", flowerCategory.getStatus());
            treeNode.put("sortOrder", flowerCategory.getSortOrder());
            treeNode.put("createdAt", flowerCategory.getCreatedAt());

            // 添加所有包装分类作为子分类
            List<Map<String, Object>> children = packagingCategories.stream()
                    .map(packagingCategory -> {
                        Map<String, Object> childNode = new HashMap<>();
                        childNode.put("id", packagingCategory.getId());
                        childNode.put("name", packagingCategory.getName());
                        childNode.put("type", packagingCategory.getType());
                        childNode.put("status", packagingCategory.getStatus());
                        childNode.put("sortOrder", packagingCategory.getSortOrder());
                        childNode.put("createdAt", packagingCategory.getCreatedAt());
                        return childNode;
                    })
                    .collect(Collectors.toList());
            treeNode.put("children", children);

            tree.add(treeNode);
        }

        return tree;
    }

    @Override
    @Transactional
    public boolean createCategory(Category category) {
        // 验证分类数据
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("分类名称不能为空");
        }

        if (category.getType() == null) {
            throw new IllegalArgumentException("分类类型不能为空");
        }

        // 检查分类名称是否重复
        boolean exists = lambdaQuery()
                .eq(Category::getName, category.getName())
                .eq(Category::getType, category.getType())
                .exists();

        if (exists) {
            throw new IllegalArgumentException("同类型下分类名称已存在");
        }

        // 设置默认值
        if (category.getStatus() == null) {
            category.setStatus(1);
        }
        if (category.getSortOrder() == null) {
            category.setSortOrder(getNextSortOrder(category.getType()));
        }

        return save(category);
    }

    @Override
    @Transactional
    public boolean updateCategory(Category category) {
        // 检查分类是否存在
        Category existingCategory = getById(category.getId());
        if (existingCategory == null) {
            throw new IllegalArgumentException("分类不存在");
        }

        // 如果修改了名称，检查是否重复
        if (!existingCategory.getName().equals(category.getName())) {
            boolean exists = lambdaQuery()
                    .eq(Category::getName, category.getName())
                    .eq(Category::getType, category.getType())
                    .ne(Category::getId, category.getId())
                    .exists();

            if (exists) {
                throw new IllegalArgumentException("同类型下分类名称已存在");
            }
        }

        return updateById(category);
    }

    @Override
    @Transactional
    public boolean deleteCategory(Long categoryId) {
        // 检查分类是否存在
        Category category = getById(categoryId);
        if (category == null) {
            throw new IllegalArgumentException("分类不存在");
        }

        // 检查是否有关联的商品（这里简化处理）
        // 实际业务中需要检查products表中是否有关联的商品

        return removeById(categoryId);
    }

    @Override
    @Transactional
    public boolean toggleCategoryStatus(Long categoryId) {
        Category category = getById(categoryId);
        if (category == null) {
            throw new IllegalArgumentException("分类不存在");
        }

        Integer newStatus = category.getStatus() == 1 ? 0 : 1;
        category.setStatus(newStatus);

        return updateById(category);
    }

    @Override
    public int countCategories() {
        return Math.toIntExact(count());
    }

    @Override
    public int countFlowerCategories() {
        return Math.toIntExact(lambdaQuery()
                .eq(Category::getType, "FLOWER")
                .count());
    }

    @Override
    public int countPackagingCategories() {
        return Math.toIntExact(lambdaQuery()
                .eq(Category::getType, "PACKAGING")
                .count());
    }

    @Override
    public boolean isNameDuplicate(String name, String type, Long excludeId) {
        LambdaQueryWrapper<Category> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Category::getName, name)
                .eq(Category::getType, type);

        if (excludeId != null) {
            queryWrapper.ne(Category::getId, excludeId);
        }

        return count(queryWrapper) > 0;
    }

    /**
     * 获取下一个排序值
     */
    private int getNextSortOrder(String type) {
        Category lastCategory = lambdaQuery()
                .eq(Category::getType, type)
                .orderByDesc(Category::getSortOrder)
                .last("limit 1")
                .one();

        return lastCategory != null ? lastCategory.getSortOrder() + 1 : 1;
    }

    @Override
    public List<Category> getPackagingByFlowerCategory(Long flowerCategoryId) {
        return getPackagingCategories(); // 简化实现，返回所有包装分类
    }

    @Override
    public Category getByName(String name) {
        return lambdaQuery()
                .eq(Category::getName, name)
                .one();
    }

    @Override
    public boolean updateCategorySort(List<Map<String, Object>> sortData) {
        // 简化实现，直接返回true
        return true;
    }

    @Override
    public Category getCategoryWithDetails(Long categoryId) {
        return getById(categoryId);
    }

    @Override
    public int getSubCategoryCount(Long parentId) {
        return countPackagingCategories(); // 简化实现
    }

    @Override
    public boolean canDeleteCategory(Long categoryId) {
        return true; // 简化实现
    }

    @Override
    public List<Category> getCategoriesByStatus(Integer status) {
        return lambdaQuery()
                .eq(Category::getStatus, status)
                .orderByAsc(Category::getSortOrder)
                .list();
    }

    @Override
    public void initDefaultCategories() {
        // 简化实现，可以留空或添加默认分类逻辑
    }
}