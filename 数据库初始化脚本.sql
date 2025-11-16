-- =============================================
-- 【花言花语】鲜花售卖系统 - 数据库初始化脚本
-- 数据库: flower_shop
-- MySQL版本: 8.0+
-- 创建时间: 2025-11-16
-- =============================================

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS flower_shop
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE flower_shop;

-- 2. 创建数据表

-- 商品分类表
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    code VARCHAR(20) NOT NULL UNIQUE COMMENT '分类代码',
    type ENUM('FLOWER', 'PACKAGING') NOT NULL COMMENT '分类类型：FLOWER-花材，PACKAGING-包装',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '商品分类表';

-- 商品表
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
    name VARCHAR(100) NOT NULL COMMENT '商品名称',
    description TEXT COMMENT '商品描述',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    original_price DECIMAL(10,2) COMMENT '原价',
    images JSON COMMENT '商品图片列表',
    flower_language TEXT COMMENT '花语寓意',
    care_guide TEXT COMMENT '养护指南',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否上架',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (category_id) REFERENCES categories(id)
) COMMENT '商品表';

-- 库存表
CREATE TABLE inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '库存ID',
    product_id BIGINT NOT NULL UNIQUE COMMENT '商品ID',
    stock_quantity INT NOT NULL DEFAULT 0 COMMENT '库存数量',
    low_stock_threshold INT DEFAULT 5 COMMENT '低库存预警阈值',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) COMMENT '库存表';

-- 用户表 (主要是管理员)
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '电话',
    role ENUM('ADMIN', 'CUSTOMER') DEFAULT 'CUSTOMER' COMMENT '角色',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    last_login TIMESTAMP NULL COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '用户表';

-- 订单表
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
    customer_name VARCHAR(50) NOT NULL COMMENT '客户姓名',
    customer_phone VARCHAR(20) NOT NULL COMMENT '客户电话',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
    delivery_fee DECIMAL(10,2) DEFAULT 0 COMMENT '配送费',
    final_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
    status ENUM('PENDING', 'PAID', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING' COMMENT '订单状态',
    payment_method ENUM('ALIPAY', 'WECHAT', 'CASH', 'MOCK') DEFAULT 'MOCK' COMMENT '支付方式',
    payment_status ENUM('PENDING', 'PAID', 'REFUNDED') DEFAULT 'PENDING' COMMENT '支付状态',
    delivery_address JSON NOT NULL COMMENT '配送地址',
    delivery_time DATETIME COMMENT '期望配送时间',
    notes TEXT COMMENT '订单备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '订单表';

-- 订单详情表
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单项ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    product_name VARCHAR(100) NOT NULL COMMENT '商品名称(冗余字段)',
    product_price DECIMAL(10,2) NOT NULL COMMENT '商品单价(冗余字段)',
    quantity INT NOT NULL COMMENT '购买数量',
    total_price DECIMAL(10,2) NOT NULL COMMENT '小计金额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
) COMMENT '订单详情表';

-- 配送地址表
CREATE TABLE delivery_addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '地址ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    province VARCHAR(50) NOT NULL COMMENT '省份',
    city VARCHAR(50) NOT NULL COMMENT '城市',
    district VARCHAR(50) NOT NULL COMMENT '区县',
    street_address VARCHAR(200) NOT NULL COMMENT '详细地址',
    postal_code VARCHAR(10) COMMENT '邮政编码',
    latitude DECIMAL(10,8) COMMENT '纬度(用于距离计算)',
    longitude DECIMAL(11,8) COMMENT '经度(用于距离计算)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) COMMENT '配送地址表';

-- 3. 插入初始数据

-- 插入花材分类
INSERT INTO categories (name, code, type, sort_order) VALUES
('玫瑰', 'ROSE', 'FLOWER', 1),
('百合', 'LILY', 'FLOWER', 2),
('夜来香', 'TUBEROSE', 'FLOWER', 3),
('康乃馨', 'CARNATION', 'FLOWER', 4),
('向日葵', 'SUNFLOWER', 'FLOWER', 5);

-- 插入包装分类
INSERT INTO categories (name, code, type, sort_order) VALUES
('花束', 'BOUQUET', 'PACKAGING', 1),
('花篮', 'BASKET', 'PACKAGING', 2);

-- 插入默认管理员 (密码: admin123)
-- BCrypt加密后的密码: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKVjzieMwkOmANgNOgKQNNBDvAGK
INSERT INTO users (username, password, role, email, phone) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKVjzieMwkOmANgNOgKQNNBDvAGK', 'ADMIN', 'admin@flower-shop.com', '13800138000');

-- 4. 创建索引（优化查询性能）

-- 商品表索引
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_sort_order ON products(sort_order);

-- 库存表索引
CREATE INDEX idx_inventory_stock_quantity ON inventory(stock_quantity);
CREATE INDEX idx_inventory_last_updated ON inventory(last_updated);

-- 订单表索引
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);

-- 订单详情表索引
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- 配送地址表索引
CREATE INDEX idx_delivery_addresses_order_id ON delivery_addresses(order_id);

-- 5. 视图（简化查询）

-- 商品详细信息视图
CREATE VIEW v_product_detail AS
SELECT
    p.id,
    p.name,
    p.description,
    p.price,
    p.original_price,
    p.images,
    p.flower_language,
    p.care_guide,
    p.is_active,
    c.name AS category_name,
    c.type AS category_type,
    i.stock_quantity,
    i.low_stock_threshold,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN inventory i ON p.id = i.product_id;

-- 订单详细信息视图
CREATE VIEW v_order_detail AS
SELECT
    o.id,
    o.order_no,
    o.customer_name,
    o.customer_phone,
    o.total_amount,
    o.delivery_fee,
    o.final_amount,
    o.status,
    o.payment_method,
    o.payment_status,
    o.delivery_address,
    o.delivery_time,
    o.notes,
    o.created_at,
    o.updated_at,
    COUNT(oi.id) AS item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- 6. 数据完整性检查

SELECT '数据库初始化完成' AS message;
SELECT '分类表记录数' AS table_name, COUNT(*) AS record_count FROM categories;
SELECT '用户表记录数' AS table_name, COUNT(*) AS record_count FROM users;

-- =============================================
-- 初始化完成说明
-- =============================================
-- 1. 数据库: flower_shop 已创建
-- 2. 7个核心数据表已创建
-- 3. 初始数据已插入（7个分类 + 1个管理员）
-- 4. 性能优化索引已创建
-- 5. 业务查询视图已创建
-- 6. 默认管理员账号: admin / admin123
-- =============================================