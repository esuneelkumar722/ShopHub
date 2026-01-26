-- Migration: Add product images table and discount codes
-- Run this in your Supabase SQL Editor

-- 1. Create product_images table for multiple images per product
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- 2. Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for code lookup
CREATE INDEX idx_discount_codes_code ON discount_codes(code);

-- 3. Create order_discounts table to track discount usage
CREATE TABLE IF NOT EXISTS order_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id),
  discount_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_discounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Product images: everyone can read
CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT
  USING (true);

-- Product images: only admins can insert/update/delete
CREATE POLICY "Admins can manage product images"
  ON product_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Discount codes: everyone can read active codes
CREATE POLICY "Anyone can view active discount codes"
  ON discount_codes FOR SELECT
  USING (is_active = true);

-- Discount codes: only admins can manage
CREATE POLICY "Admins can manage discount codes"
  ON discount_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Order discounts: users can view their own
CREATE POLICY "Users can view their order discounts"
  ON order_discounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_discounts.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Order discounts: authenticated users can insert
CREATE POLICY "Authenticated users can create order discounts"
  ON order_discounts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Add Supabase Storage bucket for product images (run this separately)
-- Go to Supabase Dashboard > Storage > Create bucket: 'product-images' (public)

-- 5. Insert sample discount codes
INSERT INTO discount_codes (code, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, valid_until)
VALUES
  ('WELCOME10', 'percentage', 10.00, 50.00, 50.00, 100, NOW() + INTERVAL '30 days'),
  ('SAVE20', 'percentage', 20.00, 100.00, 100.00, 50, NOW() + INTERVAL '30 days'),
  ('FREESHIP', 'fixed', 10.00, 0.00, NULL, NULL, NOW() + INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE product_images IS 'Stores multiple images per product for carousel/gallery';
COMMENT ON TABLE discount_codes IS 'Discount/coupon codes for promotional campaigns';
COMMENT ON TABLE order_discounts IS 'Tracks which discounts were applied to which orders';
