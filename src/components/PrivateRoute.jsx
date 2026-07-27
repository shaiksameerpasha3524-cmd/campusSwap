import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Route protector for authenticated routes and membership-locked routes.
 * @param {object} props
 * @param {boolean} props.requireMembership - Whether the route requires an active paid membership.
 */
const PrivateRoute = ({ requireMembership = false }) => {
  const { user, hasActiveMembership, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div class="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-textMuted font-medium animate-pulse">Verifying student credentials...</p>
      </div>
    )
  }

  // 1. Guard against unauthenticated users
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 2. Guard against users without membership (e.g. attempting to Sell or Edit items)
  if (requireMembership && !hasActiveMembership) {
    return <Navigate to="/membership" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default PrivateRoute
