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
