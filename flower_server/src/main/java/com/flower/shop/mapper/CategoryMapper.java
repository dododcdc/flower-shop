package com.flower.shop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.flower.shop.entity.Category;
import org.apache.ibatis.annotations.Mapper;

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
}