# Supabase Database Setup Guide

## What is Supabase

Supabase is an open-source backend-as-a-service platform that provides a complete backend solution for web applications. It includes a PostgreSQL database, authentication, real-time subscriptions, storage, and edge functions. Supabase offers a generous free tier suitable for development and small projects.

## Why We Use Supabase

ShopHub uses Supabase for several key reasons:

- Provides a fully managed PostgreSQL database without server setup
- Built-in authentication with multiple providers (email, OAuth, etc.)
- Row Level Security for data access control
- Real-time subscriptions for live data updates
- RESTful API automatically generated from database schema
- Free SSL certificates and automatic backups
- Easy-to-use dashboard for database management
- Excellent TypeScript support

## Creating a Supabase Account

1. Visit https://supabase.com
2. Click on "Start your project" button
3. Sign up using GitHub, Google, or email
4. Verify your email address if using email signup
5. You will be redirected to your dashboard

## Creating Your First Project

1. From the Supabase dashboard, click "New project"
2. Choose your organization or create a new one
3. Enter a project name (example: shophub-dev)
4. Create a secure database password and save it safely
5. Select a region closest to your users
6. Click "Create new project"
7. Wait 2-3 minutes for project initialization

## Getting Your API Keys

After project creation:

1. Go to Project Settings (gear icon in sidebar)
2. Navigate to API section
3. Copy the following values:
   - Project URL (looks like: https://xxxxx.supabase.co)
   - anon public key (starts with: eyJhbGciOiJIUzI1...)
4. Add these to your .env file:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Setting Up Database Tables

ShopHub includes pre-written SQL migration files in the database folder. Follow these steps in order:

### Step 1: Initial Setup

1. Open your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query" button
4. Open the file database/01-initial-setup.sql from your project
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click "Run" button
8. This creates all core tables and 12 sample products

### Step 2: Admin Setup

1. In SQL Editor, create a new query
2. Open database/02-admin-setup.sql
3. Copy and paste the contents
4. Run the query
5. This creates the user_roles table for admin permissions

### Step 3: Make Yourself Admin

1. First, sign up for an account in your ShopHub application
2. Open database/03-make-admin.sql
3. Run the first SELECT query to get your user ID
4. Copy your user ID from the results
5. Replace YOUR_USER_ID in the INSERT statement with your actual ID
6. Run the modified INSERT statement
7. Verify with the final SELECT query

### Step 4: Additional Tables (Optional)

Continue with the remaining SQL files in numerical order:

- 04-add-more-products.sql - Adds 27 more products
- 05-wishlist.sql - Creates wishlist functionality
- 06-recommendations.sql - Adds product recommendations
- 07-user-preferences.sql - User settings storage
- 08-images-discounts.sql - Image galleries and discount codes
- 09-add-sample-images.sql - Sample images for testing
- 10-add-all-product-images.sql - Complete image gallery data

Run each file in the SQL Editor the same way as the initial setup.

## Configuring Authentication

1. Go to Authentication section in sidebar
2. Click on "Providers"
3. Select "Email" provider
4. For development, you can disable "Confirm email" to skip email verification
5. Keep email confirmation enabled for production
6. Save changes

## Understanding Row Level Security

Supabase uses Row Level Security (RLS) to control data access:

- Users can only see their own cart items and orders
- Anyone can view products, but only admins can modify them
- Admins can view and manage all orders
- All security policies are defined in the SQL files

## Database Schema Overview

The database includes these main tables:

- products: Product catalog with prices and descriptions
- cart_items: User shopping carts
- orders: Order records with totals and status
- order_items: Individual items in each order
- user_roles: Admin and user permissions
- wishlist: Saved products for users
- product_images: Multiple images per product
- discount_codes: Promotional codes

### Core Tables Details

**products**
- Stores product catalog information
- Fields: id, name, description, price, category, image_url, stock, rating, reviews_count
- Anyone can view products
- Only admins can create, update, or delete products

**cart_items**
- User shopping cart items linked to products
- Fields: id, user_id, product_id, quantity, created_at
- Users can only see and manage their own cart items
- Automatic deletion when user is deleted

**orders**
- Order records with total amount and status
- Fields: id, user_id, total, status, created_at
- Users can only see their own orders
- Users can create orders for themselves
- Admins can view all orders and update status

**order_items**
- Individual items within each order
- Fields: id, order_id, product_id, quantity, price
- Users can create items for their own orders
- Users can only view items from their own orders
- Admins can view all order items

**user_roles**
- User permission levels (admin or regular user)
- Fields: id, user_id, role, created_at
- Users can read their own role
- Role assignment managed manually via SQL

**wishlist**
- Saved products for later purchase
- Fields: id, user_id, product_id, created_at
- Users can only manage their own wishlist
- Automatically removes items when product is deleted

**product_images**
- Multiple images per product for galleries
- Fields: id, product_id, image_url, display_order, is_primary
- Anyone can view images
- Only admins can manage images

**discount_codes**
- Promotional codes for discounts
- Fields: id, code, discount_type, discount_value, min_purchase, max_uses, valid_from, valid_until
- Anyone can view active discount codes
- Only admins can create and manage codes

### Table Relationships

- cart_items links to users and products
- orders links to users
- order_items links to orders and products
- user_roles links to users
- wishlist links to users and products
- product_images links to products
- order_discounts links to orders and discount_codes

### Row Level Security Policies

ShopHub uses Row Level Security to control data access:

**Products Policies**
- SELECT: Public access, anyone can view products
- INSERT: Admin only
- UPDATE: Admin only
- DELETE: Admin only

**Cart Items Policies**
- SELECT: Users can only see their own cart items
- INSERT: Users can only add to their own cart
- UPDATE: Users can only update their own cart items
- DELETE: Users can only delete their own cart items

**Orders Policies**
- SELECT: Users can see their own orders, admins can see all
- INSERT: Users can create orders for themselves
- UPDATE: Admins can update order status
- DELETE: Restricted

**Order Items Policies**
- SELECT: Users can see items from their own orders
- INSERT: Users can create items for their own orders
- UPDATE: Restricted
- DELETE: Restricted

**User Roles Policies**
- SELECT: Users can read their own role
- INSERT: Admin manual assignment only
- UPDATE: Admin only
- DELETE: Admin only

**Wishlist Policies**
- SELECT: Users can see their own wishlist
- INSERT: Users can add to their own wishlist
- UPDATE: Users can update their own wishlist
- DELETE: Users can remove from their own wishlist

**Product Images Policies**
- SELECT: Public access
- INSERT: Admin only
- UPDATE: Admin only
- DELETE: Admin only

**Discount Codes Policies**
- SELECT: Public can view active codes
- INSERT: Admin only
- UPDATE: Admin only
- DELETE: Admin only

## Testing Your Database

After setup, you can test your database:

1. Go to Table Editor in Supabase dashboard
2. Click on "products" table
3. You should see 12 sample products
4. Try filtering and searching
5. Visit your ShopHub application
6. Products should load on the homepage

## Common Issues and Solutions

### Cannot See Products
- Check if 01-initial-setup.sql ran successfully
- Verify your API keys in .env file are correct
- Check browser console for errors

### Admin Panel Not Accessible
- Run 02-admin-setup.sql
- Run 03-make-admin.sql with your user ID
- Log out and log back in to refresh permissions

### Email Rate Limit During Testing
- Supabase limits signups to prevent abuse
- Wait 60 seconds between signup attempts
- Or manually create users in Authentication > Users section

## Backup and Maintenance

Supabase automatically backs up your database. To manually export:

1. Go to Table Editor
2. Select a table
3. Click the three dots menu
4. Select "Download as CSV"

## Getting Help

If you encounter issues:

- Check the Supabase documentation: https://supabase.com/docs
- Review your SQL query results for errors
- Check the Logs section in Supabase dashboard
- Verify all environment variables are set correctly
