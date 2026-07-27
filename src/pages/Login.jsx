import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

const Login = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Redirection target after login
  const from = location.state?.from?.pathname || '/dashboard'

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await signIn(data.email, data.password)
      toast.success('Welcome back, student!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-appBg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        class="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div class="flex justify-center">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black">
            🔄
          </div>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-textMain tracking-tight">
          Welcome to CampusSwap
        </h2>
        <p class="mt-2 text-center text-sm text-textMuted">
          Sign in to your college account to browse & contact sellers.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
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
                  placeholder="name@college.edu"
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

            {/* Password input */}
            <div>
              <div class="flex items-center justify-between">
                <label htmlFor="password" class="block text-sm font-semibold text-textMain">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  class="text-xs font-bold text-primary hover:text-primary-hover"
                >
                  Forgot password?
                </Link>
              </div>
              <div class="mt-1.5 relative rounded-xl shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters long',
                    },
                  })}
                  class={`block w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.password
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.password && (
                <p class="mt-1.5 text-xs text-rose-500 font-semibold">{errors.password.message}</p>
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
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Redirect to Signup */}
          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-slate-100"></div>
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="px-2 bg-white text-textMuted font-medium">New to CampusSwap?</span>
              </div>
            </div>

            <div class="mt-6">
              <Link
                to="/signup"
                class="w-full flex justify-center items-center py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-textMain hover:bg-slate-50 transition-colors"
              >
                Create Student Account
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
