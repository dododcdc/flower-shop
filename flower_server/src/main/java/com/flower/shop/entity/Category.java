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
 * - 简化的两级分类系统
 * - 通过type字段区分：FLOWER（花材）和PACKAGING（包装）
 * - 不使用parent_id，避免复杂的层级关系
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
     * 分类编码
     */
    @TableField("code")
    private String code;

    /**
     * 分类类型：FLOWER（花材）、PACKAGING（包装）
     */
    @TableField("type")
    private String type;

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
     * 判断是否为花材类型
     */
    public boolean isFlowerCategory() {
        return "FLOWER".equals(this.type);
    }

    /**
     * 判断是否为包装类型
     */
    public boolean isPackagingCategory() {
        return "PACKAGING".equals(this.type);
    }

    /**
     * 判断是否启用
     */
    public boolean isEnabled() {
        return Integer.valueOf(1).equals(this.status);
    }
}