package com.flower.shop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.flower.shop.entity.Category;
import com.flower.shop.mapper.CategoryMapper;
import com.flower.shop.mapper.ProductMapper;
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
    private final ProductMapper productMapper;

    @Override
    public List<Category> getTopLevelCategories() {
        return categoryMapper.selectTopLevelCategories();
    }

    @Override
    public List<Category> getSubCategoriesByParentId(Long parentId) {
        if (parentId == null) {
            return new ArrayList<>();
        }
        return categoryMapper.selectSubCategoriesByParentId(parentId);
    }

    @Override
    public List<Category> getEnabledCategories() {
        return categoryMapper.selectEnabledCategories();
    }

    @Override
    public List<Map<String, Object>> getCategoryTree() {
        List<Category> allCategories = categoryMapper.selectCategoriesWithParentName();
        return buildCategoryTree(allCategories);
    }

    @Override
    public List<Map<String, Object>> getEnabledCategoryTree() {
        List<Category> enabledCategories = categoryMapper.selectEnabledCategories();
        return buildCategoryTree(enabledCategories);
    }

    /**
     * 构建分类树结构
     */
    private List<Map<String, Object>> buildCategoryTree(List<Category> categories) {
        // 按父ID分组
        Map<Long, List<Category>> groupByParent = categories.stream()
                .filter(category -> category.getParentId() != null)
                .collect(Collectors.groupingBy(Category::getParentId));

        // 构建树结构
        List<Map<String, Object>> tree = new ArrayList<>();

        // 处理顶级分类
        List<Category> topCategories = categories.stream()
                .filter(Category::isTopLevel)
                .sorted(Comparator.comparing(Category::getSortOrder))
                .collect(Collectors.toList());

        for (Category topCategory : topCategories) {
            Map<String, Object> treeNode = new HashMap<>();
            treeNode.put("id", topCategory.getId());
            treeNode.put("name", topCategory.getName());
            treeNode.put("description", topCategory.getDescription());
            treeNode.put("imageUrl", topCategory.getImageUrl());
            treeNode.put("status", topCategory.getStatus());
            treeNode.put("sortOrder", topCategory.getSortOrder());
            treeNode.put("flowerMeaning", topCategory.getFlowerMeaning());
            treeNode.put("careInstructions", topCategory.getCareInstructions());
            treeNode.put("isTopLevel", true);
            treeNode.put("createdAt", topCategory.getCreatedAt());

            // 添加子分类
            List<Category> subCategories = groupByParent.get(topCategory.getId());
            if (subCategories != null && !subCategories.isEmpty()) {
                List<Map<String, Object>> children = subCategories.stream()
                        .sorted(Comparator.comparing(Category::getSortOrder))
                        .map(subCategory -> {
                            Map<String, Object> childNode = new HashMap<>();
                            childNode.put("id", subCategory.getId());
                            childNode.put("name", subCategory.getName());
                            childNode.put("description", subCategory.getDescription());
                            childNode.put("imageUrl", subCategory.getImageUrl());
                            childNode.put("status", subCategory.getStatus());
                            childNode.put("sortOrder", subCategory.getSortOrder());
                            childNode.put("isTopLevel", false);
                            childNode.put("createdAt", subCategory.getCreatedAt());
                            return childNode;
                        })
                        .collect(Collectors.toList());
                treeNode.put("children", children);
            } else {
                treeNode.put("children", new ArrayList<>());
            }

            tree.add(treeNode);
        }

        return tree;
    }

    @Override
    @Transactional
    public Category createCategory(Category category) {
        // 检查名称是否重复
        if (isNameDuplicate(category.getName(), null)) {
            throw new IllegalArgumentException("分类名称已存在：" + category.getName());
        }

        // 设置默认值
        if (category.getSortOrder() == null) {
            category.setSortOrder(getNextSortOrder(category.getParentId()));
        }
        if (category.getStatus() == null) {
            category.setStatus(1); // 默认启用
        }

        // 保存分类
        save(category);
        log.info("创建分类成功：{}", category.getName());

        return category;
    }

    @Override
    @Transactional
    public Category updateCategory(Category category) {
        // 检查分类是否存在
        Category existingCategory = getById(category.getId());
        if (existingCategory == null) {
            throw new IllegalArgumentException("分类不存在：" + category.getId());
        }

        // 检查名称是否重复（排除自己）
        if (isNameDuplicate(category.getName(), category.getId())) {
            throw new IllegalArgumentException("分类名称已存在：" + category.getName());
        }

        // 更新分类
        updateById(category);
        log.info("更新分类成功：{}", category.getName());

        return getById(category.getId());
    }

    @Override
    @Transactional
    public boolean deleteCategory(Long categoryId) {
        // 检查是否可以删除
        if (!canDeleteCategory(categoryId)) {
            throw new IllegalArgumentException("该分类下存在子分类或关联商品，无法删除");
        }

        // 逻辑删除
        boolean result = removeById(categoryId);
        if (result) {
            log.info("删除分类成功：{}", categoryId);
        }
        return result;
    }

    @Override
    @Transactional
    public boolean toggleCategoryStatus(Long categoryId, Integer status) {
        Category category = getById(categoryId);
        if (category == null) {
            throw new IllegalArgumentException("分类不存在：" + categoryId);
        }

        LambdaUpdateWrapper<Category> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(Category::getId, categoryId)
                .set(Category::getStatus, status);

        boolean result = update(updateWrapper);
        if (result) {
            log.info("更新分类状态成功：categoryId={}, status={}", categoryId, status);
        }
        return result;
    }

    @Override
    @Transactional
    public boolean updateCategorySort(List<Map<String, Object>> sortData) {
        for (Map<String, Object> item : sortData) {
            Long categoryId = Long.valueOf(item.get("id").toString());
            Integer sortOrder = Integer.valueOf(item.get("sortOrder").toString());

            LambdaUpdateWrapper<Category> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.eq(Category::getId, categoryId)
                    .set(Category::getSortOrder, sortOrder);
            update(updateWrapper);
        }

        log.info("批量更新分类排序成功，共{}项", sortData.size());
        return true;
    }

    @Override
    public Category getByName(String name) {
        return categoryMapper.selectByName(name);
    }

    @Override
    public boolean isNameDuplicate(String name, Long excludeId) {
        int count = categoryMapper.countByNameExcludeId(name, excludeId);
        return count > 0;
    }

    @Override
    public Category getCategoryWithDetails(Long categoryId) {
        List<Category> categories = categoryMapper.selectCategoriesWithParentName();
        return categories.stream()
                .filter(category -> category.getId().equals(categoryId))
                .findFirst()
                .orElse(null);
    }

    @Override
    public int getSubCategoryCount(Long parentId) {
        return categoryMapper.countSubCategories(parentId);
    }

    @Override
    public boolean canDeleteCategory(Long categoryId) {
        // 检查是否有子分类
        int subCategoryCount = getSubCategoryCount(categoryId);
        if (subCategoryCount > 0) {
            return false;
        }

        // 检查是否有关联的商品
        int productCount = productMapper.countProductsByCategory(categoryId);
        return productCount == 0;
    }

    @Override
    public List<Category> getCategoriesByStatus(Integer status) {
        return categoryMapper.selectByStatus(status);
    }

    @Override
    @Transactional
    public void initDefaultCategories() {
        log.info("开始初始化默认分类数据");

        // 检查是否已有数据
        long existingCount = count();
        if (existingCount > 0) {
            log.info("分类数据已存在，跳过初始化");
            return;
        }

        // 创建花材分类（顶级分类）
        List<Category> flowerCategories = createFlowerCategories();
        for (Category category : flowerCategories) {
            save(category);
        }

        // 创建包装分类（子分类）
        List<Category> packagingCategories = createPackagingCategories(flowerCategories);
        for (Category category : packagingCategories) {
            save(category);
        }

        log.info("默认分类数据初始化完成，共创建{}个分类", flowerCategories.size() + packagingCategories.size());
    }

    /**
     * 创建花材分类
     */
    private List<Category> createFlowerCategories() {
        List<Category> categories = new ArrayList<>();

        categories.add(Category.builder()
                .name("玫瑰")
                .description("象征爱情与浪漫的经典花材")
                .flowerMeaning("爱情、美丽、热情、勇气")
                .careInstructions("保持水质清洁，避免阳光直射，定期修剪根部")
                .sortOrder(1)
                .status(1)
                .build());

        categories.add(Category.builder()
                .name("百合")
                .description("纯洁高雅的白色花材")
                .flowerMeaning("纯洁、高雅、财富、荣誉")
                .careInstructions("喜凉爽湿润环境，避免高温干燥")
                .sortOrder(2)
                .status(1)
                .build());

        categories.add(Category.builder()
                .name("夜来香")
                .description("夜晚芬芳的独特花材")
                .flowerMeaning("纯洁、思念、贞洁")
                .careInstructions("喜半阴环境，保持土壤湿润但不积水")
                .sortOrder(3)
                .status(1)
                .build());

        categories.add(Category.builder()
                .name("康乃馨")
                .description("温馨感恩的母亲节花材")
                .flowerMeaning("母爱、尊敬、健康、祝福")
                .careInstructions("喜阳光充足环境，避免过度浇水")
                .sortOrder(4)
                .status(1)
                .build());

        categories.add(Category.builder()
                .name("向日葵")
                .description("阳光积极的花材")
                .flowerMeaning("阳光、忠诚、爱慕、沉默的爱")
                .careInstructions("喜充足阳光，耐旱性强")
                .sortOrder(5)
                .status(1)
                .build());

        return categories;
    }

    /**
     * 创建包装分类
     */
    private List<Category> createPackagingCategories(List<Category> flowerCategories) {
        List<Category> categories = new ArrayList<>();

        for (Category flowerCategory : flowerCategories) {
            // 花束包装
            categories.add(Category.builder()
                    .name("花束")
                    .parentId(flowerCategory.getId())
                    .description(flowerCategory.getName() + "精美花束包装")
                    .sortOrder(1)
                    .status(1)
                    .build());

            // 花篮包装
            categories.add(Category.builder()
                    .name("花篮")
                    .parentId(flowerCategory.getId())
                    .description(flowerCategory.getName() + "精致花篮包装")
                    .sortOrder(2)
                    .status(1)
                    .build());
        }

        return categories;
    }

    /**
     * 获取下一个排序号
     */
    private Integer getNextSortOrder(Long parentId) {
        List<Category> siblings;
        if (parentId == null) {
            siblings = getTopLevelCategories();
        } else {
            siblings = getSubCategoriesByParentId(parentId);
        }

        return siblings.stream()
                .mapToInt(category -> category.getSortOrder() != null ? category.getSortOrder() : 0)
                .max()
                .orElse(0) + 1;
    }

    @Override
    public List<Category> getFlowerCategories() {
        return getTopLevelCategories();
    }

    @Override
    public List<Category> getPackagingCategories() {
        return categoryMapper.selectSubCategoriesByParentId(null);
    }

    @Override
    public List<Category> getPackagingByFlowerCategory(Long flowerCategoryId) {
        return getSubCategoriesByParentId(flowerCategoryId);
    }
}