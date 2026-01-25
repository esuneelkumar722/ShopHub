# ShopHub - Vercel Deployment Guide

## Prerequisites

1. GitHub account with ShopHub repository
2. Vercel account (sign up at [vercel.com](https://vercel.com))
3. Supabase project credentials

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your ShopHub repository from GitHub
4. Vercel will auto-detect it as a Vite project

### 3. Configure Project Settings

**Framework Preset:** Vite (auto-detected)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Root Directory:** `./` (leave as default)

### 4. Environment Variables

Add these environment variables in Vercel dashboard:

```
VITE_SUPABASE_URL=https://ghqwelumltjyphkebalf.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**To add environment variables:**
1. Go to your project settings
2. Click "Environment Variables" tab
3. Add each variable with its value
4. Make sure they're available for Production, Preview, and Development

### 5. Deploy

1. Click "Deploy" button
2. Wait for the build to complete (usually 1-2 minutes)
3. Vercel will provide a deployment URL (e.g., `shophub-xyz.vercel.app`)

### 6. Configure Custom Domain (Optional)

1. Go to project settings → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

## Post-Deployment Verification

### Test These Features:

✅ **Homepage loads correctly**
- Hero section displays
- Featured products appear

✅ **Authentication works**
- Sign up new account
- Login with existing account
- Logout functionality

✅ **Product browsing**
- View all products
- Search products
- Filter by category
- Sort products
- Pagination works

✅ **Product details**
- Individual product pages load
- Images display correctly
- Reviews appear
- Product recommendations show

✅ **Shopping cart**
- Add products to cart
- Update quantities
- Remove items
- Cart persists across page refreshes

✅ **Wishlist**
- Add/remove from wishlist
- View wishlist page
- Wishlist persists

✅ **Checkout**
- Complete order placement
- Order confirmation appears
- Order saved to database

✅ **User profile**
- View order history
- Update profile information
- Delete account

✅ **Error handling**
- 404 page shows for invalid routes
- Error boundary catches errors

## Troubleshooting

### Build Fails

**Check for:**
- TypeScript errors: `npm run build` locally
- Missing dependencies: `npm install`
- Environment variables configured correctly

### Blank Page After Deployment

**Possible causes:**
1. Missing environment variables
2. Incorrect Supabase credentials
3. Browser console shows errors

**Solution:**
- Check browser console for errors
- Verify environment variables in Vercel
- Check Vercel deployment logs

### API Calls Fail

**Check:**
1. Supabase URL is correct
2. Supabase anon key is valid
3. RLS policies are enabled in Supabase
4. CORS is configured (Vercel domain added to Supabase allowed origins)

### Images Don't Load

**Verify:**
- Image URLs are correct
- Supabase Storage is configured
- Images are publicly accessible

## Continuous Deployment

Once connected, Vercel automatically:
- Deploys every push to `main` branch (Production)
- Creates preview deployments for pull requests
- Provides unique URLs for each deployment

## Monitoring

**Vercel Dashboard provides:**
- Real-time analytics
- Performance metrics
- Error tracking
- Build logs
- Deployment history

## Performance Optimization

Already implemented in ShopHub:
✅ Image lazy loading
✅ Code splitting (React Router)
✅ Search debouncing
✅ Optimistic UI updates
✅ Loading skeletons
✅ Asset caching (vercel.json)

## Security

✅ Environment variables are encrypted
✅ Supabase RLS policies protect data
✅ HTTPS enabled by default
✅ Authentication tokens stored securely

## Rollback

If deployment has issues:
1. Go to Vercel dashboard
2. Click "Deployments" tab
3. Find previous working deployment
4. Click "..." → "Promote to Production"

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Community: https://vercel.com/community

---

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

# Deploy via CLI (alternative method)
npm i -g vercel
vercel --prod
```

## Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Build succeeds
- [ ] Site loads correctly
- [ ] Authentication works
- [ ] Database operations work
- [ ] All features tested
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up

**Your ShopHub e-commerce platform is now live! 🚀**
