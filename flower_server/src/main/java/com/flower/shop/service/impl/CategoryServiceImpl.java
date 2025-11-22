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

import java.util.List;
import java.util.Map;

/**
 * 商品分类服务实现类
 * 
 * 设计说明：
 * - 扁平化分类结构，不支持树形层级
 * - 通过type字段区分花材(FLOWER)和包装(PACKAGING)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    private final CategoryMapper categoryMapper;

    @Override
    public List<Category> getEnabledCategories() {
        return lambdaQuery()
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getType)
                .orderByAsc(Category::getSortOrder)
                .list();
    }

    @Override
    public List<Category> getCategoriesByType(String type) {
        return lambdaQuery()
                .eq(Category::getType, type)
                .orderByAsc(Category::getSortOrder)
                .list();
    }

    @Override
    public List<Category> getCategoriesByTypeAndStatus(String type, Integer status) {
        return lambdaQuery()
                .eq(Category::getType, type)
                .eq(Category::getStatus, status)
                .orderByAsc(Category::getSortOrder)
                .list();
    }

    @Override
    public List<Category> getFlowerCategories() {
        return getCategoriesByTypeAndStatus("FLOWER", 1);
    }

    @Override
    public List<Category> getPackagingCategories() {
        return getCategoriesByTypeAndStatus("PACKAGING", 1);
    }

    @Override
    public List<Category> getCategoriesByStatus(Integer status) {
        return lambdaQuery()
                .eq(Category::getStatus, status)
                .orderByAsc(Category::getType)
                .orderByAsc(Category::getSortOrder)
                .list();
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

        if (category.getCode() == null || category.getCode().trim().isEmpty()) {
            throw new IllegalArgumentException("分类编码不能为空");
        }

        // 检查分类名称是否重复
        boolean nameExists = lambdaQuery()
                .eq(Category::getName, category.getName())
                .eq(Category::getType, category.getType())
                .exists();

        if (nameExists) {
            throw new IllegalArgumentException("同类型下分类名称已存在");
        }

        // 检查分类编码是否重复
        boolean codeExists = lambdaQuery()
                .eq(Category::getCode, category.getCode())
                .exists();

        if (codeExists) {
            throw new IllegalArgumentException("分类编码已存在");
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

        // 如果修改了编码，检查是否重复
        if (category.getCode() != null && !existingCategory.getCode().equals(category.getCode())) {
            boolean exists = lambdaQuery()
                    .eq(Category::getCode, category.getCode())
                    .ne(Category::getId, category.getId())
                    .exists();

            if (exists) {
                throw new IllegalArgumentException("分类编码已存在");
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

        // 检查是否可以删除
        if (!canDeleteCategory(categoryId)) {
            throw new IllegalArgumentException("该分类下有关联商品，无法删除");
        }

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
    @Transactional
    public boolean updateCategorySort(List<Map<String, Object>> sortData) {
        try {
            for (Map<String, Object> item : sortData) {
                Long id = Long.valueOf(item.get("id").toString());
                Integer sortOrder = Integer.valueOf(item.get("sortOrder").toString());

                Category category = getById(id);
                if (category != null) {
                    category.setSortOrder(sortOrder);
                    updateById(category);
                }
            }
            return true;
        } catch (Exception e) {
            log.error("更新分类排序失败", e);
            return false;
        }
    }

    @Override
    public Category getByName(String name) {
        return lambdaQuery()
                .eq(Category::getName, name)
                .one();
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

    @Override
    public boolean canDeleteCategory(Long categoryId) {
        // 检查是否有关联的商品
        // 这里需要注入 ProductMapper 或 ProductService 来检查
        // 简化实现，暂时返回 true
        // TODO: 实现真正的检查逻辑
        return true;
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
    @Transactional
    public void initDefaultCategories() {
        // 检查是否已有数据
        if (count() > 0) {
            log.info("分类数据已存在，跳过初始化");
            return;
        }

        // 初始化花材分类
        List<Category> flowerCategories = List.of(
                Category.builder().name("玫瑰").code("ROSE").type("FLOWER").sortOrder(1).status(1).build(),
                Category.builder().name("百合").code("LILY").type("FLOWER").sortOrder(2).status(1).build(),
                Category.builder().name("夜来香").code("TUBEROSE").type("FLOWER").sortOrder(3).status(1).build(),
                Category.builder().name("康乃馨").code("CARNATION").type("FLOWER").sortOrder(4).status(1).build(),
                Category.builder().name("向日葵").code("SUNFLOWER").type("FLOWER").sortOrder(5).status(1).build());

        // 初始化包装分类
        List<Category> packagingCategories = List.of(
                Category.builder().name("花束").code("BOUQUET").type("PACKAGING").sortOrder(1).status(1).build(),
                Category.builder().name("花篮").code("BASKET").type("PACKAGING").sortOrder(2).status(1).build());

        saveBatch(flowerCategories);
        saveBatch(packagingCategories);

        log.info("默认分类数据初始化成功");
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
}