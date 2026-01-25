import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../store/cartStore';

interface ProductRecommendationsProps {
  currentProductId: string;
  category: string;
}

export const ProductRecommendations = ({ currentProductId, category }: ProductRecommendationsProps) => {
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const addItem = useCartStore((state) => state.addItem);

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', currentProductId, category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', currentProductId)
        .gt('stock', 0)
        .order('rating', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Product[];
    }
  });

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setAddedProducts(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  if (isLoading || !recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 border-t pt-16">
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
      
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar">
          {recommendations.map((product) => (
            <div
              key={product.id}
              className="flex-none w-64 snap-start card hover:shadow-lg transition-shadow group"
            >
              <Link to={`/products/${product.id}`}>
                <img
                  src={product.image_url}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-40 object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                  }}
                />
              </Link>

              <Link to={`/products/${product.id}`}>
                <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-500">★</span>
                <span className="text-sm">{product.rating}</span>
                <span className="text-sm text-gray-500">({product.reviews_count})</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-primary-600">
                  ${product.price.toFixed(2)}
                </span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`btn btn-sm flex items-center gap-2 ${
                    addedProducts.has(product.id)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'btn-primary'
                  }`}
                >
                  {addedProducts.has(product.id) ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
