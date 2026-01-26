# Vercel Deployment Guide

## What is Vercel

Vercel is a cloud platform for deploying and hosting web applications. It specializes in frontend frameworks and static sites with automatic deployments from Git repositories. Vercel provides global edge network delivery, automatic HTTPS, and seamless integration with popular frameworks like React, Next.js, and Vite.

## Why We Use Vercel

ShopHub uses Vercel for deployment because:

- Zero-configuration deployment for Vite applications
- Automatic deployments from Git commits
- Global CDN for fast content delivery worldwide
- Free SSL certificates with automatic renewal
- Preview deployments for every pull request
- Generous free tier suitable for most projects
- Environment variable management
- Excellent performance and reliability

## Creating a Vercel Account

1. Visit https://vercel.com
2. Click "Sign Up" button
3. Choose sign up method:
   - GitHub (recommended for automatic deployments)
   - GitLab
   - Bitbucket
   - Email
4. Authorize Vercel to access your Git repositories
5. Complete account setup

## Preparing Your Application for Deployment

Before deploying, ensure your application is ready:

1. Commit all your changes to Git
2. Push your code to GitHub, GitLab, or Bitbucket
3. Verify your build works locally:
   ```
   npm run build
   npm run preview
   ```
4. Ensure all environment variables are documented

## Deploying to Vercel

### Method 1: Deploy from Git Repository (Recommended)

1. Log in to your Vercel dashboard
2. Click "Add New" button
3. Select "Project"
4. Choose "Import Git Repository"
5. Select your ShopHub repository
6. Vercel will auto-detect Vite configuration
7. Configure project settings:
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
   - Install Command: npm install
8. Click "Deploy"
9. Wait 1-2 minutes for deployment to complete

### Method 2: Deploy with Vercel CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Navigate to your project directory

3. Run deployment command:
   ```
   vercel
   ```

4. Follow the prompts:
   - Link to existing project or create new one
   - Confirm project settings
   - Wait for deployment

## Adding Environment Variables

Your application needs environment variables to work:

1. Go to your project in Vercel dashboard
2. Click "Settings" tab
3. Select "Environment Variables" from sidebar
4. Add each variable:
   - VITE_SUPABASE_URL: Your Supabase project URL
   - VITE_SUPABASE_ANON_KEY: Your Supabase anon key
   - VITE_STRIPE_PUBLIC_KEY: Your Stripe public key
5. Select which environments need each variable:
   - Production
   - Preview
   - Development
6. Click "Save"
7. Redeploy your application to apply changes

## Redeploying After Changes

Vercel automatically redeploys when you push to your Git repository:

1. Make changes to your code
2. Commit changes: git commit -m "Your message"
3. Push to repository: git push
4. Vercel automatically detects the push
5. New deployment starts automatically
6. You receive a notification when deployment completes

## Accessing Your Deployed Application

After deployment:

1. Vercel provides a URL like: https://your-project.vercel.app
2. Visit this URL to see your live application
3. You can add a custom domain in project settings
4. Share this URL with users or testers

## Setting Up Custom Domain (Optional)

To use your own domain:

1. Go to project Settings
2. Click "Domains" section
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)
6. Vercel automatically provisions SSL certificate

## Monitoring Your Deployment

Vercel provides monitoring tools:

1. Go to your project dashboard
2. View deployment history and status
3. Check build logs for errors
4. Monitor performance metrics
5. View visitor analytics

## Troubleshooting Common Issues

### Build Fails

- Check build logs in Vercel dashboard
- Verify build command is correct
- Ensure all dependencies are in package.json
- Check for TypeScript or ESLint errors locally

### Environment Variables Not Working

- Verify variables are added in Vercel settings
- Environment variables must start with VITE_ prefix
- Redeploy after adding variables
- Check variable names match exactly

### Application Shows Errors

- Check browser console for errors
- Verify Supabase URL and keys are correct
- Ensure Supabase project is not paused
- Check API endpoints are accessible

### Slow Loading Times

- Enable compression in vercel.json
- Optimize images and assets
- Review bundle size
- Check Supabase region matches Vercel region

## Vercel Configuration File

You can create a vercel.json file in your project root for custom configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

This file is optional as Vercel auto-detects Vite projects.

## Best Practices

- Use environment variables for all sensitive data
- Never commit API keys to your repository
- Test builds locally before pushing
- Use preview deployments to test changes
- Monitor deployment logs regularly
- Set up custom domain for production
- Enable Vercel Analytics for insights

## Getting Help

If you encounter deployment issues:

- Check Vercel documentation: https://vercel.com/docs
- Review deployment logs in Vercel dashboard
- Verify environment variables are set correctly
- Check that your build works locally
- Contact Vercel support if needed

## Deployment Checklist

Before deploying to production:

- All environment variables are configured
- Database is set up and populated
- Build succeeds locally
- All tests pass
- Code is committed to Git
- README and documentation are updated
- API keys are valid and not expired
- CORS settings are configured if needed
