import React from 'react'

/**
 * Single card loading shimmer.
 */
export const ProductCardSkeleton = () => {
  return (
    <div class="bg-cardBg dark:bg-cardBg-dark rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-soft">
      {/* Image area */}
      <div class="w-full aspect-[4/3] shimmer-bg"></div>
      
      {/* Details area */}
      <div class="p-4 space-y-3">
        <div class="flex justify-between items-center">
          <div class="h-4 w-1/4 rounded shimmer-bg"></div>
          <div class="h-3 w-1/5 rounded-full shimmer-bg"></div>
        </div>
        
        <div class="h-6 w-3/4 rounded shimmer-bg"></div>
        <div class="h-4 w-1/2 rounded shimmer-bg"></div>
        
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div class="h-6 w-1/3 rounded shimmer-bg"></div>
          <div class="h-5 w-1/5 rounded shimmer-bg"></div>
        </div>
      </div>
    </div>
  )
}

/**
 * Grid of cards loading shimmer.
 */
export const ProductGridSkeleton = ({ count = 4 }) => {
  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Large details page loading shimmer.
 */
export const ProductDetailSkeleton = () => {
  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
      {/* Images gallery left */}
      <div class="lg:col-span-7 space-y-4">
        <div class="w-full aspect-[4/3] rounded-2xl shimmer-bg"></div>
        <div class="grid grid-cols-4 gap-4">
          <div class="aspect-square rounded-xl shimmer-bg"></div>
          <div class="aspect-square rounded-xl shimmer-bg"></div>
          <div class="aspect-square rounded-xl shimmer-bg"></div>
          <div class="aspect-square rounded-xl shimmer-bg"></div>
        </div>
      </div>

      {/* Product metadata right */}
      <div class="lg:col-span-5 space-y-6">
        <div class="space-y-2">
          <div class="h-4 w-1/5 rounded-full shimmer-bg"></div>
          <div class="h-9 w-3/4 rounded shimmer-bg"></div>
          <div class="h-6 w-1/4 rounded shimmer-bg"></div>
        </div>

        <div class="h-24 w-full rounded-xl shimmer-bg"></div>

        <div class="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
          <div class="h-5 w-1/3 rounded shimmer-bg"></div>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full shimmer-bg"></div>
            <div class="space-y-2 flex-1">
              <div class="h-4 w-1/3 rounded shimmer-bg"></div>
              <div class="h-3 w-1/2 rounded shimmer-bg"></div>
            </div>
          </div>
        </div>

        <div class="pt-6 space-y-3">
          <div class="h-12 w-full rounded-xl shimmer-bg"></div>
          <div class="h-12 w-full rounded-xl shimmer-bg"></div>
        </div>
      </div>
    </div>
  )
}

/**
 * Dashboard listing row loading shimmer.
 */
export const ListingRowSkeleton = () => {
  return (
    <div class="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl shimmer-bg">
      <div class="w-16 h-16 rounded-lg shimmer-bg"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 w-1/3 rounded shimmer-bg"></div>
        <div class="h-3 w-1/5 rounded shimmer-bg"></div>
      </div>
      <div class="h-8 w-16 rounded shimmer-bg"></div>
    </div>
  )
}
