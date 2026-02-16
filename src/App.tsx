import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { SkipToContent } from './components/accessibility/SkipToContent';
import { lazy, Suspense } from 'react';
import { NetworkErrorBoundary } from './components/error/NetworkErrorBoundary';
import { useAuth } from './hooks/useAuth';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});


const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(module => ({ default: module.ProductsPage })));

// Add more lazy components gradually
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(module => ({ default: module.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(module => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then(module => ({ default: module.OrdersPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then(module => ({ default: module.WishlistPage })));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(module => ({ default: module.AdminProducts })));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm').then(module => ({ default: module.AdminProductForm })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(module => ({ default: module.AdminOrders })));

// Keep NotFoundPage as regular import for now
import { NotFoundPage } from './pages/NotFoundPage';

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function AppContent() {
  useAuth(); // Check and maintain auth state

  return (
    <>
      <SkipToContent />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<PageLoader />}>
              <HomePage />
            </Suspense>
          } />
          <Route path="products" element={
            <Suspense fallback={<PageLoader />}>
              <ProductsPage />
            </Suspense>
          } />
          <Route path="products/:id" element={
            <Suspense fallback={<PageLoader />}>
              <ProductDetailPage />
            </Suspense>
          } />
          <Route path="cart" element={
            <Suspense fallback={<PageLoader />}>
              <CartPage />
            </Suspense>
          } />
          <Route path="checkout" element={
            <Suspense fallback={<PageLoader />}>
              <CheckoutPage />
            </Suspense>
          } />
          <Route path="orders" element={
            <Suspense fallback={<PageLoader />}>
              <OrdersPage />
            </Suspense>
          } />
          <Route path="wishlist" element={
            <Suspense fallback={<PageLoader />}>
              <WishlistPage />
            </Suspense>
          } />
          <Route path="login" element={
            <Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>
          } />

          {/* Admin Routes */}
          <Route path="admin" element={
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="admin/products" element={
            <Suspense fallback={<PageLoader />}>
              <AdminProducts />
            </Suspense>
          } />
          <Route path="admin/products/new" element={
            <Suspense fallback={<PageLoader />}>
              <AdminProductForm />
            </Suspense>
          } />
          <Route path="admin/products/edit/:id" element={
            <Suspense fallback={<PageLoader />}>
              <AdminProductForm />
            </Suspense>
          } />
          <Route path="admin/orders" element={
            <Suspense fallback={<PageLoader />}>
              <AdminOrders />
            </Suspense>
          } />

          {/* 404 Not Found - Keep as regular import */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <NetworkErrorBoundary>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </NetworkErrorBoundary>
          <Toaster position="top-right" richColors={false} closeButton={false} duration={1000} toastOptions={{ className: 'custom-toast' }} />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
