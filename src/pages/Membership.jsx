import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { initializeRazorpayPayment } from '../services/razorpay'
import { CheckCircle, ShieldCheck, CreditCard, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

const Membership = () => {
  const { user, profile, refreshProfileAndMembership } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Local loading states
  const [paying, setPaying] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [successPaymentId, setSuccessPaymentId] = useState('')

  // Route back to previous target (usually /sell) or /dashboard
  const fromTarget = location.state?.from?.pathname || '/sell'

  const handlePayment = async () => {
    if (!user || !profile) {
      toast.error('Please login to purchase a membership.')
      navigate('/login')
      return
    }

    setPaying(true)
    try {
      await initializeRazorpayPayment({
        amount: 49,
        studentName: profile.full_name,
        studentEmail: profile.email,
        studentPhone: profile.phone || '',
        onSuccess: async (response) => {
          // Compute dates
          const startDate = new Date()
          const expiryDate = new Date()
          expiryDate.setDate(startDate.getDate() + 30) // valid for 30 days

          // Insert into memberships table
          const { error: insertError } = await supabase.from('memberships').insert({
            user_id: user.id,
            payment_id: response.paymentId,
            amount: 49,
            status: 'active',
            start_date: startDate.toISOString(),
            expiry_date: expiryDate.toISOString(),
          })

          if (insertError) {
            console.error('Failed to save membership:', insertError.message)
            toast.error('Payment succeeded but membership database logging failed. Please contact support.')
            setPaying(false)
            return
          }

          // Trigger context refresh to update membership state
          await refreshProfileAndMembership()
          
          setSuccessPaymentId(response.paymentId)
          setPaymentSuccess(true)
          toast.success('Membership activated!')
          setPaying(false)
        },
        onFailure: (err) => {
          toast.error(err.message || 'Payment failed or cancelled.')
          setPaying(false)
        },
      })
    } catch (err) {
      toast.error('An error occurred starting checkout.')
      setPaying(false)
    }
  }

  if (paymentSuccess) {
    return (
      <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-appBg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          class="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-2xl border border-slate-100 shadow-soft text-center space-y-6"
        >
          <div class="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-500">
            <CheckCircle size={48} />
          </div>
          <h2 class="text-2xl font-black text-textMain">Payment Successful!</h2>
          <p class="text-sm text-textMuted leading-relaxed">
            Your paid Seller Membership is now active. You have full privileges to list, update, and manage your products on CampusSwap for the next 30 days.
          </p>
          <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl text-left text-xs space-y-1 text-textMuted">
            <div><strong>Payment ID:</strong> {successPaymentId}</div>
            <div><strong>Validity:</strong> 30 Days (Starts now)</div>
          </div>
          <div class="pt-2">
            <button
              onClick={() => navigate(fromTarget)}
              class="w-full py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-soft hover:shadow-soft-hover transition-all"
            >
              Continue to Sell Item
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-appBg">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <h2 class="text-3xl font-black text-textMain tracking-tight">Seller Membership</h2>
        <p class="text-sm text-textMuted max-w-sm mx-auto">
          Students can browse completely FREE. Listing, editing, or deleting items requires a Seller Membership.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        class="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div class="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          {/* Header Badge */}
          <div class="bg-primary p-6 text-white text-center space-y-2 relative">
            <div class="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Popular
            </div>
            <h3 class="text-lg font-bold">Standard Paid Plan</h3>
            <div class="flex items-baseline justify-center gap-1">
              <span class="text-4xl font-black">₹49</span>
              <span class="text-xs font-semibold opacity-85">/ 30 Days</span>
            </div>
          </div>

          {/* Pricing Features */}
          <div class="p-6 space-y-6">
            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
                <span class="text-sm text-textMain font-medium">Upload up to 5 listings simultaneously</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
                <span class="text-sm text-textMain font-medium">Upload multiple high-quality product images</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
                <span class="text-sm text-textMain font-medium">Edit, update, or delete your active listings</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
                <span class="text-sm text-textMain font-medium">Verification badges on seller card details</span>
              </li>
              <li class="flex items-start gap-3">
                <ShieldCheck size={18} className="text-primary mt-0.5 shrink-0" />
                <span class="text-sm text-textMain font-medium">100% secure campus payment processing</span>
              </li>
            </ul>

            <hr class="border-slate-100" />

            {/* Buy Action Trigger */}
            <button
              onClick={handlePayment}
              disabled={paying}
              class="w-full flex justify-center items-center gap-2 py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold text-sm rounded-xl transition-all shadow-soft hover:shadow-soft-hover"
            >
              {paying ? (
                <>
                  <Loader2 size={18} class="animate-spin" />
                  Processing checkout...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Pay ₹49
                </>
              )}
            </button>

            <div class="text-center text-[10px] text-textMuted">
              By purchasing, you agree to the Student Seller guidelines and honor code. Secure payments powered by Razorpay.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Membership
