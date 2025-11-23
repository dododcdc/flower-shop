-- 图片数据迁移脚本：将数组格式转换为主副图格式
-- 执行前请备份数据数据库！

-- 更新products表，将images字段从数组格式转换为主副图格式
UPDATE products
SET images = CASE
    WHEN JSON_TYPE(images) = 'ARRAY' AND JSON_LENGTH(images) > 0 THEN
        JSON_OBJECT(
            'main', JSON_UNQUOTE(JSON_EXTRACT(images, '$[0]')),
            'subImages', CASE
                WHEN JSON_LENGTH(images) > 1 THEN
                    JSON_EXTRACT(images, CONCAT('$[',
                        REPLACE(REPLACE(REPLACE(JSON_EXTRACT(JSON_KEYS(images), '$'), '[', ''), ']', ''), ',', ',$['),
                    ']'))
                ELSE JSON_ARRAY()
            END
        )
    ELSE images
END
WHERE images IS NOT NULL
AND JSON_TYPE(images) = 'ARRAY';

-- 简化版本：如果上述复杂查询有问题，使用简单的版本
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
AND JSON_LENGTH(images) > 0;

-- 验证迁移结果
SELECT
    id,
    name,
    images,
    JSON_EXTRACT(images, '$.main') as main_image,
    JSON_EXTRACT(images, '$.subImages') as sub_images,
    JSON_LENGTH(images) as array_length
FROM products
WHERE images IS NOT NULL
LIMIT 5;