-- Add more products and new categories (Books, Sports)
-- Run this to expand the product catalog for better pagination testing

INSERT INTO products (name, description, price, category, image_url, stock, rating, reviews_count) VALUES
-- Electronics (adding more)
('AirPods Pro 2', 'Active noise cancellation wireless earbuds with spatial audio', 249.00, 'electronics', 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400', 150, 4.8, 1023),
('iPad Air', 'Powerful tablet with M1 chip and 10.9-inch display', 599.00, 'electronics', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', 80, 4.7, 678),
('Canon EOS R6', 'Full-frame mirrorless camera for professional photography', 2499.00, 'electronics', 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400', 20, 4.9, 234),
('Logitech MX Master 3', 'Advanced wireless mouse for power users', 99.00, 'electronics', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400', 200, 4.6, 892),
('Dell UltraSharp Monitor', '27-inch 4K USB-C monitor with HDR', 699.00, 'electronics', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', 45, 4.7, 456),

-- Clothing (adding more)
('Patagonia Fleece', 'Warm and sustainable outdoor fleece jacket', 169.00, 'clothing', 'https://images.unsplash.com/photo-1548126032-079b6b616a49?w=400', 95, 4.8, 543),
('Ray-Ban Sunglasses', 'Classic aviator sunglasses with UV protection', 154.00, 'clothing', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', 180, 4.5, 789),
('Timex Watch', 'Classic analog watch with leather strap', 89.00, 'clothing', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400', 120, 4.4, 234),
('Under Armour T-Shirt', 'Moisture-wicking performance athletic shirt', 29.00, 'clothing', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400', 300, 4.3, 1234),
('Carhartt Work Pants', 'Durable canvas work pants with reinforced knees', 54.00, 'clothing', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400', 150, 4.6, 567),

-- Home (adding more)
('Roomba Robot Vacuum', 'Smart robot vacuum with app control and mapping', 449.00, 'home', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400', 60, 4.7, 892),
('Instant Pot Duo', '7-in-1 programmable pressure cooker', 89.00, 'home', 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400', 200, 4.8, 3456),
('Keurig Coffee Maker', 'Single-serve K-Cup pod coffee maker', 129.00, 'home', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400', 150, 4.5, 1234),
('Shark Air Purifier', 'HEPA air purifier with odor neutralizer', 199.00, 'home', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400', 75, 4.6, 678),

-- Books (new category)
('Atomic Habits', 'Tiny changes, remarkable results by James Clear', 16.99, 'books', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 500, 4.9, 8923),
('The Psychology of Money', 'Timeless lessons on wealth by Morgan Housel', 14.99, 'books', 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400', 400, 4.8, 5678),
('Thinking Fast and Slow', 'Daniel Kahneman explores the two systems of thinking', 17.99, 'books', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400', 300, 4.7, 3456),
('Clean Code', 'A handbook of agile software craftsmanship', 42.99, 'books', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', 250, 4.9, 2345),
('The Lean Startup', 'How constant innovation creates successful businesses', 26.99, 'books', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400', 350, 4.6, 1890),
('Sapiens', 'A brief history of humankind by Yuval Noah Harari', 18.99, 'books', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 450, 4.8, 6789),

-- Sports (new category)
('Yoga Mat Premium', 'Non-slip exercise mat with carrying strap', 34.99, 'sports', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', 200, 4.7, 892),
('Adjustable Dumbbells', 'Space-saving 5-52.5 lbs adjustable weights', 299.00, 'sports', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', 80, 4.8, 567),
('Resistance Bands Set', 'Set of 5 exercise resistance bands with handles', 24.99, 'sports', 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400', 300, 4.5, 1234),
('Fitbit Charge 6', 'Advanced fitness tracker with GPS and heart rate', 159.00, 'sports', 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400', 150, 4.6, 2345),
('Running Shoes', 'Lightweight cushioned running shoes for marathons', 129.00, 'sports', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 180, 4.7, 3456),
('Water Bottle Insulated', '32oz stainless steel vacuum insulated bottle', 29.99, 'sports', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 400, 4.8, 5678),
('Foam Roller', 'High-density foam roller for muscle recovery', 19.99, 'sports', 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400', 250, 4.5, 890);
