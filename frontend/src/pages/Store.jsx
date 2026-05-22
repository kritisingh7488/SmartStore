import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { CartContext } from '../context/CartContext';
import { fetchProducts } from '../services/api';
import { ShoppingCart, LogOut, Search, Sun, Moon, User, Package, Heart, Star, TrendingUp, Sparkles, Eye, Bell, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import ProductModal from '../components/ProductModal';
import CartSlideover from '../components/CartSlideover';

const CATEGORIES = [
  { name: 'All', icon: '🛍️' },
  { name: 'Electronics', icon: '📱' },
  { name: 'Fashion', icon: '👗' },
  { name: 'Home & Living', icon: '🏠' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Beauty', icon: '💄' },
  { name: 'Books', icon: '📚' },
  { name: 'Toys', icon: '🧸' },
  { name: 'Food', icon: '🍕' },
  { name: 'Other', icon: '📦' },
];

const Store = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { cartCount, toggleCart, addToCart } = useContext(CartContext);
  
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [wishlist, setWishlist] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(user.token, {});
        setAllProducts(data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [user.token]);

  // Client-side filtering and sorting
  useEffect(() => {
    let result = [...allProducts];

    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      result = result.filter(p => p.basePrice >= min && (max ? p.basePrice <= max : true));
    }

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.basePrice - b.basePrice); break;
      case 'price-high': result.sort((a, b) => b.basePrice - a.basePrice); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(result);
  }, [allProducts, search, categoryFilter, sortBy, priceRange]);

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    setWishlist(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const trendingProducts = allProducts.filter(p => p.stock > 0).slice(0, 4);
  const bestSellers = [...allProducts].sort((a, b) => a.stock - b.stock).filter(p => p.stock > 0).slice(0, 4);
  const aiRecommended = allProducts.filter(p => p.description && p.seoTags?.length > 0).slice(0, 4);

  const getRating = (id) => (3.5 + (id.charCodeAt(id.length - 1) % 15) / 10).toFixed(1);
  const getReviews = (id) => 20 + (id.charCodeAt(0) % 200);
  const getDiscount = (id) => {
    const d = id.charCodeAt(2) % 40;
    return d > 15 ? d : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2FA084]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300 flex flex-col font-sans">
      <CartSlideover />
      <ProductModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* ─── Premium Navbar ─── */}
      <header className="h-[72px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2FA084] to-[#1F6F5F] shadow-lg shadow-[#2FA084]/20 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-300 tracking-tight">
            SmartStore<span className="text-[#2FA084]">AI</span>
          </h1>
        </div>

        <div className="hidden lg:flex items-center flex-1 max-w-xl mx-8 relative group">
          <Search className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-[#2FA084] transition-colors" />
          <input 
            type="text" 
            placeholder="Search products, brands and categories..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3 pl-12 pr-6 focus:ring-2 focus:ring-[#2FA084]/50 outline-none text-slate-700 dark:text-slate-200 text-sm transition-all shadow-inner" 
          />
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button onClick={toggleTheme} className="p-2.5 text-slate-500 hover:text-[#2FA084] dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Toggle theme">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button className="p-2.5 text-slate-500 hover:text-pink-500 dark:text-slate-400 rounded-full hover:bg-pink-50 dark:hover:bg-pink-500/10 transition-colors relative" title="Wishlist">
            <Heart className="h-5 w-5" />
            {wishlist.size > 0 && <span className="absolute 0 right-0 h-4 w-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">{wishlist.size}</span>}
          </button>
          
          <button onClick={toggleCart} className="p-2.5 text-slate-500 hover:text-[#2FA084] dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative" title="Cart">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute 0 right-0 h-4 w-4 rounded-full bg-[#2FA084] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900 transform scale-110 shadow-sm">{cartCount}</span>
            )}
          </button>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
          
          <div className="hidden sm:flex items-center gap-3 pl-2 cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 border border-slate-300 dark:border-slate-500 flex items-center justify-center shadow-sm group-hover:shadow transition-all">
              <User className="h-4 w-4 text-slate-500 dark:text-slate-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Hello,</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">{user?.name?.split(' ')[0]}</span>
            </div>
          </div>

          <button onClick={() => { logout(); navigate('/login'); }} className="p-2.5 ml-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-500/10" title="Logout">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── Premium Hero Banner ─── */}
        <section className="relative overflow-hidden bg-slate-900 dark:bg-[#0B1120] pt-16 pb-24 md:pt-24 md:pb-32">
          {/* Decorative backgrounds */}
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-[#2FA084] blur-[120px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500 blur-[100px] opacity-20"></div>
          
          <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 flex flex-col items-start text-left animate-slide-in-right">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mb-6 shadow-inner">
                <Sparkles className="h-4 w-4 text-[#6FCF97]" />
                <span className="text-white/90 text-sm font-medium tracking-wide">AI-Powered Shopping Experience</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.15] mb-6 tracking-tight">
                Discover Products <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6FCF97] to-[#2FA084]">Curated by AI</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-lg leading-relaxed">
                Personalized recommendations, trending picks, and the best deals — expertly matched to your preferences using advanced artificial intelligence.
              </p>
              <div className="flex gap-4">
                <a href="#products" className="bg-[#2FA084] hover:bg-[#25856D] text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-[#2FA084]/25 flex items-center gap-2 hover:-translate-y-1">
                  Shop Now <ArrowRight className="h-5 w-5" />
                </a>
                <a href="#ai-picks" className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white border border-white/10 font-semibold px-8 py-4 rounded-xl transition-all flex items-center gap-2 hover:-translate-y-1">
                  View AI Picks
                </a>
              </div>
            </div>

            {/* Featured Hero Product */}
            {aiRecommended.length > 0 && (
              <div className="w-full md:w-1/2 relative perspective-1000">
                <div className="relative bg-gradient-to-tr from-white/5 to-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700">
                  <div className="absolute -top-4 -right-4 bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg transform rotate-12 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Featured Pick
                  </div>
                  <div className="h-64 rounded-2xl bg-white/5 overflow-hidden mb-6 flex items-center justify-center relative">
                    {aiRecommended[0].imageUrl ? (
                      <img src={aiRecommended[0].imageUrl.startsWith('http') ? aiRecommended[0].imageUrl : `http://localhost:5000${aiRecommended[0].imageUrl}`} className="w-full h-full object-cover mix-blend-overlay opacity-90" alt=""/>
                    ) : (
                      <Package className="h-20 w-20 text-white/20" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{aiRecommended[0].name}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">{aiRecommended[0].description}</p>
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-extrabold text-[#6FCF97]">${aiRecommended[0].basePrice.toFixed(2)}</span>
                    <button onClick={() => openProduct(aiRecommended[0])} className="text-white hover:text-[#6FCF97] flex items-center gap-1 text-sm font-semibold transition-colors">
                      Quick View <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Category Pills ─── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10 -mt-10 relative z-20">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-4 rounded-2xl shadow-xl flex gap-3 overflow-x-auto scrollbar-hide snap-x">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => { setCategoryFilter(cat.name); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                className={`snap-start flex-shrink-0 flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  categoryFilter === cat.name
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md transform scale-105'
                    : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-lg opacity-80">{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* ─── AI Recommended ─── */}
        {aiRecommended.length > 0 && (
          <section id="ai-picks" className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">AI Recommended for You</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400">Curated based on your browsing patterns and trending data.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiRecommended.map(product => (
                <ProductCard key={`ai-${product._id}`} product={product} wishlist={wishlist} toggleWishlist={toggleWishlist} getRating={getRating} getReviews={getReviews} getDiscount={getDiscount} badge="AI Pick" onOpen={() => openProduct(product)} onAdd={handleAddToCart} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Product Grid with Filters ─── */}
        <section id="products" className="max-w-7xl mx-auto px-6 lg:px-10 py-12 mb-20 bg-slate-100/50 dark:bg-slate-800/20 rounded-3xl border border-slate-200/50 dark:border-slate-700/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                {categoryFilter !== 'All' ? categoryFilter : 'Explore Collection'}
                <span className="text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">{filteredProducts.length} items</span>
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#2FA084] outline-none shadow-sm cursor-pointer">
                  <option value="newest">Sort by: Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
              <div className="relative flex-1 md:flex-none">
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#2FA084] outline-none shadow-sm cursor-pointer">
                  <option value="all">Price: All</option>
                  <option value="0-25">Under $25</option>
                  <option value="25-50">$25 to $50</option>
                  <option value="50-100">$50 to $100</option>
                  <option value="100-9999">$100 & Above</option>
                </select>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Package className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No products found</h3>
              <p className="text-slate-500 max-w-md mx-auto">We couldn't find anything matching your current filters. Try selecting a different category or price range.</p>
              <button onClick={() => {setCategoryFilter('All'); setSearch(''); setPriceRange('all');}} className="mt-6 text-[#2FA084] font-semibold hover:underline">Clear all filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} wishlist={wishlist} toggleWishlist={toggleWishlist} getRating={getRating} getReviews={getReviews} getDiscount={getDiscount} onOpen={() => openProduct(product)} onAdd={handleAddToCart} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ─── Premium Footer ─── */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 text-center md:text-left gap-6">
            <div>
               <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#2FA084] to-[#1F6F5F] rounded-lg flex items-center justify-center"><Sparkles className="h-4 w-4 text-white" /></div>
                <span className="font-bold text-xl text-slate-800 dark:text-white">SmartStore<span className="text-[#2FA084]">AI</span></span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm">The next generation e-commerce experience powered by artificial intelligence.</p>
            </div>
            <div className="flex gap-4">
               {/* Social placeholders */}
               <div title="LinkedIn" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-[#2FA084] hover:bg-[#2FA084]/10 transition-colors cursor-pointer">IN</div>
               <div title="Twitter" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-[#2FA084] hover:bg-[#2FA084]/10 transition-colors cursor-pointer">TW</div>
               <div title="Facebook" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-[#2FA084] hover:bg-[#2FA084]/10 transition-colors cursor-pointer">FB</div>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400 gap-4">
            <p>© 2026 SmartStore AI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200">Privacy Policy</a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── Premium Product Card ───
const ProductCard = ({ product, wishlist, toggleWishlist, getRating, getReviews, getDiscount, badge, onOpen, onAdd }) => {
  const discount = getDiscount(product._id);
  const rating = getRating(product._id);
  const reviews = getReviews(product._id);

  return (
    <div 
      onClick={onOpen}
      className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-1 hover:border-[#6FCF97]/50 transition-all duration-300 group flex flex-col cursor-pointer backdrop-blur-sm"
    >
      {/* Image Container */}
      <div className="relative h-56 bg-slate-50 dark:bg-slate-900/50 overflow-hidden p-4">
        {product.imageUrl ? (
          <img src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Package className="h-12 w-12 text-slate-300 dark:text-slate-700" /></div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {badge && (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide shadow-sm ${badge === 'AI Pick' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'}`}>
              {badge === 'AI Pick' ? '✨ AI PICK' : '🔥 HOT'}
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow-sm">{discount}% OFF</span>
          )}
        </div>

        {/* Stock Badge */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-wider shadow-xl">Out of Stock</span>
          </div>
        )}

        {/* Quick Actions overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <button onClick={(e) => toggleWishlist(product._id, e)} className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${wishlist.has(product._id) ? 'bg-pink-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-pink-500'}`}>
            <Heart className={`h-4 w-4 ${wishlist.has(product._id) ? 'fill-current' : ''}`} />
          </button>
          <button className="w-9 h-9 rounded-full bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-[#2FA084] flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-5 flex flex-col flex-1 border-t border-slate-100 dark:border-slate-700/50">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1.5">{product.category}</p>
        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 line-clamp-1 mb-2 group-hover:text-[#2FA084] transition-colors">{product.name}</h3>

        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
            ))}
          </div>
          <span className="text-xs font-medium text-slate-400">({reviews})</span>
        </div>

        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex flex-col">
            {discount > 0 && <span className="text-xs text-slate-400 line-through mb-0.5">${product.basePrice.toFixed(2)}</span>}
            <span className="text-xl font-extrabold text-slate-800 dark:text-white">
              ${discount > 0 ? (product.basePrice * (1 - discount / 100)).toFixed(2) : product.basePrice.toFixed(2)}
            </span>
          </div>
          <button
            disabled={product.stock === 0}
            onClick={(e) => onAdd(product, e)}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-[#2FA084] dark:bg-slate-700 dark:hover:bg-[#2FA084] text-slate-600 hover:text-white dark:text-slate-300 transition-all flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group/btn"
          >
            <ShoppingCart className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Store;
