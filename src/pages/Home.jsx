import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Search, ArrowRight, BookOpen, ShieldAlert, Sparkles } from 'lucide-react'
import { ProductGridSkeleton } from '../components/Skeleton'
import ProductCard from '../components/ProductCard'
import { motion } from 'framer-motion'

const Home = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchLatestProducts = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4) // display latest 4 products on home page

        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        console.error('Error fetching latest listings:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestProducts()
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/browse')
    }
  }

  // Categories list as specified
  const categoriesList = [
    { name: 'Books', icon: '📚' },
    { name: 'Notes', icon: '📝' },
    { name: 'Lab Materials', icon: '🔬' },
    { name: 'Lab Coats', icon: '🥼' },
    { name: 'Calculators', icon: '🧮' },
    { name: 'Hostel Essentials', icon: '📦' },
    { name: 'Stationery', icon: '✏️' },
    { name: 'Others', icon: '✨' },
  ]

  return (
    <div class="space-y-16 pb-20">
      {/* 1. Hero Section */}
      <section class="relative bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-100">
        {/* Abstract background decorative shapes */}
        <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl -z-10"></div>
        <div class="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-secondary/10 blur-3xl -z-10"></div>

        <div class="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            <Sparkles size={14} />
            EXCLUSIVELY FOR COLLEGE STUDENTS
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            class="text-4xl sm:text-6xl font-black tracking-tight text-textMain leading-[1.1]"
          >
            Buy & Sell Used <br class="hidden sm:inline" />
            <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              College Items
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            class="max-w-2xl mx-auto text-lg sm:text-xl text-textMuted font-medium"
          >
            Marketplace exclusively for verified college students. Buy cheaper textbooks, lecture notes, lab tools, and hostel equipment.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onSubmit={handleSearchSubmit}
            class="max-w-2xl mx-auto flex items-center p-2 rounded-2xl bg-white shadow-soft border border-slate-150 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all duration-300"
          >
            <div class="flex-1 flex items-center gap-2 pl-3">
              <Search class="text-slate-400 shrink-0" size={20} />
              <input
                type="text"
                placeholder="What are you looking for today? (e.g. lab coat, semester 4 notes)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                class="w-full bg-transparent border-none outline-none text-sm text-textMain placeholder-slate-400 py-3"
              />
            </div>
            <button
              type="submit"
              class="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-sm shadow-soft hover:shadow-soft-hover transition-all shrink-0"
            >
              Search
            </button>
          </motion.form>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            class="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <Link
              to="/browse"
              class="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-soft hover:shadow-soft-hover transition-all duration-300"
            >
              Browse Products
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/sell"
              class="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-textMain border border-slate-200 px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-colors duration-300"
            >
              Sell an Item
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Categories Quick Selector */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-extrabold text-textMain">Browse by Category</h2>
          <p class="text-sm text-textMuted">Explore item classifications specific to academic environments.</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categoriesList.map((cat, index) => (
            <Link
              key={index}
              to={`/browse?category=${encodeURIComponent(cat.name)}`}
              class="flex flex-col items-center justify-center p-5 bg-white border border-slate-100 rounded-2xl shadow-soft hover:shadow-soft-hover hover:border-primary/20 hover:translate-y-[-2px] transition-all duration-300 text-center space-y-3 group"
            >
              <span class="text-3xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
              <span class="text-xs font-bold text-textMain group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Latest Listings */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div class="flex justify-between items-end">
          <div class="space-y-1">
            <h2 class="text-2xl font-extrabold text-textMain">Latest Listings</h2>
            <p class="text-sm text-textMuted">Directly from our college student network.</p>
          </div>
          <Link
            to="/browse"
            class="text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
          >
            See all listings
            <ArrowRight size={16} class="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : products.length === 0 ? (
          /* Premium Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            class="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 text-center space-y-4"
          >
            <div class="p-4 rounded-full bg-slate-100 text-slate-400">
              <ShieldAlert size={36} />
            </div>
            <div class="space-y-1">
              <h3 class="text-lg font-bold text-textMain">No products available yet.</h3>
              <p class="text-sm text-textMuted max-w-sm mx-auto">
                No listings available. Be the first student to upload a book, notes, or lab supplies!
              </p>
            </div>
            <Link
              to="/sell"
              class="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-semibold text-xs transition-colors"
            >
              List an Item Now
            </Link>
          </motion.div>
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
