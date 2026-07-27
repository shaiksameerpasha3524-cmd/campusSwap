import React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

const NotFound = () => {
  return (
    <div class="flex-1 flex flex-col justify-center items-center py-16 px-4 bg-appBg text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        class="max-w-md space-y-6"
      >
        <div class="inline-flex p-5 rounded-full bg-rose-50 text-rose-500 shadow-sm">
          <AlertCircle size={48} />
        </div>
        
        <div class="space-y-2">
          <h1 class="text-6xl font-black text-primary">404</h1>
          <h2 class="text-2xl font-black text-textMain">Page Not Found</h2>
          <p class="text-sm text-textMuted max-w-xs mx-auto">
            The page you are looking for does not exist or has been relocated to another department.
          </p>
        </div>

        <div class="pt-4">
          <Link
            to="/"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-soft hover:shadow-soft-hover transition-all duration-300"
          >
            <ArrowLeft size={16} /> Return to Home Page
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound
