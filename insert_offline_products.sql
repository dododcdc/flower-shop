-- 插入几条下架的商品数据
INSERT INTO products (name, category_id, description, price, original_price, status, featured, stock_quantity, low_stock_threshold, images, flower_language, care_guide, created_at, updated_at)
VALUES 
('蓝色妖姬', 1, '神秘的蓝色玫瑰，象征着奇迹与不可能实现的事。', 199.00, 259.00, 0, 0, 0, 5, '["/images/placeholder.jpg"]', '奇迹与不可能实现的事', '保持干燥，避免阳光直射', NOW(), NOW()),
('黑色大丽花', 3, '罕见的黑色大丽花，充满神秘感。', 88.00, 108.00, 0, 0, 10, 5, '["/images/placeholder.jpg"]', '背叛与复仇', '喜光，注意通风', NOW(), NOW()),
('枯萎的向日葵', 4, '艺术风格的干花向日葵，适合装饰。', 45.00, 60.00, 0, 0, 20, 5, '["/images/placeholder.jpg"]', '沉默的爱', '无需浇水', NOW(), NOW()),
('过季郁金香', 2, '上一季的郁金香球茎，等待下一个春天。', 25.00, 50.00, 0, 0, 100, 10, '["/images/placeholder.jpg"]', '名誉与慈善', '冷藏保存', NOW(), NOW());
