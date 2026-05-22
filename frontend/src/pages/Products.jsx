import React, { useEffect, useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchProducts, createProduct, updateProduct, deleteProduct, generateAIContent, improveAIDescription } from '../services/api';
import { Sparkles, Plus, Tag, Image as ImageIcon, Search, Filter, Trash2, Edit3, Wand2, X, ChevronDown } from 'lucide-react';

const CATEGORIES = ['All', 'General', 'Electronics', 'Fashion', 'Home & Living', 'Sports', 'Beauty', 'Books', 'Toys', 'Food', 'Other'];

const Products = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [improvingId, setImprovingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({ name: '', basePrice: '', stock: '', category: 'General' });

  const loadProducts = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      const data = await fetchProducts(user.token, params);
      setProducts(data.products);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user.token, search, categoryFilter]);

  const handleMagicGenerate = async (productId) => {
    setGeneratingId(productId);
    try {
      await generateAIContent(user.token, productId);
      await loadProducts();
    } catch (error) {
      alert(error.message);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleImprove = async (productId) => {
    setImprovingId(productId);
    try {
      await improveAIDescription(user.token, productId);
      await loadProducts();
    } catch (error) {
      alert(error.message);
    } finally {
      setImprovingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('basePrice', Number(form.basePrice));
      formData.append('stock', Number(form.stock));
      formData.append('category', form.category);
      if (imageFile) formData.append('image', imageFile);

      if (editProduct) {
        await updateProduct(user.token, editProduct._id, formData);
      } else {
        await createProduct(user.token, formData);
      }
      closeModal();
      await loadProducts();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(user.token, id);
      await loadProducts();
    } catch (error) {
      alert(error.message);
    }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({ name: product.name, basePrice: product.basePrice, stock: product.stock, category: product.category });
    setImageFile(null);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditProduct(null);
    setForm({ name: '', basePrice: '', stock: '', category: 'General' });
    setImageFile(null);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2FA084]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Products Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{total} products total</p>
        </div>
        <button onClick={() => { setEditProduct(null); setForm({ name: '', basePrice: '', stock: '', category: 'General' }); setShowAddModal(true); }} className="btn-primary">
          <Plus className="h-5 w-5 mr-2" /> Add Product
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field pl-10 pr-8 appearance-none cursor-pointer min-w-[160px]"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {products.map((product) => (
          <div key={product._id} className="glass-panel p-5 flex flex-col hover:border-[#2FA084]/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                  {product.imageUrl ? (
                    <img src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div>
                  {product.shortTitle && <p className="text-xs text-[#2FA084] dark:text-[#6FCF97] font-medium">{product.shortTitle}</p>}
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[#2FA084] dark:text-[#6FCF97] font-medium text-sm">${product.basePrice.toFixed(2)}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{product.category}</span>
                    <span className={`text-xs font-medium ${product.status === 'In Stock' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {product.stock} in stock
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(product)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10" title="Edit">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(product._id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* AI Content Section */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50 flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Generated Content</h4>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMagicGenerate(product._id)}
                    disabled={generatingId === product._id}
                    className="text-xs bg-[#6FCF97]/10 text-[#2FA084] hover:bg-[#6FCF97]/20 border border-[#6FCF97]/30 dark:text-[#6FCF97] rounded-md px-2.5 py-1 font-medium flex items-center transition-all disabled:opacity-50"
                  >
                    {generatingId === product._id ? <span className="animate-pulse flex items-center"><Sparkles className="h-3 w-3 mr-1" />...</span> : <><Sparkles className="h-3 w-3 mr-1" /> Generate</>}
                  </button>
                  {product.description && (
                    <button
                      onClick={() => handleImprove(product._id)}
                      disabled={improvingId === product._id}
                      className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-md px-2.5 py-1 font-medium flex items-center transition-all disabled:opacity-50"
                    >
                      {improvingId === product._id ? <span className="animate-pulse flex items-center"><Wand2 className="h-3 w-3 mr-1" />...</span> : <><Wand2 className="h-3 w-3 mr-1" /> Improve</>}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                {product.description || <span className="text-slate-400 italic">No description yet. Click Generate.</span>}
              </p>

              {product.marketingCaption && (
                <p className="text-xs italic text-purple-600 dark:text-purple-400 mb-2">"{product.marketingCaption}"</p>
              )}

              <div className="flex flex-wrap gap-1.5 mt-2">
                {product.seoTags?.length > 0 && product.seoTags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    <Tag className="h-2.5 w-2.5 mr-1 text-[#2FA084]" /> {tag}
                  </span>
                ))}
                {product.keywords?.length > 0 && product.keywords.map((kw, i) => (
                  <span key={`kw-${i}`} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No products found. Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 animate-fade-in relative shadow-2xl">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full p-1 transition-colors">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Product Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Price ($)</label>
                  <input type="number" step="0.01" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input-field" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Product Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#6FCF97]/10 file:text-[#2FA084] hover:file:bg-[#6FCF97]/20" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editProduct ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Products;
