import React, { useContext } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const CartSlideover = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, clearCart } = useContext(CartContext);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Slideover Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-[#2FA084]/10 p-2 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-[#2FA084]" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your Cart</h2>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-semibold">
              {cart.length} items
            </span>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400">
              <ShoppingBag className="h-16 w-16 opacity-20" />
              <p className="text-lg font-medium text-slate-500">Your cart is empty</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-[#2FA084] font-medium hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group">
                <div className="w-20 h-20 bg-white dark:bg-slate-700 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600">
                  {item.imageUrl ? (
                    <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="h-6 w-6 text-slate-300" /></div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{item.category}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 h-8">
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-slate-800 dark:text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors disabled:opacity-30"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="font-bold text-[#2FA084] dark:text-[#6FCF97]">
                      ${(item.basePrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/80">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Subtotal</span>
              <span className="text-2xl font-bold text-slate-800 dark:text-white">${cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">Shipping and taxes calculated at checkout.</p>
            
            <button 
              onClick={() => {
                alert('Checkout successful! (Simulated)');
                clearCart();
                setIsCartOpen(false);
              }}
              className="w-full bg-gradient-to-r from-[#2FA084] to-[#1F6F5F] hover:from-[#1F6F5F] hover:to-[#175448] text-white font-bold h-14 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#2FA084]/20"
            >
              Checkout <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSlideover;
