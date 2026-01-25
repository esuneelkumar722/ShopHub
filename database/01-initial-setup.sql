-- 1. INITIAL DATABASE SETUP
-- Run this first to create all tables and base security policies

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);

CREATE POLICY "Users can read own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart" ON cart_items FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create order items for their own orders" 
ON order_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read own order items" ON order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

INSERT INTO products (name, description, price, category, image_url, stock, rating, reviews_count) VALUES
('iPhone 15 Pro', 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system', 999.00, 'electronics', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', 50, 4.8, 234),
('MacBook Pro 16"', 'Powerful laptop with M3 Max chip, 16" Liquid Retina XDR display', 2499.00, 'electronics', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 30, 4.9, 189),
('Sony WH-1000XM5', 'Industry-leading noise canceling wireless headphones', 399.00, 'electronics', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', 100, 4.7, 567),
('Samsung 65" QLED TV', '4K Smart TV with Quantum HDR and AI upscaling', 1299.00, 'electronics', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', 25, 4.6, 143),
('Nike Air Max 270', 'Comfortable running shoes with Max Air cushioning', 150.00, 'clothing', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 200, 4.5, 892),
('Levi''s 501 Original Jeans', 'Classic straight fit jeans, 100% cotton', 69.00, 'clothing', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 150, 4.4, 456),
('North Face Jacket', 'Waterproof winter jacket with insulation', 249.00, 'clothing', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 75, 4.7, 234),
('Adidas Ultraboost', 'Premium running shoes with Boost technology', 180.00, 'clothing', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400', 120, 4.6, 678),
('Dyson V15 Vacuum', 'Cordless vacuum with laser dust detection', 649.00, 'home', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400', 40, 4.8, 321),
('KitchenAid Stand Mixer', 'Professional 5-quart stand mixer for baking', 379.00, 'home', 'https://images.unsplash.com/photo-1594385208974-2e75f8762dfd?w=400', 60, 4.9, 445),
('Nest Thermostat', 'Smart thermostat with energy-saving features', 249.00, 'home', 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=400', 80, 4.5, 234),
('Philips Hue Starter Kit', 'Smart LED bulbs with color changing and app control', 199.00, 'home', 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400', 100, 4.6, 567);
