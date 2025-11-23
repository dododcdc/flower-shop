-- 简化的图片数据迁移脚本
-- 将数组格式转换为主副图格式

-- 备份现有数据
CREATE TABLE IF NOT EXISTS products_images_backup AS
SELECT id, name, images FROM products WHERE images IS NOT NULL;

-- 更新单张图片的商品
UPDATE products
SET images = JSON_OBJECT('main', JSON_UNQUOTE(JSON_EXTRACT(images, '$[0]')), 'subImages', JSON_ARRAY())
WHERE images IS NOT NULL
AND JSON_TYPE(images) = 'ARRAY'
AND JSON_LENGTH(images) = 1;

-- 更新多张图片的商品（第一张为主图，其余为副图）
UPDATE products
SET images = JSON_OBJECT(
    'main', JSON_UNQUOTE(JSON_EXTRACT(images, '$[0]')),
    'subImages', JSON_ARRAY(
        JSON_UNQUOTE(JSON_EXTRACT(images, '$[1]')),
        JSON_UNQUOTE(JSON_EXTRACT(images, '$[2]')),
        JSON_UNQUOTE(JSON_EXTRACT(images, '$[3]')),
        JSON_UNQUOTE(JSON_EXTRACT(images, '$[4]')),
        JSON_UNQUOTE(JSON_EXTRACT(images, '$[5]')),
        JSON_UNQUOTE(JSON_EXTRACT(images, '$[6]')),
        JSON_UNQUOTE(JSON_EXTRACT(images, '$[7]')),
        JSON_UNQUOTE(JSON_EXTRACT(images, '$[8]'))
    )
)
WHERE images IS NOT NULL
AND JSON_TYPE(images) = 'ARRAY'
AND JSON_LENGTH(images) > 1;

-- 验证迁移结果
SELECT
    id,
    name,
    JSON_TYPE(images) as type,
    JSON_EXTRACT(images, '$.main') as main_image,
    JSON_EXTRACT(images, '$.subImages') as sub_images
FROM products
WHERE images IS NOT NULL
LIMIT 10;