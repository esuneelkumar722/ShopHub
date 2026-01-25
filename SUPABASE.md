# Supabase Database Setup

## Overview
This project uses Supabase as the backend database for ShopHub e-commerce application. The database includes tables for products, shopping carts, orders, and user roles with Row Level Security policies.

## Database Tables

### Core Tables
- **products**: Store product catalog with name, price, category, images, and stock
- **cart_items**: User shopping cart items linked to products
- **orders**: Order records with total amount and status
- **order_items**: Individual items within each order
- **user_roles**: User permission levels (admin or regular user)

### Relationships
- cart_items links to users and products
- orders links to users
- order_items links to orders and products
- user_roles links to users

## Setup Instructions

### Step 1: Initial Database Setup
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Run `database/01-initial-setup.sql`
4. This creates all tables, security policies, and inserts 12 sample products

### Step 2: Admin Role Setup
1. In SQL Editor, run `database/02-admin-setup.sql`
2. This creates the user_roles table and admin permissions

### Step 3: Make Your User Admin
1. Run the first query in `database/03-make-admin.sql` to get your user ID
2. Copy your user ID from the results
3. Replace YOUR_USER_ID in the INSERT statement with your actual ID
4. Run the modified INSERT statement
5. Verify with the SELECT query

### Step 4: Configure Authentication
1. Go to Authentication > Providers > Email
2. Disable "Confirm email" for easier testing
3. Keep it enabled in production

## Security Policies

### Products
- Anyone can view products
- Only admins can create, update, or delete products

### Cart Items
- Users can only see and manage their own cart items
- Automatic deletion when user is deleted

### Orders
- Users can only see their own orders
- Users can create orders for themselves
- Admins can view all orders and update status

### Order Items
- Users can create items for their own orders
- Users can only view items from their own orders
- Admins can view all order items

### User Roles
- Users can read their own role
- Role assignment managed manually via SQL

## Troubleshooting

### Infinite Recursion Error
If you see "infinite recursion detected in policy" error:
1. Run `database/troubleshooting-infinite-recursion.sql`
2. This removes problematic recursive policies
3. Refresh your application

### Access Denied for Admin Panel
1. Check if your user has admin role: Run utilities.sql query
2. Verify role is set to 'admin' not 'user'
3. If needed, update role: `UPDATE user_roles SET role = 'admin' WHERE user_id = 'YOUR_ID';`
4. Hard refresh browser (Ctrl+Shift+R)

### Email Rate Limit
Supabase limits signup emails to prevent abuse:
- Free tier: approximately 1-2 signups per minute per IP
- Solution: Use Supabase Dashboard > Authentication > Users > Add User
- Or wait 60 seconds between signup attempts

## Useful Queries

See `database/utilities.sql` for helpful queries:
- Check current logged-in user
- View all users and their roles
- List all orders with user information
- Find products with low stock
- Calculate total orders and revenue

## Environment Variables

Ensure your `.env` file contains:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from Supabase Dashboard > Settings > API

## Database Schema Updates

To modify the schema:
1. Create a new migration SQL file
2. Test in development environment first
3. Run migrations in production during low-traffic periods
4. Always backup database before major changes

## Backup and Recovery

Supabase automatically backs up your database:
- Point-in-time recovery available on paid plans
- Export data via Dashboard > Table Editor > Export
- Use pg_dump for complete backups

## Performance Tips

1. Index frequently queried columns
2. Use pagination for large result sets
3. Enable database connection pooling
4. Monitor query performance in Supabase Dashboard
5. Use database functions for complex operations

## Support

For issues:
- Check Supabase documentation: https://supabase.com/docs
- Review RLS policies in Dashboard > Authentication > Policies
- Check logs in Dashboard > Logs
- Verify API keys are correct and not expired
