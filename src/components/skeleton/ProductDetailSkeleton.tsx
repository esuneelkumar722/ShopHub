export const ProductDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-6 w-24 bg-gray-200 rounded mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image skeleton */}
        <div className="w-full h-96 bg-gray-200 rounded-2xl"></div>

        {/* Product info skeleton */}
        <div>
          {/* Category badge */}
          <div className="h-6 w-24 bg-gray-200 rounded-full mb-4"></div>

          {/* Title */}
          <div className="h-10 bg-gray-200 rounded mb-4"></div>

          {/* Rating */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
          </div>

          {/* Price */}
          <div className="h-12 w-32 bg-gray-200 rounded mb-6"></div>

          {/* Description */}
          <div className="space-y-3 mb-8">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>

          {/* Stock */}
          <div className="h-10 w-32 bg-gray-200 rounded mb-8"></div>

          {/* Buttons */}
          <div className="flex gap-4">
            <div className="flex-1 h-14 bg-gray-200 rounded-lg"></div>
            <div className="h-14 w-14 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
