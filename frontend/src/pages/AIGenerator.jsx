import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchProducts, generateAIContent } from '../services/api';
import { Sparkles, Package, Tag, Edit3, Loader2, Search, CheckCircle2 } from 'lucide-react';

const AIGenerator = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(user.token, { limit: 100 });
        setProducts(data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [user.token]);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleGenerate = async () => {
    if (!selectedProduct) return;
    setIsGenerating(true);
    setSuccessMsg('');
    try {
      const updated = await generateAIContent(user.token, selectedProduct._id);
      setSelectedProduct(updated);
      setProducts(products.map(p => p._id === updated._id ? updated : p));
      setSuccessMsg('AI Generation completed successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2FA084]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-[#2FA084]" /> AI Content Generator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Supercharge your product listings with Google Gemini AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: Product Selection */}
        <div className="glass-panel p-5 flex flex-col h-[calc(100vh-140px)]">
          <h2 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center justify-between">
            Select Product
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-500">{filteredProducts.length}</span>
          </h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:border-[#2FA084] transition-colors text-slate-700 dark:text-slate-200"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
            {filteredProducts.map(p => (
              <button
                key={p._id}
                onClick={() => { setSelectedProduct(p); setSuccessMsg(''); }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  selectedProduct?._id === p._id 
                    ? 'bg-[#2FA084]/10 border-[#2FA084]/50 shadow-sm' 
                    : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 hover:border-[#6FCF97]/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${p.imageUrl ? 'bg-transparent' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  {p.imageUrl ? <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:5000${p.imageUrl}`} className="w-full h-full object-cover rounded-lg" /> : <Package className="h-5 w-5 text-slate-400" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className={`text-sm font-semibold truncate ${selectedProduct?._id === p._id ? 'text-[#2FA084] dark:text-[#6FCF97]' : 'text-slate-800 dark:text-slate-200'}`}>
                    {p.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500">{p.category}</span>
                    {p.description && <span className="text-[10px] bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 px-1.5 rounded">AI Optimized</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: AI Generation Panel */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col relative overflow-hidden h-[calc(100vh-140px)] overflow-y-auto">
          {!selectedProduct ? (
            <div className="m-auto text-center max-w-md">
              <div className="w-20 h-20 bg-[#6FCF97]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#6FCF97]/20">
                <Sparkles className="h-10 w-10 text-[#2FA084]" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Select a product to optimize</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Our AI will generate high-converting descriptions, SEO keywords, and social media captions automatically.</p>
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col h-full">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {selectedProduct.imageUrl ? <img src={selectedProduct.imageUrl.startsWith('http') ? selectedProduct.imageUrl : `http://localhost:5000${selectedProduct.imageUrl}`} className="w-full h-full object-cover rounded-xl" /> : <Package className="h-8 w-8 text-slate-400" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedProduct.name}</h2>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <span>{selectedProduct.category}</span>
                      <span>•</span>
                      <span className="font-semibold text-[#2FA084]">${selectedProduct.basePrice.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-[#2FA084] to-[#1F6F5F] hover:from-[#1F6F5F] hover:to-[#2FA084] text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-[#2FA084]/20 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isGenerating ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating...</> : <><Sparkles className="h-5 w-5" /> Generate with AI</>}
                </button>
              </div>

              {successMsg && (
                <div className="mb-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-fade-in">
                  <CheckCircle2 className="h-5 w-5" /> {successMsg}
                </div>
              )}

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-4">
                {/* Description */}
                <div className="bg-white dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Edit3 className="h-3.5 w-3.5" /> Product Description</h4>
                  {selectedProduct.description ? (
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedProduct.description}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No description generated yet.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SEO Tags */}
                  <div className="bg-white dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> SEO Tags</h4>
                    {selectedProduct.seoTags?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.seoTags.map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-md text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : <p className="text-sm text-slate-400 italic">No tags generated.</p>}
                  </div>

                  {/* Keywords */}
                  <div className="bg-white dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Search className="h-3.5 w-3.5" /> Search Keywords</h4>
                    {selectedProduct.keywords?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.keywords.map((kw, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[#6FCF97]/10 text-[#2FA084] border border-[#6FCF97]/30 rounded-md text-xs font-medium">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    ) : <p className="text-sm text-slate-400 italic">No keywords generated.</p>}
                  </div>
                </div>

                {/* Marketing Caption & Title */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-500/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wider mb-2">Short Title</h4>
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{selectedProduct.shortTitle || <span className="text-sm text-slate-400 italic font-normal">Pending...</span>}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-pink-500 dark:text-pink-400 uppercase tracking-wider mb-2">Marketing Caption</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{selectedProduct.marketingCaption || <span className="text-slate-400 font-normal">Pending...</span>}"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;
