-- UTILITIES: Helpful queries for debugging

-- Check current user
SELECT auth.uid() as my_user_id, auth.email() as my_email;

-- View all users and their roles
SELECT u.id, u.email, ur.role 
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;

-- Check if user is admin
SELECT * FROM user_roles WHERE user_id = auth.uid();

-- View all orders with user info
SELECT o.id, o.total, o.status, o.created_at, u.email
FROM orders o
JOIN auth.users u ON o.user_id = u.id
ORDER BY o.created_at DESC;

-- View products with low stock
SELECT name, stock, category 
FROM products 
WHERE stock < 10
ORDER BY stock ASC;

-- Count total orders and revenue
SELECT 
  COUNT(*) as total_orders,
  SUM(total) as total_revenue
FROM orders;
