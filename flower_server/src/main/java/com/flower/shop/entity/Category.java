package com.flower.shop.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 商品分类实体类
 *
 * 设计说明：
 * - 父分类为花材类型（玫瑰、百合等）
 * - 子分类为包装类型（花束、花篮）
 * - 通过parent_id区分层级
 */
@Data
@Builder
@EqualsAndHashCode(callSuper = false)
@TableName("categories")
public class Category {

    /**
     * 分类ID - 主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 分类名称
     * 如：玫瑰、百合、花束、花篮
     */
    @TableField("name")
    private String name;

    /**
     * 分类的父级ID
     * - NULL: 表示顶级分类（花材类型）
     * - 有值: 表示子分类（包装类型）
     */
    @TableField("parent_id")
    private Long parentId;

    /**
     * 分类图标或图片URL
     */
    @TableField("image_url")
    private String imageUrl;

    /**
     * 分类描述
     */
    @TableField("description")
    private String description;

    /**
     * 排序值，数字越小越靠前
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 分类状态：0-禁用，1-启用
     */
    @TableField("status")
    private Integer status;

    /**
     * 花语寓意（用于花材分类）
     */
    @TableField("flower_meaning")
    private String flowerMeaning;

    /**
     * 养护说明（用于花材分类）
     */
    @TableField("care_instructions")
    private String careInstructions;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 逻辑删除标记：0-未删除，1-已删除
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;

    /**
     * 判断是否为顶级分类（花材类型）
     */
    public boolean isTopLevel() {
        return this.parentId == null;
    }

    /**
     * 判断是否为子分类（包装类型）
     */
    public boolean isSubCategory() {
        return !isTopLevel();
    }

    /**
     * 获取分类显示名称
     * 子分类显示：父分类名称 - 子分类名称（如：玫瑰 - 花束）
     */
    public String getDisplayName() {
        if (isSubCategory()) {
            return String.format("%s - %s", getParentName(), this.name);
        }
        return this.name;
    }

    /**
     * 父分类名称（临时存储，用于显示）
     */
    @TableField(exist = false)
    private String parentName;
}