# ShopHub E-Commerce Application

## Overview

ShopHub is a modern full-stack e-commerce web application built with React and TypeScript. It provides a complete online shopping experience with product browsing, cart management, secure checkout, and order tracking. The application uses Supabase for backend services and includes an admin panel for product and order management.

## What is ShopHub

ShopHub is designed to demonstrate a production-ready e-commerce platform with features including product catalog, shopping cart, user authentication, payment integration, and responsive design with dark mode support. The application follows modern web development best practices with clean architecture, accessibility standards, and performance optimizations.

## Technologies Used

### Frontend
- React 18 with TypeScript for type-safe development
- Vite for fast development and optimized builds
- React Router for client-side routing
- TailwindCSS for responsive styling
- Framer Motion for smooth animations
- Lucide React for icons

### State Management
- Zustand for global state (cart, user)
- TanStack Query for server state and caching
- React Hook Form with Zod for form validation

### Backend and Database
- Supabase for authentication, database, and storage
- PostgreSQL database with Row Level Security
- Real-time subscriptions capability

### Payment Integration
- Stripe for payment processing (test mode)
- Stripe Elements for secure card input

### UI Components
- Sonner for toast notifications
- Custom accessible components with ARIA labels
- Dark mode theme system

## Key Features Implemented

### User Features
- Product browsing with search, filter, and sort
- Product detail pages with image galleries
- Shopping cart with persistent storage
- Multi-step checkout process
- Stripe payment integration
- Order history and tracking
- Wishlist functionality
- User authentication and profile management
- Dark mode toggle

### Admin Features
- Product management (create, update, delete)
- Order management and status updates
- Admin dashboard
- Image upload for products

### Technical Features
- Server-side pagination with load more option
- Lazy loading images for performance
- Skeleton loaders for better UX
- Error boundaries and network error handling
- 404 page for invalid routes
- Accessibility with keyboard navigation
- Responsive design for all devices
- Performance optimizations with React.memo

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Supabase account (free tier works)
- Stripe account for payment testing

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

3. Create a .env file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
   ```

4. Set up your Supabase database by following the SUPABASE.md guide

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to http://localhost:5173

## Testing the Application

### Testing User Flow
1. Browse products on the homepage
2. Use search and filters to find specific products
3. Click on a product to view details
4. Add products to cart
5. View cart and update quantities
6. Proceed to checkout
7. Fill in shipping information
8. Enter test card details (4242 4242 4242 4242)
9. Complete the order
10. View order history

### Testing Admin Features
1. Set up admin role using SUPABASE.md instructions
2. Access admin dashboard at /admin
3. Create new products
4. Update product details
5. Manage orders and update status
6. Upload product images

### Testing Error Handling
1. Visit an invalid URL to see the 404 page
2. Disconnect internet to see network error handling
3. Test form validation by submitting empty forms

### Testing Accessibility
1. Navigate using keyboard only (Tab, Enter, Escape)
2. Use screen reader to verify ARIA labels
3. Test all interactive elements with keyboard

## Project Structure

```
src/
  components/        # Reusable UI components
  pages/            # Page components
  hooks/            # Custom React hooks
  store/            # Zustand state management
  lib/              # Utility functions and configurations
  types/            # TypeScript type definitions
  contexts/         # React contexts (theme, etc.)
database/           # SQL migration files
public/             # Static assets
```

## Available Scripts

- npm run dev - Start development server
- npm run build - Build for production
- npm run preview - Preview production build
- npm run lint - Run ESLint

## Database Setup

All database setup instructions are in SUPABASE.md. Follow the SQL files in the database folder in order:
1. 01-initial-setup.sql
2. 02-admin-setup.sql
3. 03-make-admin.sql
4. And so on...

## Deployment

For deployment instructions to Vercel, see VERCEL.md.

## Documentation

- SUPABASE.md - Complete Supabase setup guide
- VERCEL.md - Deployment instructions

## Support

For issues or questions, check the documentation files or review the code comments in the source files.
