import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({
  user: null,
  profile: null,
  membership: null,
  hasActiveMembership: false,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  refreshProfileAndMembership: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)

  // Helper to fetch user's profile and membership status
  const fetchProfileAndMembership = async (userId) => {
    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError.message)
        // If profile doesn't exist, we can create a temporary placeholder
        setProfile(null)
      } else {
        setProfile(profileData)
      }

      // 2. Fetch Latest Active Membership
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('expiry_date', { ascending: false })
        .limit(1)

      if (membershipError) {
        console.error('Error fetching membership:', membershipError.message)
        setMembership(null)
      } else if (membershipData && membershipData.length > 0) {
        const activeMem = membershipData[0]
        const expiryDate = new Date(activeMem.expiry_date)
        const now = new Date()
        
        if (expiryDate > now) {
          setMembership(activeMem)
        } else {
          // If expired, let's update status in database (optional but clean)
          await supabase
            .from('memberships')
            .update({ status: 'expired' })
            .eq('id', activeMem.id)
          setMembership(null)
        }
      } else {
        setMembership(null)
      }
    } catch (err) {
      console.error('Error loading user profile/membership:', err)
    }
  }

  // Set up listeners for Supabase Auth state changes
  useEffect(() => {
    let authSubscription

    const initializeAuth = async () => {
      // Fetch initial session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        await fetchProfileAndMembership(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setMembership(null)
      }
      setLoading(false)

      // Listen to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          setLoading(true)
          if (currentSession?.user) {
            setUser(currentSession.user)
            await fetchProfileAndMembership(currentSession.user.id)
          } else {
            setUser(null)
            setProfile(null)
            setMembership(null)
          }
          setLoading(false)
        }
      )
      authSubscription = subscription
    }

    initializeAuth()

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [])

  // Manual refresh hook (useful after profile updates or membership payments)
  const refreshProfileAndMembership = async () => {
    if (user) {
      setLoading(true)
      await fetchProfileAndMembership(user.id)
      setLoading(false)
    }
  }

  // Sign Up method
  const signUp = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.fullName,
          college: metadata.college,
          department: metadata.department,
          semester: metadata.semester,
          phone: metadata.phone,
          profile_photo: '',
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) throw error
    return data
  }

  // Sign In method
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  // Sign Out method
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
    setMembership(null)
  }

  const hasActiveMembership = !!membership

  const value = {
    user,
    profile,
    membership,
    hasActiveMembership,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfileAndMembership,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
