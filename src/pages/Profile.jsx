import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase, uploadProfilePhoto } from '../services/supabase'
import { useForm } from 'react-hook-form'
import { 
  User, 
  School, 
  BookOpen, 
  Layers, 
  Phone, 
  Camera, 
  Loader2, 
  Check, 
  Lock,
  Mail
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

const Profile = () => {
  const { user, profile, refreshProfileAndMembership } = useAuth()
  
  // Profile update state
  const [submittingProfile, setSubmittingProfile] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Password reset state
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue,
    formState: { errors: profileErrors },
  } = useForm()

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm()

  // Pre-populate profile fields
  useEffect(() => {
    if (profile) {
      setValue('fullName', profile.full_name || '')
      setValue('college', profile.college || '')
      setValue('department', profile.department || '')
      setValue('semester', profile.semester || '')
      setValue('phone', profile.phone || '')
    }
  }, [profile, setValue])

  // Profile image upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !user) return

    setUploadingPhoto(true)
    try {
      // 1. Upload photo to Supabase storage
      const uploadedUrl = await uploadProfilePhoto(file, user.id)

      if (!uploadedUrl) throw new Error('Upload failed')

      // 2. Save image URL to profile database row
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo: uploadedUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Refresh auth context
      await refreshProfileAndMembership()
      toast.success('Profile photo updated successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to upload photo.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Handle profile details submission
  const onProfileSubmit = async (data) => {
    if (!user) return

    setSubmittingProfile(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          college: data.college,
          department: data.department,
          semester: data.semester,
          phone: data.phone,
        })
        .eq('id', user.id)

      if (error) throw error

      await refreshProfileAndMembership()
      toast.success('Profile details updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile details.')
    } finally {
      setSubmittingProfile(false)
    }
  }

  // Handle password update
  const onPasswordSubmit = async (data) => {
    setUpdatingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      resetPasswordForm()
    } catch (err) {
      toast.error(err.message || 'Failed to change password.')
    } finally {
      setUpdatingPassword(false)
    }
  }

  return (
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1">
      <div>
        <h1 class="text-3xl font-black text-textMain tracking-tight">Profile Settings</h1>
        <p class="text-sm text-textMuted mt-1">Manage your student credentials and account configurations.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left pane: Profile Avatar controller */}
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft text-center space-y-4">
          <div class="relative w-32 h-32 mx-auto">
            {profile?.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt={profile.full_name}
                class="w-full h-full rounded-full object-cover border-4 border-slate-50 shadow-sm"
              />
            ) : (
              <div class="w-full h-full rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-4xl border-4 border-slate-50">
                {profile?.full_name?.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Overlay Camera Trigger */}
            <label class="absolute bottom-0 right-0 p-2.5 bg-primary hover:bg-primary-hover text-white rounded-full cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                class="hidden"
              />
              {uploadingPhoto ? (
                <Loader2 size={16} class="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </label>
          </div>

          <div class="space-y-1">
            <h3 class="text-base font-extrabold text-textMain truncate">{profile?.full_name}</h3>
            <p class="text-xs text-textMuted flex items-center justify-center gap-1">
              <Mail size={12} /> {profile?.email}
            </p>
          </div>
        </div>

        {/* Right pane: Form controllers */}
        <div class="md:col-span-2 space-y-8">
          
          {/* Profile Details Edit Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-6"
          >
            <h3 class="text-lg font-black text-textMain">Student Credentials</h3>
            
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} class="space-y-4">
              {/* Full Name */}
              <div>
                <label class="block text-xs font-semibold text-textMain">Full Name</label>
                <div class="mt-1 relative rounded-xl shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    {...registerProfile('fullName', { required: 'Full name is required' })}
                    class="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                {profileErrors.fullName && (
                  <p class="mt-1 text-xs text-rose-500 font-semibold">{profileErrors.fullName.message}</p>
                )}
              </div>

              {/* College */}
              <div>
                <label class="block text-xs font-semibold text-textMain">College Name</label>
                <div class="mt-1 relative rounded-xl shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <School size={16} />
                  </div>
                  <input
                    type="text"
                    {...registerProfile('college', { required: 'College is required' })}
                    class="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                {profileErrors.college && (
                  <p class="mt-1 text-xs text-rose-500 font-semibold">{profileErrors.college.message}</p>
                )}
              </div>

              {/* Grid for Dept & Semester */}
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-textMain">Department</label>
                  <div class="mt-1 relative rounded-xl shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <BookOpen size={14} />
                    </div>
                    <input
                      type="text"
                      {...registerProfile('department', { required: 'Department is required' })}
                      class="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-textMain">Semester</label>
                  <div class="mt-1 relative rounded-xl shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Layers size={14} />
                    </div>
                    <input
                      type="text"
                      {...registerProfile('semester', { required: 'Semester is required' })}
                      class="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label class="block text-xs font-semibold text-textMain">WhatsApp Contact</label>
                <div class="mt-1 relative rounded-xl shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="text"
                    {...registerProfile('phone', { required: 'Phone is required' })}
                    class="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Action submit button */}
              <button
                type="submit"
                disabled={submittingProfile}
                class="flex items-center gap-2 py-2.5 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-soft"
              >
                {submittingProfile ? (
                  <>
                    <Loader2 size={14} class="animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Check size={14} /> Save Profile Details
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Password Update Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-6"
          >
            <h3 class="text-lg font-black text-textMain">Change Password</h3>
            
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-textMain">New Password</label>
                <div class="mt-1 relative rounded-xl shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    {...registerPassword('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    class="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                {passwordErrors.password && (
                  <p class="mt-1 text-xs text-rose-500 font-semibold">{passwordErrors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                class="flex items-center gap-2 py-2.5 px-6 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 size={14} class="animate-spin" /> Saving Password...
                  </>
                ) : (
                  <>
                    <Lock size={14} /> Update Password
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Profile
