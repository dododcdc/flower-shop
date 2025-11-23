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

-- 从现有JSON格式的images字段中迁移数据到新表
-- 注意：这个脚本需要在应用代码完成重构后运行，需要通过应用程序实现

-- 1. 将现有图片数据迁移到新表（通过应用程序代码实现）：
-- a) 遍历所有商品
-- b) 解析JSON格式的images字段
-- c) 根据主图和副图信息创建对应的product_images记录

-- 2. 备份原表结构
ALTER TABLE products RENAME COLUMN images TO images_backup;

-- 3. 验证数据迁移完成并验证应用功能后，可以删除备份字段
-- ALTER TABLE products DROP COLUMN images_backup;

-- 查询验证：检查迁移结果
SELECT 
    p.id,
    p.name,
    pi.image_path,
    pi.image_type
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
ORDER BY p.id, pi.image_type, pi.sort_order;