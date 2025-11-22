package com.flower.shop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.flower.shop.entity.DeliveryAddress;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 配送地址Mapper接口
 *
 * 功能说明：
 * - 配送地址CRUD操作
 * - 地址距离计算
 * - 配送范围验证
 */
@Mapper
public interface DeliveryAddressMapper extends BaseMapper<DeliveryAddress> {

    /**
     * 根据用户ID查询地址列表
     */
    @Select("SELECT * FROM delivery_addresses " +
            "WHERE user_id = #{userId} AND  " +
            "ORDER BY is_default DESC, updated_at DESC")
    List<DeliveryAddress> selectByUserId(@Param("userId") Long userId);

    /**
     * 根据用户ID查询默认地址
     */
    @Select("SELECT * FROM delivery_addresses " +
            "WHERE user_id = #{userId} AND is_default = 1 AND status = 1 AND  " +
            "LIMIT 1")
    DeliveryAddress selectDefaultByUserId(@Param("userId") Long userId);

    /**
     * 查询游客地址（根据手机号）
     */
    @Select("SELECT * FROM delivery_addresses " +
            "WHERE user_id IS NULL AND contact_phone = #{contactPhone} AND  " +
            "ORDER BY created_at DESC")
    List<DeliveryAddress> selectGuestAddressesByPhone(@Param("contactPhone") String contactPhone);

    /**
     * 查询配送范围内的地址
     */
    @Select("SELECT * FROM delivery_addresses " +
            "WHERE is_within_range = 1 AND status = 1 AND  " +
            "ORDER BY distance ASC")
    List<DeliveryAddress> selectWithinRangeAddresses();

    /**
     * 查询超出配送范围的地址
     */
    @Select("SELECT * FROM delivery_addresses " +
            "WHERE is_within_range = 0 AND status = 1 AND  " +
            "ORDER BY distance DESC")
    List<DeliveryAddress> selectOutOfRangeAddresses();

    /**
     * 查询启用的地址
     */
    @Select("SELECT * FROM delivery_addresses " +
            "WHERE status = 1 AND  " +
            "ORDER BY updated_at DESC")
    List<DeliveryAddress> selectEnabledAddresses();

    /**
     * 根据手机号查询地址
     */
    @Select("SELECT * FROM delivery_addresses " +
            "WHERE contact_phone = #{contactPhone} AND  " +
            "ORDER BY is_default DESC, updated_at DESC")
    List<DeliveryAddress> selectByContactPhone(@Param("contactPhone") String contactPhone);

    /**
     * 取消用户所有默认地址
     */
    @Select("UPDATE delivery_addresses SET is_default = 0 " +
            "WHERE user_id = #{userId} AND ")
    int unsetAllDefaultForUser(@Param("userId") Long userId);

    /**
     * 设置用户默认地址
     */
    @Select("UPDATE delivery_addresses SET is_default = 1 " +
            "WHERE id = #{addressId} AND user_id = #{userId} AND ")
    int setAsDefaultAddress(@Param("addressId") Long addressId, @Param("userId") Long userId);

    /**
     * 根据地址ID和用户ID查询
     */
    @Select("SELECT * FROM delivery_addresses " +
            "WHERE id = #{addressId} AND user_id = #{userId} AND ")
    DeliveryAddress selectByIdAndUserId(@Param("addressId") Long addressId, @Param("userId") Long userId);

    /**
     * 检查地址是否属于指定用户
     */
    @Select("SELECT COUNT(*) FROM delivery_addresses " +
            "WHERE id = #{addressId} AND user_id = #{userId} AND ")
    int countByIdAndUserId(@Param("addressId") Long addressId, @Param("userId") Long userId);

    /**
     * 根据标签查询用户地址
     */
    @Select("SELECT * FROM delivery_addresses " +
            "WHERE user_id = #{userId} AND label = #{label} AND status = 1 AND ")
    List<DeliveryAddress> selectByUserIdAndLabel(@Param("userId") Long userId, @Param("label") String label);

    /**
     * 根据距离查询地址（指定距离内）
     */
    @Select("SELECT * FROM delivery_addresses " +
            "WHERE distance <= #{maxDistance} AND is_within_range = 1 AND status = 1 AND  " +
            "ORDER BY distance ASC")
    List<DeliveryAddress> selectByMaxDistance(@Param("maxDistance") Double maxDistance);

    /**
     * 统计用户地址数量
     */
    @Select("SELECT COUNT(*) FROM delivery_addresses " +
            "WHERE user_id = #{userId} AND ")
    int countByUserId(@Param("userId") Long userId);

    /**
     * 统计配送范围内地址数量
     */
    @Select("SELECT COUNT(*) FROM delivery_addresses " +
            "WHERE is_within_range = 1 AND status = 1 AND ")
    int countWithinRangeAddresses();

    /**
     * 统计超出配送范围地址数量
     */
    @Select("SELECT COUNT(*) FROM delivery_addresses " +
            "WHERE is_within_range = 0 AND status = 1 AND ")
    int countOutOfRangeAddresses();

    /**
     * 查询最近使用的地址
     */
    @Select("SELECT * FROM delivery_addresses " +
            "WHERE user_id = #{userId} AND status = 1 AND  " +
            "ORDER BY updated_at DESC " +
            "LIMIT #{limit}")
    List<DeliveryAddress> selectRecentlyUsed(@Param("userId") Long userId, @Param("limit") Integer limit);

    /**
     * 批量查询地址（根据ID列表）
     */
    @Select("SELECT * FROM delivery_addresses " +
            "WHERE id IN #{addressIds} AND  " +
            "ORDER BY updated_at DESC")
    List<DeliveryAddress> selectByIds(@Param("addressIds") List<Long> addressIds);

    /**
     * 搜索地址（根据地址内容）
     */
    @Select("SELECT * FROM delivery_addresses " +
            "WHERE user_id = #{userId} " +
            "AND (detailed_address LIKE CONCAT('%', #{keyword}, '%') " +
            "OR full_address LIKE CONCAT('%', #{keyword}, '%') " +
            "OR contact_name LIKE CONCAT('%', #{keyword}, '%')) " +
            "AND status = 1 AND  " +
            "ORDER BY is_default DESC, updated_at DESC")
    List<DeliveryAddress> searchAddresses(@Param("userId") Long userId, @Param("keyword") String keyword);
}