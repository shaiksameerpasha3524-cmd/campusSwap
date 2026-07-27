import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { Edit3, Trash2, MapPin, Loader2, Check, ShoppingBag, X, HelpCircle, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const MyListings = () => {
  const { user } = useAuth()
  
  // Listings and loading states
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null)
  const [updating, setUpdating] = useState(false)

  // Categories list
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

  // Conditions list
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  // Fetch only this student's listings
  const fetchMyListings = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setListings(data || [])
    } catch (err) {
      console.error('Error fetching listings:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyListings()
  }, [user])

  // Delete product listing
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this listing permanently?')
    if (!confirmDelete) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setListings((prev) => prev.filter((p) => p.id !== id))
      toast.success('Listing deleted successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing.')
    }
  }

  // Edit Modal Opener
  const openEditModal = (product) => {
    setEditingProduct(product)
    
    // Set form field values
    setValue('title', product.title)
    setValue('category', product.category)
    setValue('price', product.price)
    setValue('condition', product.condition)
    setValue('location', product.location)
    setValue('phone', product.phone)
    setValue('description', product.description)
  }

  // Update Listing
  const onUpdateSubmit = async (data) => {
    if (!editingProduct) return
    
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: data.title,
          category: data.category,
          price: parseFloat(data.price),
          condition: data.condition,
          location: data.location,
          phone: data.phone,
          description: data.description,
        })
        .eq('id', editingProduct.id)

      if (error) throw error

      toast.success('Listing updated successfully!')
      setEditingProduct(null)
      fetchMyListings() // reload lists
    } catch (err) {
      toast.error(err.message || 'Failed to update listing.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1 flex flex-col">
      <div>
        <h1 class="text-3xl font-black text-textMain tracking-tight">My Listings</h1>
        <p class="text-sm text-textMuted mt-1">Manage, update, or remove the items you are selling.</p>
      </div>

      {loading ? (
        <div class="flex-1 flex justify-center items-center py-20">
          <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : listings.length === 0 ? (
        /* Empty State */
        <div class="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-3xl bg-white text-center space-y-4">
          <div class="p-4 rounded-full bg-slate-50 text-slate-400">
            <ShoppingBag size={36} />
          </div>
          <div class="space-y-1">
            <h3 class="text-lg font-bold text-textMain">No listings created yet.</h3>
            <p class="text-sm text-textMuted max-w-sm">
              You haven't listed any products yet. If you have an active seller membership, list your first item now!
            </p>
          </div>
          <Link
            to="/sell"
            class="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-soft"
          >
            Create Listing
          </Link>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((product) => {
            const displayImg = product.images && product.images.length > 0 
              ? product.images[0] 
              : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300'

            return (
              <div
                key={product.id}
                class="bg-white rounded-2xl border border-slate-100 p-4 shadow-soft hover:shadow-soft-hover transition-all duration-300 flex gap-4"
              >
                {/* Product Thumbnail */}
                <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img src={displayImg} alt={product.title} class="w-full h-full object-cover" />
                </div>

                {/* Details & Actions */}
                <div class="flex-1 min-w-0 flex flex-col justify-between">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded">
                        {product.category}
                      </span>
                      <span class="text-[10px] text-textMuted font-bold uppercase">
                        {product.condition}
                      </span>
                    </div>
                    <h3 class="text-base font-bold text-textMain truncate">{product.title}</h3>
                    <div class="text-sm font-black text-primary">
                      ₹{product.price}
                    </div>
                    <div class="text-xs text-textMuted flex items-center gap-1">
                      <MapPin size={12} /> {product.location}
                    </div>
                  </div>

                  {/* Modify Controls */}
                  <div class="flex items-center gap-3 pt-3 border-t border-slate-50 mt-2">
                    <button
                      onClick={() => openEditModal(product)}
                      class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-primary/5 hover:text-primary text-textMuted border border-slate-100 hover:border-primary/20 rounded-xl text-xs font-bold transition-all"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 transition-colors"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Modal Popup */}
      <AnimatePresence>
        {editingProduct && (
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              class="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-100 shadow-xl space-y-4 overflow-y-auto max-h-[90vh]"
            >
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 class="font-extrabold text-textMain text-base">Edit Product Details</h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  class="text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onUpdateSubmit)} class="space-y-4">
                {/* Title */}
                <div>
                  <label class="block text-xs font-semibold text-textMain">Product Title</label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    class="mt-1 block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Grid for Category, Condition, Price */}
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-textMain">Category</label>
                    <select
                      {...register('category', { required: true })}
                      class="mt-1 block w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none"
                    >
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-textMain">Condition</label>
                    <select
                      {...register('condition', { required: true })}
                      class="mt-1 block w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none"
                    >
                      {conditions.map((cond, idx) => (
                        <option key={idx} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-textMain">Price (₹)</label>
                    <input
                      type="number"
                      {...register('price', { required: true, min: 0 })}
                      class="mt-1 block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-textMain">Pickup Location</label>
                    <input
                      type="text"
                      {...register('location', { required: true })}
                      class="mt-1 block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-textMain">WhatsApp Number</label>
                  <input
                    type="text"
                    {...register('phone', { required: true })}
                    class="mt-1 block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-textMain">Description</label>
                  <textarea
                    rows={4}
                    {...register('description', { required: true })}
                    class="mt-1 block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  class="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold text-sm rounded-xl transition-all shadow-soft flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 size={16} class="animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyListings
