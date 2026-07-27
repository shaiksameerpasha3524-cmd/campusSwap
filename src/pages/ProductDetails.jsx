import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../hooks/useFavorites'
import { 
  MapPin, 
  MessageSquare, 
  Phone, 
  Share2, 
  Link2, 
  AlertTriangle, 
  Heart, 
  ArrowLeft,
  Calendar,
  CheckCircle,
  HelpCircle
} from 'lucide-react'
import { ProductDetailSkeleton } from '../components/Skeleton'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()

  // State Management
  const [product, setProduct] = useState(null)
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  
  // Reporting Modal States
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)

  // Fetch product and seller metadata from Supabase
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, profiles(*)')
          .eq('id', id)
          .single()

        if (error) throw error

        if (data) {
          // Deconstruct profiles nesting
          const { profiles, ...productData } = data
          setProduct(productData)
          setSeller(profiles)
        }
      } catch (err) {
        console.error('Error fetching product details:', err.message)
        toast.error('Product not found or has been deleted.')
        navigate('/browse')
      } finally {
        setLoading(false)
      }
    }

    fetchProductDetails()
  }, [id, navigate])

  if (loading) {
    return (
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductDetailSkeleton />
      </div>
    )
  }

  if (!product) {
    return (
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 class="text-2xl font-bold">Product not found</h2>
        <Link to="/browse" class="text-primary font-bold hover:underline">
          Go back to browsing
        </Link>
      </div>
    )
  }

  // Formatting price to INR
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price)

  // Link copy to clipboard
  const handleCopyLink = () => {
    const productUrl = window.location.href
    navigator.clipboard.writeText(productUrl)
    toast.success('Product link copied to clipboard!')
  }

  // Web Share API
  const handleShareProduct = async () => {
    const productUrl = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} on CampusSwap!`,
          url: productUrl,
        })
      } catch (err) {
        console.log('Share dismissed')
      }
    } else {
      handleCopyLink()
    }
  }

  // Submit report to Supabase
  const handleReportSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to report a product.')
      return
    }
    if (!reportReason.trim()) {
      toast.error('Please specify a reason.')
      return
    }

    setSubmittingReport(true)
    try {
      const { error } = await supabase.from('reports').insert({
        product_id: product.id,
        reporter_id: user.id,
        reason: reportReason.trim(),
      })

      if (error) throw error

      toast.success('Thank you. Product has been reported for review.')
      setReportModalOpen(false)
      setReportReason('')
    } catch (err) {
      toast.error(err.message || 'Failed to submit report.')
    } finally {
      setSubmittingReport(false)
    }
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800']

  // Prepares the WhatsApp prefill message URL
  const cleanPhone = product.phone.replace(/[^0-9+]/g, '')
  const whatsappText = encodeURIComponent(
    `Hi ${seller?.full_name || 'Seller'}, I am interested in buying your product "${product.title}" listed on CampusSwap for ${formattedPrice}. Is it still available?`
  )
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone : '+91' + cleanPhone}?text=${whatsappText}`

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          class="inline-flex items-center gap-2 text-sm font-semibold text-textMuted hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Listings
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Images Grid */}
        <div class="lg:col-span-7 space-y-4">
          <div class="bg-white dark:bg-slate-900 border border-slate-100 rounded-3xl overflow-hidden shadow-soft aspect-[4/3] relative flex items-center justify-center">
            <img
              src={images[activeImageIndex]}
              alt={product.title}
              class="w-full h-full object-cover"
            />
            {user && (
              <button
                onClick={() => toggleFavorite(product.id)}
                class="absolute top-4 right-4 p-3 rounded-full bg-white/90 shadow-md hover:scale-105 active:scale-95 transition-all text-slate-400 hover:text-rose-500"
              >
                <Heart
                  size={20}
                  className={isFavorite(product.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}
                />
              </button>
            )}
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div class="grid grid-cols-5 gap-3">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  class={`aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 transition-all ${
                    activeImageIndex === index ? 'border-primary' : 'border-transparent hover:border-slate-350'
                  }`}
                >
                  <img src={img} alt={`thumbnail-${index}`} class="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details Pane */}
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-5">
            {/* Tag & Date */}
            <div class="flex items-center justify-between">
              <span class="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-lg">
                {product.category}
              </span>
              <span class="text-xs text-textMuted flex items-center gap-1">
                <Calendar size={12} />
                {new Date(product.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* Title & Condition */}
            <div class="space-y-2">
              <h1 class="text-2xl sm:text-3xl font-black text-textMain leading-tight">
                {product.title}
              </h1>
              <div class="flex items-center gap-2">
                <span class="text-xs text-textMuted font-medium">Condition:</span>
                <span class="bg-slate-100 text-textMain text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  {product.condition}
                </span>
              </div>
            </div>

            {/* Pricing Card */}
            <div class="bg-primary/5 p-4 rounded-2xl flex items-center justify-between">
              <span class="text-sm font-semibold text-textMuted">Price</span>
              <span class="text-3xl font-black text-primary">
                {formattedPrice}
              </span>
            </div>

            {/* Description */}
            <div class="space-y-2">
              <h3 class="font-bold text-textMain text-sm uppercase tracking-wider">Description</h3>
              <p class="text-sm text-textMuted leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Map Location */}
            <div class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs text-textMuted">
              <MapPin size={16} className="text-primary shrink-0" />
              <span class="font-medium truncate">Available at: <strong>{product.location}</strong></span>
            </div>

            {/* Share and Action Triggers */}
            <div class="flex gap-3 pt-2">
              <button
                onClick={handleShareProduct}
                class="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-textMain font-bold text-sm rounded-xl transition-colors"
              >
                <Share2 size={16} /> Share
              </button>
              <button
                onClick={handleCopyLink}
                class="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-textMain font-bold text-sm rounded-xl transition-all"
              >
                <Link2 size={16} /> Copy Link
              </button>
            </div>
          </div>

          {/* Seller Metadata Box */}
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-4">
            <h3 class="font-bold text-textMain text-sm uppercase tracking-wider">Seller Information</h3>
            
            {seller ? (
              <div class="flex items-center gap-4">
                {seller.profile_photo ? (
                  <img
                    src={seller.profile_photo}
                    alt={seller.full_name}
                    class="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {seller.full_name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-bold text-textMain truncate">{seller.full_name}</div>
                  <div class="text-xs text-textMuted truncate">{seller.college || 'Verified College Student'}</div>
                  <div class="text-[10px] text-primary font-bold">
                    {seller.department} {seller.semester ? `| Semester ${seller.semester}` : ''}
                  </div>
                </div>
              </div>
            ) : (
              <p class="text-xs text-textMuted">Seller profile unavailable</p>
            )}

            {/* Dynamic Buttons: contact seller */}
            {user ? (
              <div class="space-y-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20ba56] text-white font-bold text-sm rounded-xl shadow-sm transition-colors text-center"
                >
                  <MessageSquare size={16} /> Contact via WhatsApp
                </a>
                <div class="flex items-center justify-center gap-2 text-xs font-bold text-textMuted bg-slate-50 py-2.5 rounded-xl border border-slate-100">
                  <Phone size={14} className="text-primary" /> {product.phone}
                </div>
              </div>
            ) : (
              <div class="pt-2">
                <Link
                  to="/login"
                  class="block w-full text-center py-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-soft"
                >
                  Login to Contact Seller
                </Link>
              </div>
            )}

            {/* Report Button */}
            {user && (
              <button
                onClick={() => setReportModalOpen(true)}
                class="w-full text-center text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5 pt-2"
              >
                <AlertTriangle size={14} /> Report this Product
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal Popup */}
      <AnimatePresence>
        {reportModalOpen && (
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              class="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-xl space-y-4"
            >
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 class="font-extrabold text-textMain flex items-center gap-2 text-base">
                  <AlertTriangle class="text-rose-500" size={20} /> Report Product
                </h3>
                <button
                  onClick={() => setReportModalOpen(false)}
                  class="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleReportSubmit} class="space-y-4">
                <div class="space-y-1">
                  <label class="block text-xs font-semibold text-textMain">Reason for Reporting</label>
                  <textarea
                    placeholder="Provide details about why this product is inappropriate, fake, overpriced, or contains prohibited items."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    rows={4}
                    class="block w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReport}
                  class="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {submittingReport ? 'Submitting Report...' : 'Submit Report'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProductDetails
