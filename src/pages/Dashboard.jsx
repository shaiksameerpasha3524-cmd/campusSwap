import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { 
  User, 
  CreditCard, 
  ShoppingBag, 
  LogOut, 
  Calendar, 
  ArrowRight,
  Sparkles,
  PlusCircle,
  Clock,
  ShieldCheck
} from 'lucide-react'
import { ListingRowSkeleton } from '../components/Skeleton'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

const Dashboard = () => {
  const { user, profile, membership, hasActiveMembership, signOut } = useAuth()
  const navigate = useNavigate()

  // Listings stats
  const [listingsCount, setListingsCount] = useState(0)
  const [recentListings, setRecentListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      setLoading(true)
      try {
        // Query count of products
        const { count, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id)

        if (countError) throw countError
        setListingsCount(count || 0)

        // Query top 3 recent listings
        const { data, error: dataError } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)

        if (dataError) throw dataError
        setRecentListings(data || [])
      } catch (err) {
        console.error('Error loading dashboard stats:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      navigate('/')
    } catch (err) {
      toast.error('Logout failed.')
    }
  }

  // Calculate membership remaining days
  const getDaysRemaining = () => {
    if (!membership) return 0
    const expiry = new Date(membership.expiry_date)
    const now = new Date()
    const diffTime = expiry - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Percentage for progress bar (assuming 30 days total validity)
  const getProgressPercentage = () => {
    const days = getDaysRemaining()
    return Math.min(100, Math.max(0, (days / 30) * 100))
  }

  const daysLeft = getDaysRemaining()
  const progressPercent = getProgressPercentage()

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1">
      {/* Page Header */}
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-black text-textMain tracking-tight">Student Dashboard</h1>
          <p class="text-sm text-textMuted mt-1">
            Welcome back, <strong class="text-primary">{profile?.full_name || 'Student'}</strong>!
          </p>
        </div>

        <button
          onClick={handleLogout}
          class="flex items-center gap-2 px-4 py-2 border border-rose-100 hover:bg-rose-50 text-rose-500 rounded-xl text-xs font-bold transition-all"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>

      {/* Grid of Key Info */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile Card + Membership Status */}
        <div class="lg:col-span-4 space-y-6">
          
          {/* Welcome Profile Card */}
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-4">
            <div class="flex items-center gap-4">
              {profile?.profile_photo ? (
                <img
                  src={profile.profile_photo}
                  alt={profile.full_name}
                  class="w-16 h-16 rounded-full object-cover border border-primary/20"
                />
              ) : (
                <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                  {profile?.full_name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div class="min-w-0">
                <h3 class="text-base font-bold text-textMain truncate">{profile?.full_name}</h3>
                <p class="text-xs text-textMuted truncate">{profile?.email}</p>
                <div class="inline-flex mt-1 items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-textMuted font-bold">
                  ID Verified
                </div>
              </div>
            </div>

            <hr class="border-slate-150" />

            <div class="space-y-2 text-xs text-textMuted font-medium">
              <div class="flex justify-between">
                <span>College:</span>
                <span class="font-bold text-textMain text-right max-w-[180px] truncate" title={profile?.college}>
                  {profile?.college || 'Not set'}
                </span>
              </div>
              <div class="flex justify-between">
                <span>Department:</span>
                <span class="font-bold text-textMain truncate max-w-[180px]">
                  {profile?.department || 'Not set'}
                </span>
              </div>
              <div class="flex justify-between">
                <span>Semester:</span>
                <span class="font-bold text-textMain">
                  {profile?.semester || 'Not set'}
                </span>
              </div>
            </div>

            <Link
              to="/profile"
              class="block text-center py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-textMain transition-all"
            >
              Edit Profile details
            </Link>
          </div>

          {/* Membership Card */}
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-4">
            <h3 class="font-extrabold text-textMain text-sm uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={18} className="text-primary" /> Membership Status
            </h3>

            {hasActiveMembership ? (
              <div class="space-y-4">
                <div class="p-3 bg-emerald-50 rounded-2xl flex items-start gap-3">
                  <ShieldCheck size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <div class="text-xs font-bold text-emerald-800">Seller Membership Active</div>
                    <div class="text-[10px] text-emerald-600 mt-0.5">₹49 paid. Expires in {daysLeft} days.</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div class="space-y-1">
                  <div class="flex justify-between text-[10px] font-bold text-textMuted">
                    <span>Active Plan</span>
                    <span>{daysLeft} days left</span>
                  </div>
                  <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      class="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div class="text-[10px] text-textMuted flex items-center gap-1">
                  <Clock size={12} /> Expiry: {new Date(membership.expiry_date).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div class="space-y-4">
                <div class="p-3.5 bg-rose-50 rounded-2xl flex items-start gap-3">
                  <ShieldCheck size={20} className="text-rose-400 mt-0.5 shrink-0" />
                  <div>
                    <div class="text-xs font-bold text-rose-800">Membership Inactive</div>
                    <div class="text-[10px] text-rose-500 mt-0.5">Paid seller membership required to list items.</div>
                  </div>
                </div>

                <p class="text-xs text-textMuted leading-relaxed">
                  Browse products for free, but unlock seller capabilities (₹49 for 30 days) to upload items.
                </p>

                <Link
                  to="/membership"
                  class="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-soft hover:shadow-soft-hover transition-all"
                >
                  <Sparkles size={14} /> Buy Membership (₹49)
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Listings Stat & Recent Activity */}
        <div class="lg:col-span-8 space-y-6">
          {/* Quick Metrics Grid */}
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft flex items-center gap-4">
              <div class="p-3.5 bg-primary/10 text-primary rounded-2xl">
                <ShoppingBag size={24} />
              </div>
              <div>
                <span class="block text-2xl font-black text-textMain">{listingsCount}</span>
                <span class="block text-xs font-bold text-textMuted uppercase tracking-wider">My Listings</span>
              </div>
            </div>

            <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft flex items-center gap-4">
              <div class="p-3.5 bg-emerald-100 text-emerald-600 rounded-2xl">
                <Sparkles size={24} />
              </div>
              <div>
                <span class="block text-2xl font-black text-textMain">{hasActiveMembership ? 'Active' : 'Free'}</span>
                <span class="block text-xs font-bold text-textMuted uppercase tracking-wider">Plan Status</span>
              </div>
            </div>
          </div>

          {/* Recent Listings */}
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-6">
            <div class="flex justify-between items-center pb-2 border-b border-slate-50">
              <h3 class="font-extrabold text-textMain text-sm uppercase tracking-wider">My Recent Listings</h3>
              {listingsCount > 0 && (
                <Link
                  to="/my-listings"
                  class="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-0.5"
                >
                  View all <ArrowRight size={12} />
                </Link>
              )}
            </div>

            {loading ? (
              <div class="space-y-3">
                <ListingRowSkeleton />
                <ListingRowSkeleton />
              </div>
            ) : recentListings.length === 0 ? (
              <div class="text-center py-10 space-y-4">
                <p class="text-sm text-textMuted">You haven't listed any academic items for sale yet.</p>
                <Link
                  to={hasActiveMembership ? '/sell' : '/membership'}
                  class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-soft"
                >
                  <PlusCircle size={14} /> Sell an Item
                </Link>
              </div>
            ) : (
              <div class="space-y-4">
                {recentListings.map((p) => {
                  const itemImg = p.images && p.images.length > 0 
                    ? p.images[0] 
                    : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200'

                  return (
                    <div
                      key={p.id}
                      class="flex items-center gap-4 p-3 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors"
                    >
                      <img src={itemImg} alt={p.title} class="w-14 h-14 rounded-lg object-cover bg-slate-50 border" />
                      <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-bold text-textMain truncate">{p.title}</h4>
                        <div class="flex items-center gap-2 mt-0.5">
                          <span class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.2 rounded">
                            {p.category}
                          </span>
                          <span class="text-[10px] text-textMuted">₹{p.price}</span>
                        </div>
                      </div>
                      <Link
                        to={`/product/${p.id}`}
                        class="p-2 border border-slate-150 rounded-xl hover:bg-slate-50 text-textMuted hover:text-primary transition-all text-xs font-bold"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
