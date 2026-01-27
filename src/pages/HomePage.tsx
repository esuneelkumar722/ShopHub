import { Link } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Shield, Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const HomePage = () => {
  // Fetch categories dynamically from database
  const { data: categories } = useQuery({
    queryKey: ['categories-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .order('category');

      if (error) throw error;
      const uniqueCategories = [...new Set(data.map((p: any) => p.category))];
      return uniqueCategories as string[];
    }
  });

  // Category emojis and descriptions
  const categoryInfo: Record<string, { emoji: string; description: string; gradient: string }> = {
    electronics: { emoji: '📱', description: 'Phones, Laptops & More', gradient: 'from-blue-500 to-purple-600' },
    clothing: { emoji: '👕', description: 'Fashion & Footwear', gradient: 'from-pink-500 to-orange-500' },
    home: { emoji: '🏠', description: 'Appliances & Decor', gradient: 'from-green-500 to-teal-500' },
    books: { emoji: '📚', description: 'Reading & Knowledge', gradient: 'from-yellow-500 to-red-500' },
    sports: { emoji: '⚽', description: 'Fitness & Outdoor', gradient: 'from-cyan-500 to-blue-600' }
  };

  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8 text-primary-600" />,
      title: 'Wide Selection',
      description: 'Browse thousands of products across multiple categories'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary-600" />,
      title: 'Best Prices',
      description: 'Competitive pricing with regular deals and discounts'
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: 'Secure Checkout',
      description: 'Safe and secure payment processing with Stripe'
    },
    {
      icon: <Truck className="w-8 h-8 text-primary-600" />,
      title: 'Fast Shipping',
      description: 'Quick delivery to your doorstep'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to ShopHub
            </h1>
            <p className="text-xl mb-8 text-primary-100 dark:text-primary-200">
              Discover amazing products at unbeatable prices
            </p>
            <Link
              to="/products"
              className="inline-block bg-white dark:bg-gray-100 text-primary-600 dark:text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 section-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-primary">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 section-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {categories?.map((category) => {
              const info = categoryInfo[category] || {
                emoji: '🛍️',
                description: 'Shop now',
                gradient: 'from-gray-500 to-gray-700'
              };

              return (
                <Link
                  key={category}
                  to={`/products?category=${category}`}
                  className="card hover:shadow-lg transition-shadow group"
                >
                  <div className={`h-48 rounded-lg mb-4 overflow-hidden bg-gradient-to-br ${info.gradient} flex items-center justify-center`}>
                    <span className="text-6xl">{info.emoji}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-primary">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h3>
                  <p className="text-center text-secondary text-sm mt-2">{info.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
