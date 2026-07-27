import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { uploadProductImages } from '../services/supabase'
import { supabase } from '../services/supabase'
import { 
  UploadCloud, 
  Trash2, 
  Loader2, 
  Check, 
  MapPin, 
  Phone,
  IndianRupee,
  FileText,
  BadgeAlert
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

const SellItem = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Local state for image file uploads and previews
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [submitting, setSubmitting] = useState(false)

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
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: '',
      category: '',
      price: '',
      condition: '',
      location: '',
      phone: '',
      description: '',
    },
  })

  // Handle image files selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Enforce limits
    if (images.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 images.')
      return
    }

    const newImages = [...images, ...files]
    const newPreviews = [...previews, ...files.map((file) => URL.createObjectURL(file))]

    setImages(newImages)
    setPreviews(newPreviews)
  }

  // Delete an image preview before submitting
  const deleteImage = (indexToDelete) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[indexToDelete])

    setImages((prev) => prev.filter((_, idx) => idx !== indexToDelete))
    setPreviews((prev) => prev.filter((_, idx) => idx !== indexToDelete))
  }

  // Submit Listing
  const onSubmit = async (data) => {
    if (!user) {
      toast.error('Authentication error. Please re-login.')
      navigate('/login')
      return
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image of your product.')
      return
    }

    setSubmitting(true)
    try {
      // 1. Upload Images to Supabase storage bucket
      const uploadedUrls = await uploadProductImages(images, user.id)

      if (uploadedUrls.length === 0) {
        throw new Error('Image upload failed. Please try again.')
      }

      // 2. Save product row in products table
      const { error: insertError } = await supabase.from('products').insert({
        seller_id: user.id,
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        condition: data.condition,
        location: data.location,
        phone: data.phone,
        images: uploadedUrls,
      })

      if (insertError) throw insertError

      toast.success('Listing created successfully!')
      reset()
      setImages([])
      setPreviews([])
      navigate('/my-listings')
    } catch (err) {
      toast.error(err.message || 'Failed to publish listing.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1">
      <div>
        <h1 class="text-3xl font-black text-textMain tracking-tight">List Academic Item</h1>
        <p class="text-sm text-textMuted mt-1">Upload books, notes, or equipment for sale to local students.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        class="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-soft"
      >
        <form onSubmit={handleSubmit(onSubmit)} class="space-y-6">
          
          {/* Main Info Grid */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div class="md:col-span-2">
              <label htmlFor="title" class="block text-sm font-semibold text-textMain">
                Product Name / Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. HC Verma Concepts of Physics Vol 1"
                {...register('title', { required: 'Product name is required' })}
                class={`mt-1.5 block w-full border rounded-xl px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  errors.title ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.title && (
                <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.title.message}</p>
              )}
            </div>

            {/* Category Select */}
            <div>
              <label htmlFor="category" class="block text-sm font-semibold text-textMain">
                Category
              </label>
              <select
                id="category"
                {...register('category', { required: 'Please select a category' })}
                class={`mt-1.5 block w-full border rounded-xl px-4 py-3 text-sm bg-white text-textMain transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  errors.category ? 'border-rose-300' : 'border-slate-200'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.category.message}</p>
              )}
            </div>

            {/* Condition Select */}
            <div>
              <label htmlFor="condition" class="block text-sm font-semibold text-textMain">
                Condition
              </label>
              <select
                id="condition"
                {...register('condition', { required: 'Please select item condition' })}
                class={`mt-1.5 block w-full border rounded-xl px-4 py-3 text-sm bg-white text-textMain transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  errors.condition ? 'border-rose-300' : 'border-slate-200'
                }`}
              >
                <option value="">Select Condition</option>
                {conditions.map((cond, idx) => (
                  <option key={idx} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.condition.message}</p>
              )}
            </div>

            {/* Price Input */}
            <div>
              <label htmlFor="price" class="block text-sm font-semibold text-textMain flex items-center gap-1">
                Price (₹)
              </label>
              <div class="mt-1.5 relative rounded-xl shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <IndianRupee size={16} />
                </div>
                <input
                  id="price"
                  type="number"
                  placeholder="250"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price cannot be negative' },
                  })}
                  class={`block w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.price ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.price && (
                <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.price.message}</p>
              )}
            </div>

            {/* Location Input */}
            <div>
              <label htmlFor="location" class="block text-sm font-semibold text-textMain flex items-center gap-1">
                Pickup Location on Campus
              </label>
              <div class="mt-1.5 relative rounded-xl shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin size={16} />
                </div>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Hostel block C room 402"
                  {...register('location', { required: 'Campus location is required' })}
                  class={`block w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.location ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.location && (
                <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.location.message}</p>
              )}
            </div>

            {/* Phone (WhatsApp) */}
            <div>
              <label htmlFor="phone" class="block text-sm font-semibold text-textMain flex items-center gap-1">
                WhatsApp Contact Number
              </label>
              <div class="mt-1.5 relative rounded-xl shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone size={16} />
                </div>
                <input
                  id="phone"
                  type="text"
                  placeholder="e.g. 9876543210"
                  {...register('phone', {
                    required: 'WhatsApp phone number is required',
                    pattern: {
                      value: /^\+?[0-9\s-]{10,14}$/,
                      message: 'Please enter a valid phone number',
                    },
                  })}
                  class={`block w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.phone ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.phone && (
                <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label htmlFor="description" class="block text-sm font-semibold text-textMain">
              Product Description
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Tell other students about the book edition, write-up conditions, page counts, or general state..."
              {...register('description', { required: 'Please add a product description' })}
              class={`mt-1.5 block w-full border rounded-xl px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.description ? 'border-rose-300' : 'border-slate-200'
              }`}
            ></textarea>
            {errors.description && (
              <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.description.message}</p>
            )}
          </div>

          {/* Image Upload Area */}
          <div class="space-y-3">
            <label class="block text-sm font-semibold text-textMain">
              Product Images (Upload up to 5, at least 1 required)
            </label>
            
            {/* Upload Zone */}
            <div class="border-2 border-dashed border-slate-200 hover:border-primary/50 rounded-2xl p-6 transition-colors bg-slate-50 flex flex-col items-center justify-center cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={previews.length >= 5}
                class="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <UploadCloud size={36} className="text-slate-400" />
              <p class="mt-2 text-sm font-semibold text-textMain">Click to upload product images</p>
              <p class="text-xs text-textMuted mt-1">Supports PNG, JPG (Max 5 images)</p>
            </div>

            {/* Image Previews */}
            {previews.length > 0 && (
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
                {previews.map((src, index) => (
                  <div key={index} class="aspect-square rounded-xl overflow-hidden bg-slate-100 relative group border border-slate-200">
                    <img src={src} alt={`preview-${index}`} class="w-full h-full object-cover" />
                    
                    {/* Delete preview trigger */}
                    <button
                      type="button"
                      onClick={() => deleteImage(index)}
                      class="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 rounded-lg text-white opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      title="Remove Image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div class="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              class="w-full sm:w-auto flex justify-center items-center gap-2 py-3.5 px-8 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold text-sm rounded-xl transition-all shadow-soft hover:shadow-soft-hover"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} class="animate-spin" />
                  Publishing Listing...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Publish Listing
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default SellItem
