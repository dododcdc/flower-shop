package com.flower.shop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.flower.shop.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 商品分类Mapper接口
 *
 * 功能说明：
 * - 分类CRUD操作
 * - 层级分类查询
 * - 分类状态管理
 */
@Mapper
public interface CategoryMapper extends BaseMapper<Category> {

    /**
     * 查询所有顶级分类（花材类型）
     */
    @Select("SELECT * FROM categories WHERE parent_id IS NULL ORDER BY sort_order ASC, id ASC")
    List<Category> selectTopLevelCategories();

    /**
     * 查询指定父分类下的所有子分类（包装类型）
     */
    @Select("SELECT * FROM categories WHERE parent_id = #{parentId} ORDER BY sort_order ASC, id ASC")
    List<Category> selectSubCategoriesByParentId(@Param("parentId") Long parentId);

    /**
     * 查询所有启用的分类
     */
    @Select("SELECT * FROM categories WHERE status = 1 ORDER BY sort_order ASC, id ASC")
    List<Category> selectEnabledCategories();

    /**
     * 根据名称查询分类
     */
    @Select("SELECT * FROM categories WHERE name = #{name} LIMIT 1")
    Category selectByName(@Param("name") String name);

    /**
     * 查询启用的顶级分类
     */
    @Select("SELECT * FROM categories WHERE parent_id IS NULL AND status = 1 ORDER BY sort_order ASC, id ASC")
    List<Category> selectEnabledTopLevelCategories();

    /**
     * 查询启用的子分类
     */
    @Select("SELECT * FROM categories WHERE parent_id = #{parentId} AND status = 1 ORDER BY sort_order ASC, id ASC")
    List<Category> selectEnabledSubCategories(@Param("parentId") Long parentId);

    /**
     * 检查分类名称是否存在（排除指定ID）
     */
    @Select("SELECT COUNT(*) FROM categories WHERE name = #{name} AND id != #{excludeId} ")
    int countByNameExcludeId(@Param("name") String name, @Param("excludeId") Long excludeId);

    /**
     * 批量更新分类排序
     */
    @Select("SELECT * FROM categories WHERE id IN #{ids} ")
    List<Category> selectByIds(@Param("ids") List<Long> ids);

    /**
     * 根据父ID查询子分类数量
     */
    @Select("SELECT COUNT(*) FROM categories WHERE parent_id = #{parentId} ")
    int countSubCategories(@Param("parentId") Long parentId);

    /**
     * 查询包含父分类信息的分类列表
     */
    @Select("SELECT c.*, p.name as parent_name " +
            "FROM categories c " +
            "LEFT JOIN categories p ON c.parent_id = p.id " +
            "WHERE c. " +
            "ORDER BY c.parent_id ASC, c.sort_order ASC, c.id ASC")
    List<Category> selectCategoriesWithParentName();

    /**
     * 根据状态查询分类
     */
    @Select("SELECT * FROM categories WHERE status = #{status}  ORDER BY sort_order ASC, id ASC")
    List<Category> selectByStatus(@Param("status") Integer status);
}