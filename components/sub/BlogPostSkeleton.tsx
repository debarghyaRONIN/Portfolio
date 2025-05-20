const BlogPostSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Navigation skeleton */}
      <div className="h-16 bg-gray-800/50 mb-8"></div>

      {/* Header skeleton */}
      <div className="space-y-4 mb-12">
        <div className="h-4 bg-gray-700/50 w-1/3 rounded"></div>
        <div className="h-8 bg-gray-700/50 w-2/3 rounded"></div>
        <div className="flex space-x-2">
          <div className="h-6 w-24 bg-gray-700/50 rounded-full"></div>
          <div className="h-6 w-24 bg-gray-700/50 rounded-full"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>

        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
        </div>

        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostSkeleton;