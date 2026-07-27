import React, { useState, Fragment, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, LayoutDashboard, PlusCircle, Heart, CreditCard, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const { user, profile, signOut, hasActiveMembership } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
      setMobileMenuOpen(false);
      setProfileOpen(false);
    } catch (err) {
      toast.error('Failed to log out');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItem = (to, label, extraClass = '') => (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `px-4 py-2 rounded-full font-semibold transition-colors ${
          isActive ? 'bg-primary text-white shadow-md' : 'text-textMuted hover:text-primary hover:bg-slate-50'
        } ${extraClass}`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <nav className="sticky top-0 z-50 h-[72px] flex items-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 md:px-6">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            CampusSwap
          </span>
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            College Only
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {navItem('/', 'Home')}
          {navItem('/browse', 'Browse')}
          {/* Primary CTA */}
          {navItem('/sell', 'Sell Item')}
          {navItem('/dashboard', 'Dashboard')}
        </div>

        {/* Right side: Profile & actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                {profile?.profile_photo ? (
                  <img
                    src={profile.profile_photo}
                    alt={profile.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-primary/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {profile?.full_name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                )}
                <span className="text-sm font-semibold text-textMain max-w-[120px] truncate">
                  {profile?.full_name || 'Student'}
                </span>
                {hasActiveMembership && (
                  <span className="bg-emerald-500 w-2 h-2 rounded-full ring-2 ring-white" title="Active Seller Membership" />
                )}
                <svg className="w-4 h-4 text-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 z-20"
                  >
                    <div className="py-1 space-y-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <User size={16} className="mr-2" /> My Profile
                      </Link>
                      <NavLink
                          to="/my-listings"
                          className={({ isActive }) =>
                            `flex items-center px-4 py-2 text-sm ${isActive ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}
                          `}
                        >
                          <ShoppingBag size={16} className="mr-2" /> My Listings
                        </NavLink>
                        <NavLink
                          to="/saved"
                          className={({ isActive }) =>
                            `flex items-center px-4 py-2 text-sm ${isActive ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}
                          `}
                        >
                          <Heart size={16} className="mr-2" /> Saved Items
                      </NavLink>
                      <Link
                        to="/membership"
                        className="flex items-center px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <CreditCard size={16} className="mr-2" /> Membership
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <LogOut size={16} className="mr-2" /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Fragment>
              <Link
                to="/login"
                className="text-sm font-semibold text-textMuted hover:text-primary px-3 py-2 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Sign Up
              </Link>
            </Fragment>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-textMuted hover:bg-slate-50 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden absolute top-[72px] left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
          >
            <div className="flex flex-col space-y-1 py-2">
              {navItem('/', 'Home')}
              {navItem('/browse', 'Browse')}
              {user && (
                <Fragment>
                  <NavLink
                      to="/sell"
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-full font-semibold transition-colors ${isActive ? 'bg-primary text-white shadow-md' : 'text-textMuted hover:text-primary hover:bg-slate-50'} mx-2`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                  >
                    <PlusCircle size={16} className="inline mr-1" /> Sell Item
                  </NavLink>
                  {navItem('/dashboard', 'Dashboard')}
                  <button
                    className="flex items-center px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => setProfileOpen(!profileOpen)}
                  >
                    <User size={16} className="mr-2" /> Profile
                  </button>
                  {profileOpen && (
                    <div className="space-y-1 bg-white dark:bg-slate-800 rounded-b-xl">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User size={16} className="mr-2" /> My Profile
                      </Link>
                      <Link
                        to="/my-listings"
                        className="flex items-center px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ShoppingBag size={16} className="mr-2" /> My Listings
                      </Link>
                      <Link
                        to="/saved"
                        className="flex items-center px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Heart size={16} className="mr-2" /> Saved Items
                      </Link>
                      <Link
                        to="/membership"
                        className="flex items-center px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <CreditCard size={16} className="mr-2" /> Membership
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <LogOut size={16} className="mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </Fragment>
              )}
              {!user && (
                <Fragment>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm bg-primary hover:bg-primary-hover text-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </Fragment>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
