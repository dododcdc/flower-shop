-- 更新订单表的支付方式枚举值
-- 注意：MySQL不直接支持修改ENUM类型，需要重建列

-- 1. 首先添加一个临时列
ALTER TABLE `orders` ADD COLUMN `payment_method_temp` ENUM('ALIPAY', 'WECHAT', 'ON_DELIVERY') DEFAULT 'ON_DELIVERY' COMMENT '支付方式';

-- 2. 将现有数据从旧列复制到新列
-- 对于现有的CASH和MOCK值，转换为ON_DELIVERY
UPDATE `orders` SET `payment_method_temp` = `payment_method` WHERE `payment_method` IN ('ALIPAY', 'WECHAT');
UPDATE `orders` SET `payment_method_temp` = 'ON_DELIVERY' WHERE `payment_method` IN ('CASH', 'MOCK');

-- 3. 删除旧列
ALTER TABLE `orders` DROP COLUMN `payment_method`;

-- 4. 重命名新列为原列名
ALTER TABLE `orders` CHANGE `payment_method_temp` `payment_method` ENUM('ALIPAY', 'WECHAT', 'ON_DELIVERY') DEFAULT 'ON_DELIVERY' COMMENT '支付方式';