import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import SavedItems from './pages/SavedItems'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'

// Pages
import Home from './pages/Home'
import Browse from './pages/Browse'
import ProductDetails from './pages/ProductDetails'
import SellItem from './pages/SellItem'
import MyListings from './pages/MyListings'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Membership from './pages/Membership'
import NotFound from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* React Hot Toast for modern popup notifications */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#FFFFFF',
              color: '#1E293B',
              borderRadius: '12px',
              border: '1px solid #F1F5F9',
              boxShadow: '0 4px 20px -2px rgba(11, 92, 255, 0.05)',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'Outfit, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#0B5CFF', // Primary blue for success toasts
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#F43F5E',
                secondary: '#FFFFFF',
              },
            },
          }}
        />

        {/* Global Navbar */}
        <Navbar />

        {/* Main Content Router */}
        <main class="flex-1 flex flex-col">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/membership" element={<Membership />} />

            {/* Standard Student Authenticated Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/saved" element={<SavedItems />} />
            </Route>

            {/* Paid Seller Membership Authenticated Routes */}
            <Route element={<PrivateRoute requireMembership={true} />}>
              <Route path="/sell" element={<SellItem />} />
              <Route path="/my-listings" element={<MyListings />} />
            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </Router>
    </AuthProvider>
  )
}

export default App
