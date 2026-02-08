# ShopHub - Vercel Deployment Guide

## Prerequisites

- GitHub account with ShopHub repository
- Vercel account (sign up at vercel.com)
- Supabase project credentials

## Step-by-Step Deployment

### 1. Prepare Repository

Ensure your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to vercel.com and sign in
2. Click "Add New Project"
3. Import your ShopHub repository from GitHub
4. Vercel will auto-detect it as a Vite project

### 3. Configure Build Settings

- Framework Preset: Vite (auto-detected)
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Root Directory: `./` (leave as default)

### 4. Environment Variables

Add these environment variables in Vercel dashboard:

```
VITE_USE_MOCK_API=false
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key_here
```

To add environment variables:
1. Go to project settings
2. Click "Environment Variables" tab
3. Add each variable with its value
4. Set scope to Production

### 5. Deploy

1. Click "Deploy" button
2. Wait for build completion (usually 1-2 minutes)
3. Vercel will provide a deployment URL

### 6. Custom Domain (Optional)

1. Go to project settings → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions

## Post-Deployment Verification

Test these features:
- Homepage loads correctly
- Authentication works (sign up, login, logout)
- Product browsing (search, filter, sort, pagination)
- Product details pages
- Shopping cart functionality
- Wishlist functionality
- Checkout process
- User profile and order history
- Error handling (404 pages, error boundaries)

## Troubleshooting

### Build Fails
- Check for TypeScript errors: `npm run build` locally
- Verify dependencies: `npm install`
- Confirm environment variables are configured

### Blank Page After Deployment
- Check browser console for errors
- Verify environment variables in Vercel
- Review Vercel deployment logs

### API Calls Fail
- Confirm Supabase URL and anon key are correct
- Check RLS policies are enabled in Supabase
- Verify CORS configuration includes Vercel domain

### Images Don't Load
- Confirm image URLs are correct
- Check Supabase Storage configuration
- Ensure images are publicly accessible

## Continuous Deployment

Vercel automatically:
- Deploys pushes to main branch (Production)
- Creates preview deployments for pull requests
- Provides unique URLs for each deployment

## Monitoring

Vercel dashboard provides:
- Real-time analytics
- Performance metrics
- Error tracking
- Build logs
- Deployment history

## Performance Features

Implemented optimizations:
- Image lazy loading
- Code splitting (React Router)
- Search debouncing
- Optimistic UI updates
- Loading skeletons
- Asset caching (vercel.json)

## Security

- Environment variables are encrypted
- Supabase RLS policies protect data
- HTTPS enabled by default
- Authentication tokens stored securely

## Rollback

To rollback to previous deployment:
1. Go to Vercel dashboard
2. Click "Deployments" tab
3. Find working deployment
4. Click "..." → "Promote to Production"

## Support

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs

## Quick Commands

```bash
# Test production build locally
npm run build
npm run preview

# Check for errors
npm run build
npm run lint

# Update dependencies
npm update
```

## Success Checklist

- Code pushed to GitHub
- Vercel project created
- Environment variables configured
- Build succeeds
- Site loads correctly
- Authentication works
- Database operations work
- All features tested
- Custom domain configured (optional)
- Monitoring set up

Your ShopHub e-commerce platform is now live.
