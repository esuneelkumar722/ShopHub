import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../hooks/useAdmin';
import { ArrowLeft } from 'lucide-react';
import { ImageUploader } from '../../components/admin/ImageUploader';
import type { ProductImage } from '../../types';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.enum(['electronics', 'clothing', 'home', 'books', 'sports']),
  image_url: z.string().url('Must be a valid URL'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  rating: z.number().min(0).max(5).optional(),
  reviews_count: z.number().int().min(0).optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAdmin();
  const isEditMode = !!id;
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  // Fetch existing product if editing
  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isEditMode && isAdmin,
  });

  // Fetch product images if editing
  const { data: images } = useQuery({
    queryKey: ['product-images', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('display_order');

      if (error) throw error;
      return (data || []) as unknown as ProductImage[];
    },
    enabled: isEditMode && isAdmin,
  });

  // Update local state when images load
  useEffect(() => {
    if (images) {
      setProductImages(images);
    }
  }, [images]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      rating: 0,
      reviews_count: 0,
    },
  });

  // Reset form when product data loads
  useEffect(() => {
    if (product) {
      const p = product as any;
      reset({
        name: p.name,
        description: p.description,
        price: Number(p.price),
        category: p.category,
        image_url: p.image_url,
        stock: p.stock,
        rating: p.rating || 0,
        reviews_count: p.reviews_count || 0,
      });
    }
  }, [product, reset]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      if (isEditMode) {
        if (!id) throw new Error('Product ID is required');
        // Note: Using 'as any' due to TypeScript strict mode with Supabase update types
        const { error } = await (supabase as any)
          .from('products')
          .update(data)
          .eq('id', id);
        if (error) throw error;
      } else {
        // Note: Using 'as any' due to TypeScript strict mode with Supabase insert types
        const { error } = await (supabase as any).from('products').insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      alert(isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
      navigate('/admin/products');
    },
    onError: (error: unknown) => {
      alert('Failed to save product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    },
  });

  if (!isAdmin) {
    return <div className="text-center py-12">Access Denied</div>;
  }

  const onSubmit = (data: ProductForm) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/admin/products')}
        className="flex items-center text-secondary hover:text-primary mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded px-2 py-1"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Products
      </button>

      <div className="card">
        <h1 className="text-3xl font-bold mb-8 text-primary">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 card">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Product Name *
            </label>
            <input
              {...register('name')}
              type="text"
              className="input"
              placeholder="iPhone 15 Pro"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="input"
              placeholder="Detailed product description..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Price ($) *
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="input"
                placeholder="99.99"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Stock *
              </label>
              <input
                {...register('stock', { valueAsNumber: true })}
                type="number"
                className="input"
                placeholder="100"
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Category *
            </label>
            <select
              {...register('category')}
              className="input"
            >
              <option value="">Select a category</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home</option>
              <option value="books">Books</option>
              <option value="sports">Sports</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Image URL *
            </label>
            <input
              {...register('image_url')}
              type="url"
              className="input"
              placeholder="https://example.com/image.jpg"
            />
            {errors.image_url && (
              <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>
            )}
            <p className="text-sm text-secondary mt-1">
              Use Unsplash: https://images.unsplash.com/photo-...?w=400
            </p>
          </div>

          {/* Rating and Reviews (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Rating (0-5)
              </label>
              <input
                {...register('rating', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                max="5"
                className="input"
                placeholder="4.5"
              />
              {errors.rating && (
                <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Reviews Count
              </label>
              <input
                {...register('reviews_count', { valueAsNumber: true })}
                type="number"
                className="input"
                placeholder="234"
              />
              {errors.reviews_count && (
                <p className="text-red-500 text-sm mt-1">{errors.reviews_count.message}</p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 btn btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {saveMutation.isPending
                ? 'Saving...'
                : isEditMode
                  ? 'Update Product'
                  : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="btn btn-secondary px-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Image Uploader Section (Only for Edit Mode) */}
        {isEditMode && id && (
          <div className="card mt-8">
            <ImageUploader
              productId={id}
              existingImages={productImages}
              onImagesUpdated={() => {
                queryClient.invalidateQueries({ queryKey: ['product-images', id] });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
