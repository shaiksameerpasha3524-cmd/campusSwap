import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'

/**
 * Custom hook to manage user's wishlisted products.
 */
export const useFavorites = () => {
  const { user } = useAuth()
  const [favoriteProductIds, setFavoriteProductIds] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch all favorited product IDs for the logged-in user
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteProductIds([])
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id)

      if (error) throw error

      const ids = data.map((fav) => fav.product_id)
      setFavoriteProductIds(ids)
    } catch (err) {
      console.error('Error fetching favorites:', err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  // Toggle favorite state of a product
  const toggleFavorite = async (productId) => {
    if (!user) {
      toast.error('Please login to add items to your wishlist')
      return false
    }

    const isFav = favoriteProductIds.includes(productId)
    setLoading(true)

    try {
      if (isFav) {
        // Delete from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId)

        if (error) throw error

        setFavoriteProductIds((prev) => prev.filter((id) => id !== productId))
        toast.success('Removed from wishlist')
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId,
          })

        if (error) throw error

        setFavoriteProductIds((prev) => [...prev, productId])
        toast.success('Added to wishlist')
      }
      return true
    } catch (err) {
      toast.error(err.message || 'Failed to toggle favorite')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Check if a specific product is favorited
  const isFavorite = (productId) => {
    return favoriteProductIds.includes(productId)
  }

  return {
    favoriteProductIds,
    loading,
    toggleFavorite,
    isFavorite,
    refreshFavorites: fetchFavorites,
  }
}
