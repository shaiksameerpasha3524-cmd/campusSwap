import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../services/supabase'
import { Mail, ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '' },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/profile`, // redirect here where they can update their password
      })
      if (error) throw error
      setSubmitted(true)
      toast.success('Password reset link sent!')
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-appBg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          class="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-2xl shadow-soft border border-slate-100 text-center space-y-6"
        >
          <div class="inline-flex p-4 rounded-full bg-primary/10 text-primary">
            <MailCheck size={40} />
          </div>
          <h2 class="text-2xl font-extrabold text-textMain">Check your email</h2>
          <p class="text-sm text-textMuted leading-relaxed">
            We have sent password recovery instructions to your email. Please follow the instructions to securely reset your password.
          </p>
          <div class="pt-2">
            <Link
              to="/login"
              class="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-appBg">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        class="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <h2 class="text-center text-3xl font-extrabold text-textMain tracking-tight">
          Forgot Password
        </h2>
        <p class="mt-2 text-center text-sm text-textMuted">
          Enter your registered college email and we will send a password reset link.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        class="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div class="bg-white py-8 px-6 shadow-soft rounded-2xl border border-slate-100 sm:px-10">
          <form class="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email input */}
            <div>
              <label htmlFor="email" class="block text-sm font-semibold text-textMain">
                College Email Address
              </label>
              <div class="mt-1.5 relative rounded-xl shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="student@college.edu"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  class={`block w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && (
                <p class="mt-1.5 text-xs text-rose-500 font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-soft text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 size={18} class="animate-spin" />
                  Sending Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back button */}
          <div class="mt-6 text-center">
            <Link
              to="/login"
              class="inline-flex items-center gap-2 text-sm font-bold text-textMuted hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
