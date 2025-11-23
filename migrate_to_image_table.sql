-- 创建商品图片表
CREATE TABLE product_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL COMMENT '商品ID',
    image_path VARCHAR(500) NOT NULL COMMENT '图片路径',
    image_type TINYINT DEFAULT 2 COMMENT '图片类型: 1-主图, 2-副图',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 从现有的images JSON字段中迁移数据到新表
-- 需要通过应用程序来完成数据迁移

-- 删除原表中的images字段
-- ALTER TABLE products DROP COLUMN images;