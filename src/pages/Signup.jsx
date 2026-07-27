import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Lock, School, BookOpen, Layers, Phone, Loader2, MailCheck } from 'lucide-react'
import { toast as hotToast } from 'react-hot-toast'
import { motion } from 'framer-motion'

const Signup = () => {
  const { signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      college: '',
      department: '',
      semester: '',
      phone: '',
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await signUp(data.email, data.password, {
        fullName: data.fullName,
        college: data.college,
        department: data.department,
        semester: data.semester,
        phone: data.phone,
      })
      setSuccess(true)
      hotToast.success('Account created successfully!')
    } catch (err) {
      hotToast.error(err.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-appBg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          class="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-2xl shadow-soft border border-slate-100 text-center space-y-6"
        >
          <div class="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-500">
            <MailCheck size={48} />
          </div>
          <h2 class="text-2xl font-extrabold text-textMain">Verify your email</h2>
          <p class="text-sm text-textMuted leading-relaxed">
            We have sent a verification link to your email address. Please click the link to activate your account and access the CampusSwap college marketplace.
          </p>
          <div class="pt-4">
            <Link
              to="/login"
              class="inline-flex justify-center items-center px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all shadow-soft"
            >
              Go to Login
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
        class="sm:mx-auto sm:w-full sm:max-w-lg"
      >
        <h2 class="text-center text-3xl font-extrabold text-textMain tracking-tight">
          Create Student Account
        </h2>
        <p class="mt-2 text-center text-sm text-textMuted">
          Join your campus marketplace and trade academic items securely.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        class="mt-8 sm:mx-auto sm:w-full sm:max-w-lg"
      >
        <div class="bg-white py-8 px-6 shadow-soft rounded-2xl border border-slate-100 sm:px-10">
          <form class="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" class="block text-sm font-semibold text-textMain">
                Full Name
              </label>
              <div class="mt-1 relative rounded-xl shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  {...register('fullName', { required: 'Full name is required' })}
                  class={`block w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.fullName ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
                    }`}
                />
              </div>
              {errors.fullName && (
                <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" class="block text-sm font-semibold text-textMain">
                College Email Address
              </label>
              <div class="mt-1 relative rounded-xl shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="johndoe@college.edu"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address format',
                    },
                  })}
                  class={`block w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.email ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
                    }`}
                />
              </div>
              {errors.email && (
                <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" class="block text-sm font-semibold text-textMain">
                Password
              </label>
              <div class="mt-1 relative rounded-xl shadow-sm">
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
                  class={`block w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.password ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
                    }`}
                />
              </div>
              {errors.password && (
                <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.password.message}</p>
              )}
            </div>

            {/* College */}
            <div>
              <label htmlFor="college" class="block text-sm font-semibold text-textMain">
                College Name
              </label>
              <div class="mt-1 relative rounded-xl shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <School size={18} />
                </div>
                <input
                  id="college"
                  type="text"
                  placeholder="State Technological University"
                  {...register('college', { required: 'College name is required' })}
                  class={`block w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.college ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
                    }`}
                />
              </div>
              {errors.college && (
                <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.college.message}</p>
              )}
            </div>

            {/* Grid for Dept & Semester & Phone */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" class="block text-sm font-semibold text-textMain">
                  Department
                </label>
                <div class="mt-1 relative rounded-xl shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <BookOpen size={16} />
                  </div>
                  <input
                    id="department"
                    type="text"
                    placeholder="Computer Science"
                    {...register('department', { required: 'Department is required' })}
                    class={`block w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.department ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
                      }`}
                  />
                </div>
                {errors.department && (
                  <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.department.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="semester" class="block text-sm font-semibold text-textMain">
                  Semester (e.g. 5th)
                </label>
                <div class="mt-1 relative rounded-xl shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Layers size={16} />
                  </div>
                  <input
                    id="semester"
                    type="text"
                    placeholder="5th"
                    {...register('semester', { required: 'Semester is required' })}
                    class={`block w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.semester ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
                      }`}
                  />
                </div>
                {errors.semester && (
                  <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.semester.message}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" class="block text-sm font-semibold text-textMain">
                WhatsApp Phone Number
              </label>
              <div class="mt-1 relative rounded-xl shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  id="phone"
                  type="text"
                  placeholder="+91 98765 43210"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[0-9\s-]{10,14}$/,
                      message: 'Please enter a valid phone number',
                    },
                  })}
                  class={`block w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.phone ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
                    }`}
                />
              </div>
              {errors.phone && (
                <p class="mt-1 text-xs text-rose-500 font-semibold">{errors.phone.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-soft text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 size={18} class="animate-spin" />
                  Creating Student Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Redirect to Login */}
          <div class="mt-6 text-center">
            <p class="text-sm text-textMuted">
              Already have an account?{' '}
              <Link to="/login" class="font-bold text-primary hover:text-primary-hover">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Signup
