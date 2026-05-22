import React, { useState, useContext } from 'react';
import { X, ShoppingCart, Star, Minus, Plus, Sparkles, Package } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const ProductModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const discount = (product._id?.charCodeAt(2) || 0) % 40 > 15 ? (product._id?.charCodeAt(2) || 0) % 40 : 0;
  const price = discount > 0 ? product.basePrice * (1 - discount / 100) : product.basePrice;
  const rating = (3.5 + ((product._id?.charCodeAt(product._id.length - 1) || 0) % 15) / 10).toFixed(1);
  const reviews = 20 + ((product._id?.charCodeAt(0) || 0) % 200);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-scale-up">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
          <X className="h-5 w-5" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-100 dark:bg-slate-900 relative">
          {product.imageUrl ? (
            <img src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Package className="h-24 w-24 text-slate-300 dark:text-slate-700" /></div>
          )}
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1 rounded-lg shadow-lg">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2FA084] bg-[#2FA084]/10 px-2 py-1 rounded-md">{product.category}</span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md">Only {product.stock} left</span>
            )}
            {product.stock === 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md">Out of Stock</span>
            )}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">{product.name}</h2>
          
          <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">{rating}</span>
              <span className="text-slate-400 text-sm">({reviews} reviews)</span>
            </div>
          </div>

          <div className="mb-6 flex items-end gap-3">
            <span className="text-4xl font-bold text-[#2FA084] dark:text-[#6FCF97]">${price.toFixed(2)}</span>
            {discount > 0 && <span className="text-lg text-slate-400 line-through mb-1">${product.basePrice.toFixed(2)}</span>}
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">AI Product Description</h3>
            </div>
            <div className="bg-purple-50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/20 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {product.description || 'Experience the perfect blend of quality and innovation. This product has been curated to meet the highest standards of our SmartStore.'}
            </div>
            {product.seoTags && product.seoTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.seoTags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 flex gap-4">
            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg h-12">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold text-slate-800 dark:text-white">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-gradient-to-r from-[#2FA084] to-[#1F6F5F] hover:from-[#1F6F5F] hover:to-[#175448] disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold h-12 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#2FA084]/20"
            >
              <ShoppingCart className="h-5 w-5" /> 
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
