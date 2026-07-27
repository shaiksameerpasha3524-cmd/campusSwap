import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer class="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Intro */}
          <div class="md:col-span-2 space-y-4">
            <Link to="/" class="flex items-center gap-2">
              <span class="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CampusSwap
              </span>
            </Link>
            <p class="text-sm text-textMuted max-w-sm">
              The exclusive marketplace built only for college students. Swap books, lecture notes, lab materials, calculators, and hostel essentials securely within your campus.
            </p>
            <div class="text-xs text-textMuted">
              Built exclusively for student communities.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 class="text-sm font-bold text-textMain uppercase tracking-wider mb-4">Marketplace</h4>
            <ul class="space-y-2">
              <li>
                <Link to="/" class="text-sm text-textMuted hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" class="text-sm text-textMuted hover:text-primary transition-colors">
                  Browse Items
                </Link>
              </li>
              <li>
                <Link to="/sell" class="text-sm text-textMuted hover:text-primary transition-colors">
                  Sell an Item
                </Link>
              </li>
              <li>
                <Link to="/membership" class="text-sm text-textMuted hover:text-primary transition-colors">
                  Seller Memberships
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 class="text-sm font-bold text-textMain uppercase tracking-wider mb-4">Popular Categories</h4>
            <ul class="space-y-2">
              <li>
                <Link to="/browse?category=Books" class="text-sm text-textMuted hover:text-primary transition-colors">
                  Academic Books
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Notes" class="text-sm text-textMuted hover:text-primary transition-colors">
                  Lecture Notes
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Calculators" class="text-sm text-textMuted hover:text-primary transition-colors">
                  Calculators & Lab Coats
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Hostel Essentials" class="text-sm text-textMuted hover:text-primary transition-colors">
                  Hostel Essentials
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-slate-100 dark:border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="text-xs text-textMuted">
            &copy; {currentYear} CampusSwap. All rights reserved.
          </p>
          <div class="flex gap-6">
            <span class="text-xs text-textMuted hover:text-primary transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span class="text-xs text-textMuted hover:text-primary transition-colors cursor-pointer">
              Terms of Service
            </span>
            <span class="text-xs text-textMuted hover:text-primary transition-colors cursor-pointer">
              Student Honor Code
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
