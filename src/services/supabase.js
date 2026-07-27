import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase configuration missing: Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your local .env file.'
  )
}

// Fallback to placeholder if not initialized to prevent runtime crashes
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)

/**
 * Upload multiple files to the product-images storage bucket.
 * @param {FileList|File[]} files - Files to upload.
 * @param {string} userId - ID of the seller student.
 * @returns {Promise<string[]>} List of uploaded public image URLs.
 */
export const uploadProductImages = async (files, userId) => {
  if (!files || files.length === 0) return []

  const fileArray = Array.from(files)
  const uploadPromises = fileArray.map(async (file) => {
    const fileExt = file.name.split('.').pop()
    const uniqueId = Math.random().toString(36).substring(2, 10)
    const timestamp = Date.now()
    const filePath = `${userId}/${timestamp}-${uniqueId}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error(`Failed uploading ${file.name}:`, uploadError.message)
      throw uploadError
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
    return data.publicUrl
  })

  return Promise.all(uploadPromises)
}

/**
 * Upload a single avatar file to the profile-photos storage bucket.
 * @param {File} file - Profile image file.
 * @param {string} userId - ID of the student.
 * @returns {Promise<string>} Uploaded public photo URL.
 */
export const uploadProfilePhoto = async (file, userId) => {
  if (!file) return ''

  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // Overwrite existing avatar
    })

  if (uploadError) {
    console.error('Failed uploading avatar:', uploadError.message)
    throw uploadError
  }

  const { data } = supabase.storage.from('profile-photos').getPublicUrl(filePath)
  return data.publicUrl
}
