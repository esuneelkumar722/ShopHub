# Portfolio Project API Management

Simplified setup for Vercel deployment - Mock APIs for development, Supabase for production.

## Quick Setup

### Development (Local)
```bash
# Mock APIs (default)
npm run dev

# Real APIs
npm run dev:real

# Switch back to mock APIs
npm run dev:mock
```

### Production (Vercel)
- Set environment variables in Vercel dashboard
- Real APIs only (mocks disabled)

## Testing Both APIs Locally

### Using Scripts (Recommended)
```bash
# Terminal 1: Mock APIs (port 5173+)
npm run dev:mock

# Terminal 2: Real APIs (port 5174+)
npm run dev:real
```

Each terminal uses its own environment configuration and runs on different ports.

## Environment Files

### .env.development.mock - Mock APIs (Development)
```env
VITE_USE_MOCK_API=true
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### .env.development.real - Real APIs (Development)
```env
VITE_USE_MOCK_API=false
# No API_BASE_URL needed - using Supabase directly
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### .env.production - Vercel Template
```env
VITE_USE_MOCK_API=false
# No API_BASE_URL needed - using Supabase directly
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Vercel Deployment

### 1. Set Environment Variables in Vercel
Go to your Vercel project -> Settings -> Environment Variables:

```
VITE_USE_MOCK_API=false
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Deploy
```bash
npm run build
# Vercel will automatically deploy
```

## API Architecture

### Mock APIs (Development)
- Uses MSW (Mock Service Worker) to intercept network requests
- Provides realistic API responses without backend
- Enables parallel frontend/backend development
- Includes filtering, sorting, and pagination

### Real APIs (Production)
- Uses Supabase directly for data operations
- Supports all CRUD operations with proper error handling
- Includes real-time data synchronization
- Optimized queries with filtering and pagination

## File Structure

```
src/
├── mocks/
│   ├── browser.ts     # MSW setup and initialization
│   └── handlers.ts    # Mock API request handlers
├── lib/
│   ├── config.ts      # Application configuration
│   └── productsApi.ts # API abstraction layer
├── ...
.env.development.mock   # Mock environment configuration
.env.development.real   # Real environment configuration
.env.production         # Production environment template
```

## Troubleshooting

### Build Errors
- Ensure all environment variables are properly set
- Check TypeScript compilation with `npm run build`
- Verify MSW imports are correct

### Runtime Issues
- Check browser console for MSW initialization messages
- Verify Supabase connection and credentials
- Ensure environment variables are loaded correctly

### Port Conflicts
- Use the isolated environment scripts (`npm run dev:mock`, `npm run dev:real`)
- Each script automatically finds an available port
- Avoid running multiple instances of the same environment