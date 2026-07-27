import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable Card component for marketplace items.
 * @param {object} props
 * @param {object} props.product - The product object from Supabase.
 */
const ProductCard = ({ product }) => {
  const { id, title, price, category, condition, location, images, created_at } = product;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent clicking the card and triggering navigation
    toggleFavorite(id);
  };

  // Format price to INR format
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  const cardImage = images && images.length > 0
    ? images[0]
    : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'; // High quality default fallback

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200 }}
      onClick={handleCardClick}
      className="w-[300px] min-h-[400px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-soft hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col group relative"
    >
      {/* Favorite Button (Wishlist) */}
      {user && (
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-sm backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:scale-110 active:scale-95 transition-all duration-200"
          title="Add to Wishlist"
        >
          <Heart
            size={18}
            className={`transition-colors ${isFavorite(id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`}
          />
        </button>
      )}

      {/* Product Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={cardImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Category Tag overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-primary/95 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <BookOpen size={10} />
            {category}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Condition Badge */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            condition === 'New' || condition === 'Like New'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
              : condition === 'Good'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
          }`}
          >
            {condition}
          </span>
          <span className="text-[10px] text-textMuted dark:text-textMuted-dark">
            {new Date(created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-textMain dark:text-textMain-dark text-base line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-textMuted dark:text-textMuted-dark">
          <MapPin size={12} className="text-primary/75" />
          <span className="truncate">{location}</span>
        </div>

        {/* Price Section */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
          <span className="text-lg font-black text-primary">
            {formattedPrice}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-primary transition-colors">
            View Details →
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
