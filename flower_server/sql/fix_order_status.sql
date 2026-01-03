-- 修改订单表结构
-- 修改时间: 2025-01-02
-- 说明: 移除 status 字段中的 PAID 状态，避免与 payment_status 重复

USE flower_shop;

-- 1. 先检查是否有 status='PAID' 的数据
SELECT COUNT(*) as 'PAID status 订单数量' FROM orders WHERE status = 'PAID';

-- 2. 如果有 PAID 状态的订单，将其改为 PREPARING（准备中）
-- 注意：执行前请确认是否需要转换
UPDATE orders
SET status = 'PREPARING'
WHERE status = 'PAID';

-- 3. 修改 status 字段定义，移除 PAID
ALTER TABLE orders
MODIFY COLUMN status ENUM('PENDING', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED')
DEFAULT 'PENDING'
NOT NULL
COMMENT '订单状态: PENDING-待确认, PREPARING-准备中, DELIVERING-配送中, COMPLETED-已完成, CANCELLED-已取消';

-- 4. 验证修改
SHOW COLUMNS FROM orders LIKE 'status';
SHOW COLUMNS FROM orders LIKE 'payment_status';

-- 5. 查看当前订单状态分布
SELECT status, COUNT(*) as count
FROM orders
GROUP BY status;

select *
from orders where order_no='FH20260102232337312';

select * from order_items where order_id = '13' ;

show create table products;

CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品名称',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '商品描述',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `flower_language` text COLLATE utf8mb4_unicode_ci COMMENT '花语寓意',
  `care_guide` text COLLATE utf8mb4_unicode_ci COMMENT '养护指南',
  `category_id` bigint NOT NULL COMMENT '分类ID',
  `sort_order` int DEFAULT '0' COMMENT '排序顺序',
  `stock_quantity` int NOT NULL DEFAULT '0' COMMENT '库存数量',
  `low_stock_threshold` int DEFAULT '5' COMMENT '低库存预警阈值',
  `status` tinyint(1) DEFAULT '1' COMMENT '商品状态：0-下架，1-上架',
  `featured` tinyint(1) DEFAULT '0' COMMENT '是否推荐：0-不推荐，1-推荐',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_products_category_id` (`category_id`),
  KEY `idx_products_is_active` (`status`),
  KEY `idx_products_sort_order` (`sort_order`),
  KEY `idx_products_stock_quantity` (`stock_quantity`),
  KEY `idx_products_low_stock_threshold` (`low_stock_threshold`),
  KEY `idx_product_category` (`category_id`),
  KEY `idx_product_status` (`status`),
  KEY `idx_product_created_at` (`created_at` DESC),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表'