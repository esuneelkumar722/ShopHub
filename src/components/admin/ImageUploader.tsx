import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import type { ProductImage } from '../../types';

// Define local types for product_images operations
type ProductImageInsert = {
  id?: string;
  product_id: string;
  image_url: string;
  display_order?: number;
  is_primary?: boolean;
  created_at?: string;
};

type ProductImageUpdate = {
  id?: string;
  product_id?: string;
  image_url?: string;
  display_order?: number;
  is_primary?: boolean;
  created_at?: string;
};

interface ImageUploaderProps {
  productId: string;
  existingImages?: ProductImage[];
  onImagesUpdated?: () => void;
}

export const ImageUploader = ({ productId, existingImages = [], onImagesUpdated }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ProductImage[]>(existingImages);
  const [isDragging, setIsDragging] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Failed to upload ${file.name}`);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload exception:', error);
      toast.error(`Error uploading ${file.name}`);
      return null;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    // Upload all images
    const uploadPromises = validFiles.map(uploadImage);
    const uploadedUrls = await Promise.all(uploadPromises);
    const successfulUrls = uploadedUrls.filter((url): url is string => url !== null);

    if (successfulUrls.length > 0) {
      // Save to database
      const nextDisplayOrder = images.length;
      const newImageRecords = successfulUrls.map((url, index) => ({
        product_id: productId,
        image_url: url,
        display_order: nextDisplayOrder + index,
        is_primary: images.length === 0 && index === 0,
      }));

      const { data: insertedImages, error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .from('product_images')
        .insert(newImageRecords as ProductImageInsert[])
        .select();

      if (error) {
        console.error('Database error:', error);
        toast.error('Failed to save image records');
      } else {
        const typedImages = (insertedImages || []) as unknown as ProductImage[];
        setImages([...images, ...typedImages]);
        toast.success(`${successfulUrls.length} image(s) uploaded successfully!`);
        onImagesUpdated?.();
      }
    }

    setUploading(false);
  };

  const handleDelete = async (imageId: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/product-images/');
      if (urlParts.length === 2) {
        const filePath = `product-images/${urlParts[1]}`;

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('products')
          .remove([filePath]);

        if (storageError) {
          console.error('Storage deletion error:', storageError);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setImages(images.filter((img) => img.id !== imageId));
      toast.success('Image deleted successfully');
      onImagesUpdated?.();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    }
  };

  const setPrimaryImage = async (imageId: string) => {
    try {
      // Set all images as non-primary first
      const { error: resetError } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .from('product_images')
        .update({ is_primary: false } as ProductImageUpdate)
        .eq('product_id', productId);

      if (resetError) throw resetError;

      // Set selected image as primary
      const { error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .from('product_images')
        .update({ is_primary: true } as ProductImageUpdate)
        .eq('id', imageId);

      if (error) throw error;

      setImages(
        images.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      );

      toast.success('Primary image updated');
      onImagesUpdated?.();
    } catch (error) {
      console.error('Set primary error:', error);
      toast.error('Failed to set primary image');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold dark:text-white">Product Images</h3>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          id="image-upload"
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={uploading}
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          {uploading ? (
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          )}
          <div>
            <p className="text-lg font-medium dark:text-white">
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              PNG, JPG, GIF up to 5MB (multiple files supported)
            </p>
          </div>
        </label>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group border rounded-lg overflow-hidden dark:border-gray-700"
            >
              <img
                src={image.image_url}
                alt="Product"
                className="w-full h-40 object-cover"
              />

              {/* Primary Badge */}
              {image.is_primary && (
                <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Primary
                </div>
              )}

              {/* Action Buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.is_primary && (
                  <button
                    onClick={() => setPrimaryImage(image.id)}
                    className="btn btn-sm bg-primary-600 hover:bg-primary-700 text-white focus-visible"
                    title="Set as primary image"
                    aria-label="Set as primary image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(image.id, image.image_url)}
                  className="btn btn-sm bg-red-600 hover:bg-red-700 text-white focus-visible"
                  title="Delete image"
                  aria-label="Delete image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Display Order */}
              <div className="absolute bottom-2 right-2 bg-gray-900 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                #{image.display_order + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
          No images uploaded yet. Upload your first image above.
        </p>
      )}
    </div>
  );
};
