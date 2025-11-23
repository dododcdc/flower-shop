-- 清理图片数据中的错误字段
-- 移除 allImages 和 totalCount 字段，只保留 main 和 subImages

-- 更新所有有问题的记录
UPDATE products
SET images = JSON_OBJECT(
    'main', JSON_UNQUOTE(JSON_EXTRACT(images, '$.main')),
    'subImages', JSON_EXTRACT(images, '$.subImages')
)
WHERE images IS NOT NULL
AND JSON_TYPE(images) = 'OBJECT';

-- 特别修复商品ID 59
UPDATE products
SET images = JSON_OBJECT(
    'main', '/uploads/2025/11/23/d25961c86cc545d9adc7a9798a0442c0.png',
    'subImages', JSON_ARRAY()
)
WHERE id = 59;

-- 验证清理结果
SELECT
    id,
    name,
    images,
    JSON_EXTRACT(images, '$.main') as main_image,
    JSON_EXTRACT(images, '$.subImages') as sub_images
FROM products
WHERE id IN (59, 58, 57)
ORDER BY id;