import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { FolderOpen } from 'lucide-react';

const SavedItems = () => {
  const { user } = useAuth();
  const [savedProducts, setSavedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!user) { setLoading(false); return; }
    try {
      // Get favorite product IDs
      const { data: favData, error: favError } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);
      if (favError) throw favError;
      const productIds = favData.map((f) => f.product_id);
      if (productIds.length === 0) {
        setSavedProducts([]);
        setLoading(false);
        return;
      }
      // Fetch product details
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);
      if (prodError) throw prodError;
      setSavedProducts(prodData);
    } catch (err) {
      console.error('Error loading saved items:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromSaved = async (productId) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) throw error;
      setSavedProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  useEffect(() => {
    fetchSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <div className="flex justify-center items-center py-20"><span>Loading...</span></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-black text-textMain tracking-tight">Saved Items</h1>
      {savedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <FolderOpen className="w-48 h-48 text-gray-400" />
          <h3 className="text-lg font-bold text-textMain">No saved items yet.</h3>
          <p className="text-sm text-textMuted max-w-sm">You haven’t saved any products. Browse listings and click the heart icon to save items you like.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
          {savedProducts.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
              <button
                onClick={() => removeFromSaved(product.id)}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-rose-500 rounded-full p-1 shadow-sm"
                title="Remove from saved"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
