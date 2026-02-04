-- Enable fuzzy search capabilities using PostgreSQL trigram extension
-- This allows for typo-tolerant search matching

-- Enable the pg_trgm extension for trigram-based fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create an index on product names for faster fuzzy searches
-- GIN index is optimized for trigram operations
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON products USING GIN (name gin_trgm_ops);

-- Create a stored procedure for fuzzy product search
-- This handles both exact and fuzzy matching
CREATE OR REPLACE FUNCTION search_products(
  search_term text,
  category_filter text DEFAULT '',
  sort_by text DEFAULT 'newest',
  page_limit int DEFAULT 12,
  page_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price numeric,
  image_url text,
  category text,
  rating numeric,
  reviews_count int,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.category,
    p.rating,
    p.reviews_count,
    p.created_at
  FROM products p
  WHERE 
    (category_filter = '' OR p.category = category_filter)
    AND (
      p.name ILIKE '%' || search_term || '%' 
      OR similarity(p.name, search_term) > 0.2
    )
  ORDER BY 
    CASE 
      WHEN p.name ILIKE '%' || search_term || '%' THEN 1
      WHEN similarity(p.name, search_term) > 0.2 THEN 2
      ELSE 3
    END,
    CASE 
      WHEN sort_by = 'price-asc' THEN p.price
      ELSE NULL
    END ASC,
    CASE 
      WHEN sort_by = 'price-desc' THEN p.price
      ELSE NULL
    END DESC,
    CASE 
      WHEN sort_by = 'rating' THEN p.rating
      ELSE NULL
    END DESC,
    p.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_products(text, text, text, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION search_products(text, text, text, int, int) TO anon;