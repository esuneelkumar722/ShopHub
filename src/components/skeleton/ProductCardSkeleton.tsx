export const ProductCardSkeleton = () => {
  return (
    <div className="card animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
      
      {/* Title skeleton */}
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      
      {/* Description skeleton */}
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      
      {/* Rating skeleton */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
      
      {/* Price and button skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
        <div className="h-10 w-28 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};
