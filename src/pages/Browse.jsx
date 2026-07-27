import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Search, SlidersHorizontal, ArrowUpDown, Undo, ShoppingCart, HelpCircle } from 'lucide-react'
import { ProductGridSkeleton } from '../components/Skeleton'
import ProductCard from '../components/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Reading URL parameters for initial filters
  const categoryParam = searchParams.get('category') || ''
  const searchParam = searchParams.get('search') || ''

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParam)
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, price_asc, price_desc
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Products and Loading states
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // List of valid categories
  const categories = [
    'Books',
    'Notes',
    'Lab Materials',
    'Lab Coats',
    'Calculators',
    'Hostel Essentials',
    'Stationery',
    'Others',
  ]

  // Conditions
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']

  // Update state when URL changes (e.g. clicking category link from Home)
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '')
    setSearchQuery(searchParams.get('search') || '')
  }, [searchParams])

  // Query database from Supabase
  const fetchFilteredProducts = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('products').select('*')

      // 1. Text Search Filter
      if (searchQuery.trim()) {
        query = query.ilike('title', `%${searchQuery.trim()}%`)
      }

      // 2. Category Filter
      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      }

      // 3. Condition Filter
      if (selectedCondition) {
        query = query.eq('condition', selectedCondition)
      }

      // 4. Min Price Filter
      if (minPrice) {
        query = query.gte('price', parseFloat(minPrice))
      }

      // 5. Max Price Filter
      if (maxPrice) {
        query = query.lte('price', parseFloat(maxPrice))
      }

      // 6. Sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'price_asc') {
        query = query.order('price', { ascending: true })
      } else if (sortBy === 'price_desc') {
        query = query.order('price', { ascending: false })
      }

      const { data, error } = await query
      if (error) throw error

      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching filtered products:', err.message)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedCondition, minPrice, maxPrice, sortBy])

  // Trigger data fetch on filter state changes
  useEffect(() => {
    // Sync filter state to URL to support browser history and shareable search links
    const newParams = {}
    if (selectedCategory) newParams.category = selectedCategory
    if (searchQuery) newParams.search = searchQuery
    setSearchParams(newParams)

    fetchFilteredProducts()
  }, [selectedCategory, searchQuery, selectedCondition, minPrice, maxPrice, sortBy, setSearchParams, fetchFilteredProducts])

  // Clear all filters
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setMinPrice('')
    setMaxPrice('')
    setSelectedCondition('')
    setSortBy('newest')
    setSearchParams({})
  }

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1 flex flex-col">
      {/* Header and Search */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-textMain tracking-tight">Browse Campus Catalog</h1>
          <p class="text-sm text-textMuted mt-1">Real-time marketplace index. Verified student listings only.</p>
        </div>

        {/* Real-time search bar */}
        <div class="relative w-full md:max-w-md shadow-sm">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            class="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300"
          />
        </div>
      </div>

      {/* Category selector row */}
      <div class="flex items-center gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setSelectedCategory('')}
          class={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            !selectedCategory
              ? 'bg-primary text-white shadow-soft'
              : 'bg-white border border-slate-200 text-textMuted hover:text-primary hover:border-primary/20'
          }`}
        >
          All Items
        </button>
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedCategory(cat)}
            class={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat
                ? 'bg-primary text-white shadow-soft'
                : 'bg-white border border-slate-200 text-textMuted hover:text-primary hover:border-primary/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Sidebar + Product Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
        
        {/* Desktop Filter Sidebar */}
        <aside class="hidden lg:block lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-soft space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 class="font-extrabold text-textMain flex items-center gap-2 text-sm uppercase tracking-wider">
              <SlidersHorizontal size={16} /> Filters
            </h3>
            <button
              onClick={resetFilters}
              class="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <Undo size={12} /> Reset
            </button>
          </div>

          {/* Pricing range filter */}
          <div class="space-y-2">
            <label class="block text-xs font-bold text-textMain uppercase tracking-wider">Price Range (₹)</label>
            <div class="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                class="block w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-primary/20 focus:border-primary focus:outline-none"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                class="block w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-primary/20 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Condition Filter */}
          <div class="space-y-2">
            <label class="block text-xs font-bold text-textMain uppercase tracking-wider">Condition</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              class="block w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-white text-textMain focus:ring-primary/20 focus:border-primary focus:outline-none"
            >
              <option value="">Any Condition</option>
              {conditions.map((cond, idx) => (
                <option key={idx} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div class="space-y-2">
            <label class="block text-xs font-bold text-textMain uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown size={12} /> Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              class="block w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-white text-textMain focus:ring-primary/20 focus:border-primary focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Product Results Column */}
        <div class="lg:col-span-9 space-y-6 flex-1 flex flex-col">
          {/* Mobile Filter Toggle Buttons */}
          <div class="lg:hidden flex items-center gap-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-textMain shadow-sm"
            >
              <SlidersHorizontal size={14} /> Filters / Sort
            </button>
            {(searchQuery || selectedCategory || selectedCondition || minPrice || maxPrice) && (
              <button
                onClick={resetFilters}
                class="px-4 py-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Mobile Filters Drawer */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                class="lg:hidden bg-white p-5 rounded-2xl border border-slate-100 shadow-soft space-y-4 overflow-hidden"
              >
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="block text-[10px] font-bold text-textMuted uppercase tracking-wider">Min Price</label>
                    <input
                      type="number"
                      placeholder="₹ Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      class="block w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[10px] font-bold text-textMuted uppercase tracking-wider">Max Price</label>
                    <input
                      type="number"
                      placeholder="₹ Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      class="block w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="block text-[10px] font-bold text-textMuted uppercase tracking-wider">Condition</label>
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      class="block w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none"
                    >
                      <option value="">Any Condition</option>
                      {conditions.map((cond, idx) => (
                        <option key={idx} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[10px] font-bold text-textMuted uppercase tracking-wider">Sort</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      class="block w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setShowMobileFilters(false)}
                  class="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-soft"
                >
                  Apply Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Grid */}
          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : products.length === 0 ? (
            /* Empty State with illustration */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-white text-center space-y-4"
            >
              <img src="C:/Users/Shaik/.gemini/antigravity-ide/brain/e16f6d57-c2e4-4d80-a283-c83638f386dd/empty_saved_items_1785079896957.png" alt="No items" className="w-48 h-48 object-contain" />
              <h3 className="text-lg font-bold text-textMain">No products available yet.</h3>
              <p className="text-sm text-textMuted max-w-sm mx-auto">
                No products matched your exact search filters. Try clearing your filters or look for another keyword.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-soft transition-all"
              >
                Clear Search & Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Browse
