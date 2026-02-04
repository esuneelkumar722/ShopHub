-- ============================================
-- ADD MULTIPLE IMAGES FOR ALL EXISTING PRODUCTS
-- ============================================
-- This script adds 4 high-quality images for each product
-- Run this directly in Supabase SQL Editor
-- All images are from Unsplash and work immediately!

-- ============================================
-- ELECTRONICS PRODUCTS
-- ============================================

-- iPhone 15 Pro
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', 0, true FROM products WHERE name = 'iPhone 15 Pro'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1695653422715-991ec3a0db8b?w=800', 1, false FROM products WHERE name = 'iPhone 15 Pro'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1678685888221-cda930d3c3b5?w=800', 2, false FROM products WHERE name = 'iPhone 15 Pro'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1592286927505-675a0e44abec?w=800', 3, false FROM products WHERE name = 'iPhone 15 Pro';

-- MacBook Pro 16"
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 0, true FROM products WHERE name = 'MacBook Pro 16"'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', 1, false FROM products WHERE name = 'MacBook Pro 16"'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800', 2, false FROM products WHERE name = 'MacBook Pro 16"'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800', 3, false FROM products WHERE name = 'MacBook Pro 16"';

-- Sony WH-1000XM5
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800', 0, true FROM products WHERE name = 'Sony WH-1000XM5'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 1, false FROM products WHERE name = 'Sony WH-1000XM5'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800', 2, false FROM products WHERE name = 'Sony WH-1000XM5'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800', 3, false FROM products WHERE name = 'Sony WH-1000XM5';

-- Samsung 65" QLED TV
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', 0, true FROM products WHERE name = 'Samsung 65" QLED TV'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&fit=crop&crop=left', 1, false FROM products WHERE name = 'Samsung 65" QLED TV'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800', 2, false FROM products WHERE name = 'Samsung 65" QLED TV'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1571863533956-01c88e79957e?w=800', 3, false FROM products WHERE name = 'Samsung 65" QLED TV';

-- AirPods Pro 2
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800', 0, true FROM products WHERE name = 'AirPods Pro 2'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', 1, false FROM products WHERE name = 'AirPods Pro 2'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1625240062269-25fd76c1c9e8?w=800', 2, false FROM products WHERE name = 'AirPods Pro 2'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800', 3, false FROM products WHERE name = 'AirPods Pro 2';

-- iPad Air
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 0, true FROM products WHERE name = 'iPad Air'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1585790050230-5dd28404f1e9?w=800', 1, false FROM products WHERE name = 'iPad Air'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 2, false FROM products WHERE name = 'iPad Air'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1544244015-9c72fd9dc01a?w=800', 3, false FROM products WHERE name = 'iPad Air';

-- Canon EOS R6
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800', 0, true FROM products WHERE name = 'Canon EOS R6'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800', 1, false FROM products WHERE name = 'Canon EOS R6'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800', 2, false FROM products WHERE name = 'Canon EOS R6'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', 3, false FROM products WHERE name = 'Canon EOS R6';

-- Logitech MX Master 3
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800', 0, true FROM products WHERE name = 'Logitech MX Master 3'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800', 1, false FROM products WHERE name = 'Logitech MX Master 3'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1586920740099-cd826f33d86e?w=800', 2, false FROM products WHERE name = 'Logitech MX Master 3'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=800', 3, false FROM products WHERE name = 'Logitech MX Master 3';

-- Dell UltraSharp Monitor
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', 0, true FROM products WHERE name = 'Dell UltraSharp Monitor'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800', 1, false FROM products WHERE name = 'Dell UltraSharp Monitor'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800', 2, false FROM products WHERE name = 'Dell UltraSharp Monitor'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800', 3, false FROM products WHERE name = 'Dell UltraSharp Monitor';

-- ============================================
-- CLOTHING PRODUCTS
-- ============================================

-- Nike Air Max 270
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 0, true FROM products WHERE name = 'Nike Air Max 270'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800', 1, false FROM products WHERE name = 'Nike Air Max 270'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800', 2, false FROM products WHERE name = 'Nike Air Max 270'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800', 3, false FROM products WHERE name = 'Nike Air Max 270';

-- Levi's 501 Original Jeans
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', 0, true FROM products WHERE name LIKE 'Levi%501%'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800', 1, false FROM products WHERE name LIKE 'Levi%501%'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800', 2, false FROM products WHERE name LIKE 'Levi%501%'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800', 3, false FROM products WHERE name LIKE 'Levi%501%';

-- North Face Jacket
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', 0, true FROM products WHERE name = 'North Face Jacket'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1548126032-079b6b616a49?w=800', 1, false FROM products WHERE name = 'North Face Jacket'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800', 2, false FROM products WHERE name = 'North Face Jacket'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1608827878522-dde7c71b1b50?w=800', 3, false FROM products WHERE name = 'North Face Jacket';

-- Adidas Ultraboost
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800', 0, true FROM products WHERE name = 'Adidas Ultraboost'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800', 1, false FROM products WHERE name = 'Adidas Ultraboost'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800', 2, false FROM products WHERE name = 'Adidas Ultraboost'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800', 3, false FROM products WHERE name = 'Adidas Ultraboost';

-- Patagonia Fleece
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1548126032-079b6b616a49?w=800', 0, true FROM products WHERE name = 'Patagonia Fleece'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800', 1, false FROM products WHERE name = 'Patagonia Fleece'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800', 2, false FROM products WHERE name = 'Patagonia Fleece'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800', 3, false FROM products WHERE name = 'Patagonia Fleece';

-- Ray-Ban Sunglasses
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800', 0, true FROM products WHERE name = 'Ray-Ban Sunglasses'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800', 1, false FROM products WHERE name = 'Ray-Ban Sunglasses'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800', 2, false FROM products WHERE name = 'Ray-Ban Sunglasses'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800', 3, false FROM products WHERE name = 'Ray-Ban Sunglasses';

-- Timex Watch
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800', 0, true FROM products WHERE name = 'Timex Watch'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 1, false FROM products WHERE name = 'Timex Watch'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1587836374776-4b57446a98f0?w=800', 2, false FROM products WHERE name = 'Timex Watch'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800', 3, false FROM products WHERE name = 'Timex Watch';

-- Under Armour T-Shirt
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800', 0, true FROM products WHERE name = 'Under Armour T-Shirt'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 1, false FROM products WHERE name = 'Under Armour T-Shirt'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800', 2, false FROM products WHERE name = 'Under Armour T-Shirt'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800', 3, false FROM products WHERE name = 'Under Armour T-Shirt';

-- Carhartt Work Pants
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800', 0, true FROM products WHERE name = 'Carhartt Work Pants'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800', 1, false FROM products WHERE name = 'Carhartt Work Pants'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800', 2, false FROM products WHERE name = 'Carhartt Work Pants'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1624378441864-6eda7eac51cb?w=800', 3, false FROM products WHERE name = 'Carhartt Work Pants';

-- ============================================
-- HOME PRODUCTS
-- ============================================

-- Dyson V15 Vacuum
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800', 0, true FROM products WHERE name = 'Dyson V15 Vacuum'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800', 1, false FROM products WHERE name = 'Dyson V15 Vacuum'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800', 2, false FROM products WHERE name = 'Dyson V15 Vacuum'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800', 3, false FROM products WHERE name = 'Dyson V15 Vacuum';

-- KitchenAid Stand Mixer
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1594385208974-2e75f8762dfd?w=800', 0, true FROM products WHERE name = 'KitchenAid Stand Mixer'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1574270362259-c0c7870833cb?w=800', 1, false FROM products WHERE name = 'KitchenAid Stand Mixer'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1556910633-5099dc3971e8?w=800', 2, false FROM products WHERE name = 'KitchenAid Stand Mixer'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800', 3, false FROM products WHERE name = 'KitchenAid Stand Mixer';

-- Nest Thermostat
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800', 0, true FROM products WHERE name = 'Nest Thermostat'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800', 1, false FROM products WHERE name = 'Nest Thermostat'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1558089588-569f8b5e1b8e?w=800', 2, false FROM products WHERE name = 'Nest Thermostat'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800', 3, false FROM products WHERE name = 'Nest Thermostat';

-- Philips Hue Starter Kit
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800', 0, true FROM products WHERE name = 'Philips Hue Starter Kit'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800', 1, false FROM products WHERE name = 'Philips Hue Starter Kit'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800', 2, false FROM products WHERE name = 'Philips Hue Starter Kit'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800', 3, false FROM products WHERE name = 'Philips Hue Starter Kit';

-- Roomba Robot Vacuum
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800', 0, true FROM products WHERE name = 'Roomba Robot Vacuum'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800', 1, false FROM products WHERE name = 'Roomba Robot Vacuum'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800', 2, false FROM products WHERE name = 'Roomba Robot Vacuum'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800', 3, false FROM products WHERE name = 'Roomba Robot Vacuum';

-- Instant Pot Duo
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800', 0, true FROM products WHERE name = 'Instant Pot Duo'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800', 1, false FROM products WHERE name = 'Instant Pot Duo'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&fit=crop&crop=left', 2, false FROM products WHERE name = 'Instant Pot Duo'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800', 3, false FROM products WHERE name = 'Instant Pot Duo';

-- Keurig Coffee Maker
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800', 0, true FROM products WHERE name = 'Keurig Coffee Maker'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800', 1, false FROM products WHERE name = 'Keurig Coffee Maker'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', 2, false FROM products WHERE name = 'Keurig Coffee Maker'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800', 3, false FROM products WHERE name = 'Keurig Coffee Maker';

-- Shark Air Purifier
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800', 0, true FROM products WHERE name = 'Shark Air Purifier'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800', 1, false FROM products WHERE name = 'Shark Air Purifier'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800', 2, false FROM products WHERE name = 'Shark Air Purifier'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1574270362259-c0c7870833cb?w=800', 3, false FROM products WHERE name = 'Shark Air Purifier';

-- ============================================
-- BOOKS
-- ============================================

-- Atomic Habits
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 0, true FROM products WHERE name = 'Atomic Habits'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800', 1, false FROM products WHERE name = 'Atomic Habits'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800', 2, false FROM products WHERE name = 'Atomic Habits'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800', 3, false FROM products WHERE name = 'Atomic Habits';

-- The Psychology of Money
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=800', 0, true FROM products WHERE name = 'The Psychology of Money'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800', 1, false FROM products WHERE name = 'The Psychology of Money'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800', 2, false FROM products WHERE name = 'The Psychology of Money'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800', 3, false FROM products WHERE name = 'The Psychology of Money';

-- Thinking Fast and Slow
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800', 0, true FROM products WHERE name = 'Thinking Fast and Slow'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 1, false FROM products WHERE name = 'Thinking Fast and Slow'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800', 2, false FROM products WHERE name = 'Thinking Fast and Slow'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800', 3, false FROM products WHERE name = 'Thinking Fast and Slow';

-- Clean Code
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800', 0, true FROM products WHERE name = 'Clean Code'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=800', 1, false FROM products WHERE name = 'Clean Code'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800', 2, false FROM products WHERE name = 'Clean Code'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', 3, false FROM products WHERE name = 'Clean Code';

-- The Lean Startup
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800', 0, true FROM products WHERE name = 'The Lean Startup'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800', 1, false FROM products WHERE name = 'The Lean Startup'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800', 2, false FROM products WHERE name = 'The Lean Startup'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', 3, false FROM products WHERE name = 'The Lean Startup';

-- Sapiens
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800', 0, true FROM products WHERE name = 'Sapiens'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 1, false FROM products WHERE name = 'Sapiens'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800', 2, false FROM products WHERE name = 'Sapiens'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800', 3, false FROM products WHERE name = 'Sapiens';

-- ============================================
-- SPORTS
-- ============================================

-- Yoga Mat Premium
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800', 0, true FROM products WHERE name = 'Yoga Mat Premium'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800', 1, false FROM products WHERE name = 'Yoga Mat Premium'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', 2, false FROM products WHERE name = 'Yoga Mat Premium'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800', 3, false FROM products WHERE name = 'Yoga Mat Premium';

-- Adjustable Dumbbells
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', 0, true FROM products WHERE name = 'Adjustable Dumbbells'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800', 1, false FROM products WHERE name = 'Adjustable Dumbbells'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800', 2, false FROM products WHERE name = 'Adjustable Dumbbells'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&fit=crop&crop=right', 3, false FROM products WHERE name = 'Adjustable Dumbbells';

-- Resistance Bands Set
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800', 0, true FROM products WHERE name = 'Resistance Bands Set'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1593476087123-36d1de271f08?w=800', 1, false FROM products WHERE name = 'Resistance Bands Set'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', 2, false FROM products WHERE name = 'Resistance Bands Set'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&fit=crop&crop=left', 3, false FROM products WHERE name = 'Resistance Bands Set';

-- Fitbit Charge 6
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800', 0, true FROM products WHERE name = 'Fitbit Charge 6'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1557935728-e6d1eaabe558?w=800', 1, false FROM products WHERE name = 'Fitbit Charge 6'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800', 2, false FROM products WHERE name = 'Fitbit Charge 6'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800', 3, false FROM products WHERE name = 'Fitbit Charge 6';

-- Running Shoes
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 0, true FROM products WHERE name = 'Running Shoes'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop&crop=top', 1, false FROM products WHERE name = 'Running Shoes'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800', 2, false FROM products WHERE name = 'Running Shoes'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800', 3, false FROM products WHERE name = 'Running Shoes';

-- Water Bottle Insulated
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800', 0, true FROM products WHERE name = 'Water Bottle Insulated'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800', 1, false FROM products WHERE name = 'Water Bottle Insulated'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=800', 2, false FROM products WHERE name = 'Water Bottle Insulated'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800', 3, false FROM products WHERE name = 'Water Bottle Insulated';

-- Foam Roller
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800', 0, true FROM products WHERE name = 'Foam Roller'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1593476087123-36d1de271f08?w=800', 1, false FROM products WHERE name = 'Foam Roller'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800', 2, false FROM products WHERE name = 'Foam Roller'
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', 3, false FROM products WHERE name = 'Foam Roller';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check total images added
-- SELECT COUNT(*) as total_images FROM product_images;

-- Check which products have images
-- SELECT p.name, p.category, COUNT(pi.id) as image_count
-- FROM products p
-- LEFT JOIN product_images pi ON p.id = pi.product_id
-- GROUP BY p.id, p.name, p.category
-- ORDER BY p.category, p.name;

-- Check images for a specific product
-- SELECT pi.*, p.name
-- FROM product_images pi
-- JOIN products p ON pi.product_id = p.id
-- WHERE p.name = 'iPhone 15 Pro'
-- ORDER BY pi.display_order;
