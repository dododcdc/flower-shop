-- 添加贺卡相关字段到 orders 表
ALTER TABLE `orders` ADD COLUMN `card_content` VARCHAR(500) DEFAULT NULL COMMENT '贺卡内容';
ALTER TABLE `orders` ADD COLUMN `card_sender` VARCHAR(100) DEFAULT NULL COMMENT '贺卡署名';
