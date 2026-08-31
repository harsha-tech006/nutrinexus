import React from 'react';

export const FullscreenLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/80 dark:bg-gray-950/85 backdrop-blur-md">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          {/* Pulsing glow ring */}
          <div className="absolute inset-0 rounded-full border-4 border-green-200 dark:border-green-950/30 animate-pulse"></div>
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <span className="text-sm font-semibold text-green-600 dark:text-green-400 animate-pulse tracking-wide uppercase">NutriNexus Loading...</span>
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 bg-white dark:bg-gray-900 shadow-soft animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl mt-4"></div>
    </div>
  );
};

export const ListSkeleton = ({ rows = 4 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3 w-2/3">
            <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-800"></div>
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
              <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
};
