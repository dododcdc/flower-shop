package com.flower.shop.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 配送地址实体类
 *
 * 设计说明：
 * - 支持游客和注册用户的地址管理
 * - 自动计算配送距离
 * - 验证配送范围（10km内）
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("delivery_addresses")
public class DeliveryAddress {

    /**
     * 地址ID - 主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID（注册用户的地址）
     * 游客地址此字段为空
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 联系人姓名
     */
    @TableField("contact_name")
    private String contactName;

    /**
     * 联系人手机号
     */
    @TableField("contact_phone")
    private String contactPhone;

    /**
     * 省份
     */
    @TableField("province")
    private String province;

    /**
     * 城市
     */
    @TableField("city")
    private String city;

    /**
     * 区县
     */
    @TableField("district")
    private String district;

    /**
     * 详细地址
     */
    @TableField("detailed_address")
    private String detailedAddress;

    /**
     * 完整地址（省市区+详细地址）
     */
    @TableField("full_address")
    private String fullAddress;

    /**
     * 经度
     */
    @TableField("longitude")
    private Double longitude;

    /**
     * 纬度
     */
    @TableField("latitude")
    private Double latitude;

    /**
     * 距离门店的距离（公里）
     */
    @TableField("distance")
    private Double distance;

    /**
     * 是否在配送范围内（0-不在，1-在）
     */
    @TableField("is_within_range")
    private Integer isWithinRange;

    /**
     * 地址标签
     * 如：家、公司、学校等
     */
    @TableField("label")
    private String label;

    /**
     * 是否默认地址（0-否，1-是）
     */
    @TableField("is_default")
    private Integer isDefault;

    /**
     * 配送备注
     * 如：送到前台、电话提前联系等
     */
    @TableField("delivery_notes")
    private String deliveryNotes;

    /**
     * 地址状态：0-禁用，1-启用
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
     * 逻辑删除标记：0-未删除，1-已删除
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;

    /**
     * 门店地址（固定值，用于计算距离）
     */
    private static final String SHOP_ADDRESS = "花言花语门店地址";

    /**
     * 最大配送距离（公里）
     */
    private static final double MAX_DELIVERY_DISTANCE = 10.0;

    /**
     * 判断是否为游客地址
     */
    public boolean isGuestAddress() {
        return this.userId == null;
    }

    /**
     * 判断是否在配送范围内
     */
    public boolean isWithinDeliveryRange() {
        return Integer.valueOf(1).equals(this.isWithinRange);
    }

    /**
     * 判断是否为默认地址
     */
    public boolean isDefaultAddress() {
        return Integer.valueOf(1).equals(this.isDefault);
    }

    /**
     * 判断地址是否可用
     */
    public boolean isActive() {
        return Integer.valueOf(1).equals(this.status);
    }

    /**
     * 获取完整地址
     */
    public String getCompleteAddress() {
        if (fullAddress != null && !fullAddress.trim().isEmpty()) {
            return fullAddress;
        }

        StringBuilder sb = new StringBuilder();
        if (province != null) sb.append(province);
        if (city != null) sb.append(city);
        if (district != null) sb.append(district);
        if (detailedAddress != null) sb.append(detailedAddress);

        return sb.toString();
    }

    /**
     * 获取距离描述
     */
    public String getDistanceDescription() {
        if (distance == null) {
            return "距离未知";
        }

        if (distance < 1) {
            return String.format("%.0f米", distance * 1000);
        } else {
            return String.format("%.1f公里", distance);
        }
    }

    /**
     * 获取配送状态描述
     */
    public String getDeliveryStatusText() {
        if (!isWithinDeliveryRange()) {
            return "超出配送范围";
        } else if (distance != null) {
            return String.format("可配送（%s）", getDistanceDescription());
        } else {
            return "可配送";
        }
    }

    /**
     * 验证配送距离（简单模拟，实际应该调用地图API）
     */
    public boolean calculateDeliveryDistance() {
        // 这里简化处理，实际应该根据经纬度调用地图API计算
        // 或者根据地址进行距离计算

        // 模拟计算：根据关键词判断大致距离
        String address = getCompleteAddress().toLowerCase();

        // 包含门店附近关键词的距离较近
        if (address.contains("附近") || address.contains("周边") ||
            address.contains("隔壁") || address.contains("对面")) {
            this.distance = 0.5;
        }
        // 包含区域标识的距离中等
        else if (address.contains("区") || address.contains("街道")) {
            this.distance = 3.0;
        }
        // 其他情况距离较远
        else {
            this.distance = 8.0;
        }

        // 判断是否在配送范围内
        this.isWithinRange = this.distance <= MAX_DELIVERY_DISTANCE ? 1 : 0;

        return isWithinDeliveryRange();
    }

    /**
     * 设置为默认地址
     */
    public void setAsDefault() {
        this.isDefault = 1;
    }

    /**
     * 取消默认地址
     */
    public void unsetAsDefault() {
        this.isDefault = 0;
    }

    /**
     * 激活地址
     */
    public void activate() {
        this.status = 1;
    }

    /**
     * 禁用地址
     */
    public void deactivate() {
        this.status = 0;
    }
}