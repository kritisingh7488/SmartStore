import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, PointElement, Tooltip);

const apiBase = import.meta.env.VITE_API_URL || '/api';

const emptyForm = {
  name: '',
  category: 'Cookies',
  price: 0,
  cost: 0,
  stock: 0,
  sales: 0,
  imageUrl: '',
  description: '',
  tags: '',
  marketingCaption: ''
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

function App() {
  // Authentication & Session State
  const [token, setToken] = useState(() => localStorage.getItem('cocoa-token') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cocoa-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authMode, setAuthMode] = useState('customer-login'); // customer-login, customer-register, admin-login
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Admin Dashboard & Inventory State
  const [products, setProducts] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [adminTab, setAdminTab] = useState('analytics'); // analytics, inventory, tools
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [aiBusyId, setAiBusyId] = useState(null);
  const [panelMode, setPanelMode] = useState('create');

  // Customer Storefront State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Sync token to API queries and fetch initial profile/data
  useEffect(() => {
    if (token) {
      fetchProfile(token);
      refreshData(token);
    } else {
      setUser(null);
      setProducts([]);
      setDashboard(null);
    }
  }, [token]);

  // Fetch logged-in user profile
  async function fetchProfile(currentToken) {
    try {
      const response = await fetch(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (!response.ok) {
        throw new Error('Session expired');
      }
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('cocoa-user', JSON.stringify(data.user));
    } catch (error) {
      logout();
    }
  }

  // Refresh products list and dashboard summary (for admin)
  async function refreshData(currentToken = token) {
    if (!currentToken) return;
    try {
      // Get products (accessible by anyone logged in)
      const pResponse = await fetch(`${apiBase}/products`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (pResponse.ok) {
        const pData = await pResponse.json();
        setProducts(pData.products || []);
      }

      // If user is Admin, fetch the dashboard summary as well
      const savedUser = localStorage.getItem('cocoa-user');
      const currentUser = savedUser ? JSON.parse(savedUser) : null;
      if (currentUser?.role === 'admin') {
        const dResponse = await fetch(`${apiBase}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        if (dResponse.ok) {
          const dData = await dResponse.json();
          setDashboard(dData);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }

  // API query helper
  async function api(path, options = {}, expectedJson = true) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers
    });
    const data = expectedJson ? await response.json() : null;
    if (!response.ok) {
      throw new Error(data?.message || 'Request failed');
    }
    return data;
  }

  // Handle Authentication
  async function handleAuthSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      let endpoint = '/auth/login';
      let payload = { email: authForm.email, password: authForm.password };

      if (authMode === 'customer-register') {
        endpoint = '/auth/register';
        payload = authForm;
      } else if (authMode === 'admin-login') {
        // Preset admin login values if fields were left blank or pre-filled
        payload = {
          email: authForm.email || 'admin@cocoacrumb.com',
          password: authForm.password || 'AdminPassword123'
        };
      }

      const data = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      localStorage.setItem('cocoa-token', data.token);
      localStorage.setItem('cocoa-user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setAuthForm({ name: '', email: '', password: '' });
      setMessage(`Successfully signed in as ${data.user.name}.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Trigger Admin Quick Login
  function handleAdminQuickLogin() {
    setAuthMode('admin-login');
    setAuthForm({
      name: '',
      email: 'admin@cocoacrumb.com',
      password: 'AdminPassword123'
    });
  }

  // Logout
  function logout() {
    localStorage.removeItem('cocoa-token');
    localStorage.removeItem('cocoa-user');
    setToken('');
    setUser(null);
    setProducts([]);
    setDashboard(null);
    setCart([]);
    setIsCartOpen(false);
    setCheckoutSuccess(false);
    setMessage('Logged out successfully.');
  }

  // Seeding/Mock data tools
  async function handleSeedData() {
    setLoading(true);
    setMessage('');
    try {
      const data = await api('/products/seed', { method: 'POST' });
      setMessage(data.message || 'Seeded 6 luxury products.');
      await refreshData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleClearData() {
    setLoading(true);
    setMessage('');
    try {
      const data = await api('/products/clear', { method: 'POST' });
      setMessage(data.message || 'All products cleared.');
      await refreshData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Admin CRUD operations
  async function saveProduct(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        cost: Number(form.cost),
        stock: Number(form.stock),
        sales: Number(form.sales),
        tags: form.tags
          ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : []
      };

      if (editingId) {
        await api(`/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setMessage('Product updated successfully.');
      } else {
        await api('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setMessage('Product added successfully.');
      }

      setEditingId(null);
      setForm(emptyForm);
      await refreshData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function beginEdit(product) {
    setEditingId(product._id);
    setPanelMode('create');
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      sales: product.sales,
      imageUrl: product.imageUrl || '',
      description: product.description || '',
      tags: (product.tags || []).join(', '),
      marketingCaption: product.marketingCaption || ''
    });
  }

  async function removeProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      setMessage('Product removed.');
      await refreshData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // AI Content Generator
  async function generateAI(product) {
    setAiBusyId(product._id);
    setMessage('');
    try {
      const data = await api(`/products/${product._id}/generate`, { method: 'POST' });
      setProducts((current) => current.map((item) => (item._id === product._id ? data.product : item)));
      setMessage(`AI recommendations generated for ${product.name}.`);
      await refreshData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setAiBusyId(null);
    }
  }

  // Shopping Cart & Checkout operations
  function addToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('Cannot add more items. Maximum stock reached.');
          return currentCart;
        }
        return currentCart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { product, quantity: 1 }];
    });
  }

  function updateCartQuantity(productId, delta) {
    setCart((currentCart) => {
      return currentCart
        .map((item) => {
          if (item.product._id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stock) {
              alert('Insufficient stock available.');
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  }

  function removeFromCart(productId) {
    setCart((currentCart) => currentCart.filter((item) => item.product._id !== productId));
  }

  async function handleCheckout() {
    setLoading(true);
    setMessage('');
    try {
      // Simulate purchases sequentially by calling checkout API
      for (const item of cart) {
        await api(`/products/${item.product._id}/purchase`, {
          method: 'POST',
          body: JSON.stringify({ quantity: item.quantity })
        });
      }
      setCart([]);
      setIsCartOpen(false);
      setCheckoutSuccess(true);
      await refreshData();
    } catch (error) {
      alert(error.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  // Filtered products list for Customer Storefront
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Admin Dashboard stats summary
  const stats = useMemo(() => {
    if (!dashboard) return [];
    return [
      { label: 'Total Revenue', value: formatCurrency(dashboard.overview?.totalRevenue || 0) },
      { label: 'Avg Order Value', value: formatCurrency(dashboard.overview?.averageOrderValue || 0) },
      { label: 'Net Profit', value: formatCurrency(dashboard.overview?.profit || 0) },
      { label: 'Low Stock Items', value: dashboard.overview?.lowStockCount || 0 }
    ];
  }, [dashboard]);

  // Chart configs
  const revenueChart = useMemo(() => {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue',
          data: dashboard?.monthlyRevenue || [0, 0, 0, 0, 0, 0],
          backgroundColor: ['#604024', '#8d592d', '#bb7939', '#d89b54', '#e8b977', '#f8ead1'],
          borderRadius: 12,
          borderSkipped: false
        }
      ]
    };
  }, [dashboard]);

  const categoryMixChart = useMemo(() => {
    // Count items by category
    const categories = {};
    products.forEach((p) => {
      categories[p.category] = (categories[p.category] || 0) + p.sales;
    });

    return {
      labels: Object.keys(categories).length ? Object.keys(categories) : ['No Products'],
      datasets: [
        {
          label: 'Units Sold',
          data: Object.keys(categories).length ? Object.values(categories) : [0],
          backgroundColor: ['#604024', '#8d592d', '#d89b54', '#e8b977', '#f8ead1', '#bb7939']
        }
      ]
    };
  }, [products]);

  // Cart helper subtotal
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  return (
    <div className="min-h-screen text-[#3c281b] pb-12 font-body bg-[linear-gradient(180deg,#fffdf8_0%,#fbf2e4_45%,#f6ead9_100%)]">
      {/* Dynamic Header */}
      <header className="border-b border-[#8c633d]/12 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#604024] flex items-center justify-center font-display text-white font-bold text-xl shadow-md">
              C
            </div>
            <div>
              <span className="font-display font-bold text-2xl tracking-tight text-[#3c281b]">Cocoa & Crumb</span>
              <span className="ml-2 rounded-full bg-[#f8ead1] text-[#8d592d] text-xs font-semibold px-2 py-0.5 border border-[#8d592d]/20">
                Gourmet Store
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex flex-col text-right text-xs">
                  <span className="font-bold text-[#3c281b]">{user.name}</span>
                  <span className="text-[#8c633d] uppercase tracking-wider font-semibold">
                    {user.role === 'admin' ? '🛡️ Admin' : '🛍️ Shopper'}
                  </span>
                </div>
                <div className="h-9 w-px bg-[#8c633d]/20 hidden sm:block"></div>
                {user.role === 'customer' && (
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative rounded-2xl bg-white border border-[#f8ead1] p-2.5 text-[#3c281b] hover:bg-[#fff8ec] transition flex items-center gap-1.5 font-semibold text-sm shadow-sm"
                  >
                    🛒 Cart
                    {cart.length > 0 && (
                      <span className="bg-[#8d592d] text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                        {cart.reduce((s, i) => s + i.quantity, 0)}
                      </span>
                    )}
                  </button>
                )}
                <button
                  onClick={logout}
                  className="rounded-2xl bg-[#604024] hover:bg-[#8d592d] text-white px-4 py-2 text-sm font-bold transition shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdminQuickLogin}
                  className="rounded-2xl border border-[#604024] text-[#604024] hover:bg-[#fff8ec] px-4 py-2 text-sm font-bold transition"
                >
                  Demo Admin Login
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 mt-6">
        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-2xl border border-[#e8b977]/30 bg-[#fff8ec] px-5 py-4 text-sm text-[#8d592d] flex items-center justify-between shadow-sm animate-reveal">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="font-bold text-xs hover:text-[#3c281b]">✕</button>
          </div>
        )}

        {/* 1. UNAUTHENTICATED AUTH SCREEN */}
        {!user && (
          <div className="mx-auto max-w-4xl grid md:grid-cols-[1.1fr_0.9fr] rounded-[2.5rem] overflow-hidden border border-[#8c633d]/12 shadow-soft bg-white/70 backdrop-blur-xl">
            {/* Visual Cover */}
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#604024,#3c281b)] p-8 md:p-12 text-white flex flex-col justify-between min-h-[400px]">
              <div className="absolute inset-0 opacity-10 grid-mesh" />
              <div className="absolute top-10 right-10 h-60 w-60 rounded-full bg-[#e8b977]/10 blur-3xl animate-float" />
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase border border-white/10">
                  🍫 Cocoa & Crumb
                </span>
                <h1 className="mt-8 font-display text-4xl md:text-5xl font-extrabold leading-tight">
                  Crafted with love, powered by AI.
                </h1>
                <p className="mt-4 text-[#e8b977] text-sm leading-relaxed max-w-md">
                  Experience our premium range of brown-butter cookies and rich truffles. Log in as a customer to shop, or use the admin mode to orchestrate analytics and trigger automated copywriters.
                </p>
              </div>
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs text-[#e8b977]/80">Features include:</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-semibold">
                  <div>🥐 Gourmet Shop</div>
                  <div>📊 Real-time Analytics</div>
                  <div>🤖 Gemini AI Assist</div>
                  <div>🧪 Database Seeding</div>
                </div>
              </div>
            </div>

            {/* Auth Form card */}
            <div className="p-6 md:p-10 flex flex-col justify-center bg-white">
              {/* Tabs */}
              <div className="flex bg-[#f8ead1]/50 p-1 rounded-2xl mb-6 text-xs font-bold border border-[#f8ead1]">
                <button
                  onClick={() => setAuthMode('customer-login')}
                  className={`flex-1 rounded-xl py-2.5 transition ${authMode === 'customer-login' ? 'bg-white shadow-sm text-[#3c281b]' : 'text-[#8d592d]'}`}
                >
                  Customer Login
                </button>
                <button
                  onClick={() => setAuthMode('customer-register')}
                  className={`flex-1 rounded-xl py-2.5 transition ${authMode === 'customer-register' ? 'bg-white shadow-sm text-[#3c281b]' : 'text-[#8d592d]'}`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setAuthMode('admin-login')}
                  className={`flex-1 rounded-xl py-2.5 transition ${authMode === 'admin-login' ? 'bg-white shadow-sm text-[#3c281b]' : 'text-[#8d592d]'}`}
                >
                  Admin Access
                </button>
              </div>

              {/* Form header */}
              <h2 className="font-display text-2xl font-bold text-[#3c281b] mb-2">
                {authMode === 'customer-login' && 'Welcome Shopper'}
                {authMode === 'customer-register' && 'Join Cocoa & Crumb'}
                {authMode === 'admin-login' && 'Admin Command Center'}
              </h2>
              <p className="text-xs text-[#8c633d] mb-6">
                {authMode === 'customer-login' && 'Login to browse, filter, and buy your favorite sweets.'}
                {authMode === 'customer-register' && 'Register a customer account and enjoy cookies and truffles.'}
                {authMode === 'admin-login' && 'Access the dashboard to view sales analytics and generate AI suggestions.'}
              </p>

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'customer-register' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#604024]">Full Name</label>
                    <input
                      className="w-full rounded-xl border border-[#f8ead1] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#d89b54]"
                      placeholder="Jane Doe"
                      required
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#604024]">Email Address</label>
                  <input
                    className="w-full rounded-xl border border-[#f8ead1] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#d89b54]"
                    placeholder="email@example.com"
                    type="email"
                    required
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#604024]">Password</label>
                  <input
                    className="w-full rounded-xl border border-[#f8ead1] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#d89b54]"
                    placeholder="••••••••"
                    type="password"
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  />
                </div>

                {authMode === 'admin-login' && (
                  <div className="rounded-xl bg-[#fff8ec] border border-[#f8ead1] p-3 text-[11px] text-[#8d592d] leading-relaxed">
                    💡 **Admin Credentials (Prefilled above):**
                    <br />
                    - Email: `admin@cocoacrumb.com`
                    <br />- Password: `AdminPassword123`
                  </div>
                )}

                <button
                  disabled={loading}
                  className="w-full rounded-xl bg-[#604024] hover:bg-[#8d592d] text-white py-3.5 text-sm font-bold transition shadow-md disabled:opacity-60"
                >
                  {loading ? 'Authenticating...' : authMode === 'customer-register' ? 'Register Account' : 'Sign In'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2. CUSTOMER WORKSPACE */}
        {user && user.role === 'customer' && (
          <div className="space-y-6">
            {/* Storefront Hero */}
            <section className="relative rounded-[2.5rem] overflow-hidden bg-[linear-gradient(135deg,#e8b977/20,#604024/10)] border border-[#e8b977]/30 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-sm">
              <div className="absolute inset-0 grid-mesh opacity-10" />
              <div className="flex-1 space-y-4">
                <span className="bg-[#8d592d]/10 text-[#8d592d] text-[11px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-[#8d592d]/10">
                  Welcome to Cocoa & Crumb
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-black text-[#3c281b]">
                  Artisan Pastries & Chocolates
                </h1>
                <p className="text-[#604024] text-sm leading-relaxed max-w-xl">
                  Indulge in our organic brown-butter cookies, Swiss-style hazelnut pralines, and delicate Parisian macarons. Prepared fresh daily using single-origin ingredients.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-[#8d592d]">
                  <span>✨ Handcrafted Quality</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8d592d]/40"></span>
                  <span>🚚 Nationwide Shipping</span>
                </div>
              </div>
              <div className="w-48 h-48 rounded-full bg-[#604024]/10 flex items-center justify-center relative shadow-inner">
                <span className="text-6xl animate-float">🍪</span>
                <span className="text-4xl absolute bottom-4 right-4 animate-float delay-75">🍫</span>
              </div>
            </section>

            {/* Shopping Catalog Interface */}
            <section className="bg-white/70 backdrop-blur-xl border border-[#8c633d]/12 rounded-[2rem] p-6 shadow-soft space-y-6">
              {/* Search & Categories */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {['All', 'Cookies', 'Chocolates', 'Specialty'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-2xl px-5 py-2.5 text-xs font-bold transition border ${
                        selectedCategory === cat
                          ? 'bg-[#604024] border-[#604024] text-white shadow-md'
                          : 'bg-white border-[#f8ead1] text-[#8d592d] hover:bg-[#fff8ec]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:max-w-md">
                  <input
                    type="text"
                    placeholder="Search chocolate, caramel, cookies..."
                    className="w-full rounded-2xl border border-[#f8ead1] bg-white px-5 py-2.5 text-xs outline-none transition focus:border-[#d89b54] text-[#3c281b]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="absolute right-4 top-3 text-xs opacity-60">🔍</span>
                </div>
              </div>

              {/* Checkout success modal message */}
              {checkoutSuccess && (
                <div className="rounded-2xl bg-green-50 border border-green-200 p-5 text-center space-y-3 animate-reveal">
                  <div className="text-3xl">🎉</div>
                  <h3 className="font-display font-bold text-lg text-green-800">Order Placed Successfully!</h3>
                  <p className="text-xs text-green-700 max-w-md mx-auto">
                    Your gourmet treats are being freshly baked. Admin sales analytics dashboard has been updated in real-time with your purchase!
                  </p>
                  <button
                    onClick={() => setCheckoutSuccess(false)}
                    className="rounded-xl bg-green-800 text-white font-bold text-xs px-4 py-2 hover:bg-green-700 transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}

              {/* Products Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => {
                  const outOfStock = product.stock <= 0;
                  return (
                    <article
                      key={product._id}
                      className="rounded-3xl border border-[#8c633d]/8 bg-white overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition hover:-translate-y-0.5"
                    >
                      {/* Product Image */}
                      <div className="h-48 w-full bg-[#f8ead1]/30 relative overflow-hidden flex items-center justify-center border-b border-[#8c633d]/8">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="object-cover w-full h-full hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <span className="text-5xl opacity-40">🍪</span>
                        )}
                        <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm border border-[#8c633d]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8d592d]">
                          {product.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display font-bold text-xl text-[#3c281b]">{product.name}</h3>
                            <span className="font-display font-black text-[#8d592d] text-lg shrink-0">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                          <p className="text-[#604024] text-xs leading-relaxed line-clamp-3">
                            {product.description || 'Artisan pastry prepared fresh daily by our bakery team. Experience natural chocolate and rich buttery crumbs.'}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {(product.tags || []).slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] font-semibold bg-[#fff8ec] border border-[#f8ead1] text-[#8d592d] px-2 py-0.5 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#8c633d]/8 flex items-center justify-between gap-4">
                          <span className={`text-[10px] font-bold uppercase ${outOfStock ? 'text-red-500' : 'text-[#8d592d]'}`}>
                            {outOfStock ? '🔴 Out of Stock' : `🟢 ${product.stock} items left`}
                          </span>

                          <button
                            disabled={outOfStock}
                            onClick={() => addToCart(product)}
                            className="rounded-xl bg-[#604024] hover:bg-[#8d592d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs px-4 py-2.5 transition shadow-sm flex items-center gap-1.5 shrink-0"
                          >
                            Add to Cart 🛒
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {!filteredProducts.length && (
                  <div className="col-span-full rounded-2xl border border-dashed border-[#8c633d]/20 bg-[#fffdf8]/60 p-12 text-center text-[#8c633d]">
                    <span className="text-4xl block mb-2">🧁</span>
                    <p className="font-semibold text-sm">No bakery treats found.</p>
                    <p className="text-xs mt-1">Please ask the administrator to seed or add products to the catalog.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* 3. ADMIN WORKSPACE */}
        {user && user.role === 'admin' && (
          <div className="space-y-6 animate-reveal">
            {/* Admin Command Center Header */}
            <section className="glass-panel rounded-[2.5rem] p-6 shadow-soft flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <span className="bg-[#8d592d]/10 text-[#8d592d] text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-[#8d592d]/10">
                  🛡️ Admin Command Center
                </span>
                <h1 className="font-display font-black text-3xl md:text-4xl mt-2 text-[#3c281b]">
                  Cocoa & Crumb Management
                </h1>
                <p className="text-xs text-[#8c633d] mt-1">
                  Manage artisan cookie catalogs, analyze shopper purchases, and trigger Gemini AI suggestions.
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex bg-[#f8ead1]/50 p-1 rounded-2xl text-xs font-bold border border-[#f8ead1] self-stretch md:self-auto">
                <button
                  onClick={() => setAdminTab('analytics')}
                  className={`flex-1 md:flex-initial rounded-xl px-5 py-2.5 transition ${adminTab === 'analytics' ? 'bg-white shadow-sm text-[#3c281b]' : 'text-[#8d592d]'}`}
                >
                  Sales Dashboard
                </button>
                <button
                  onClick={() => setAdminTab('inventory')}
                  className={`flex-1 md:flex-initial rounded-xl px-5 py-2.5 transition ${adminTab === 'inventory' ? 'bg-white shadow-sm text-[#3c281b]' : 'text-[#8d592d]'}`}
                >
                  Inventory Manager
                </button>
                <button
                  onClick={() => setAdminTab('tools')}
                  className={`flex-1 md:flex-initial rounded-xl px-5 py-2.5 transition ${adminTab === 'tools' ? 'bg-white shadow-sm text-[#3c281b]' : 'text-[#8d592d]'}`}
                >
                  Demo Tools
                </button>
              </div>
            </section>

            {/* TAB CONTENT: ANALYTICS */}
            {adminTab === 'analytics' && (
              <div className="space-y-6">
                {/* Stats Dashboard */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="glass-panel rounded-3xl p-5 shadow-soft border border-[#8c633d]/8">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#8c633d]">{stat.label}</p>
                      <div className="mt-2 font-display text-3xl font-black text-[#3c281b]">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Graphs Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="glass-panel rounded-[2rem] p-5 shadow-soft bg-white/70 border border-[#8c633d]/12">
                    <h3 className="font-display text-xl font-bold text-[#3c281b] mb-4">Monthly Revenue curve</h3>
                    <div className="bg-white/80 rounded-2xl p-4 shadow-sm border border-[#8c633d]/6">
                      <Bar
                        data={revenueChart}
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { ticks: { color: '#8d592d' }, grid: { color: 'rgba(141,89,45,0.08)' } },
                            x: { ticks: { color: '#8d592d' }, grid: { display: false } }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="glass-panel rounded-[2rem] p-5 shadow-soft bg-white/70 border border-[#8c633d]/12">
                    <h3 className="font-display text-xl font-bold text-[#3c281b] mb-4">Sales Mix by Category</h3>
                    <div className="bg-white/80 rounded-2xl p-4 shadow-sm border border-[#8c633d]/6 flex justify-center">
                      <div className="max-w-[280px] w-full">
                        <Doughnut
                          data={categoryMixChart}
                          options={{
                            cutout: '70%',
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: { color: '#8d592d', usePointStyle: true, boxWidth: 8 }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Suggestions and Low Stock warnings */}
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  {/* AI Sales Suggestions */}
                  <div className="glass-panel rounded-[2rem] p-5 shadow-soft border border-[#8c633d]/12">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-display text-xl font-bold text-[#3c281b]">AI suggestion engine</h3>
                        <p className="text-xs text-[#8c633d]">Real-time recommendations matching sales velocity and margins.</p>
                      </div>
                      <span className="rounded-full bg-[#f8ead1] px-3 py-1 text-[10px] font-bold text-[#8d592d] border border-[#8d592d]/25">
                        ACTIVE
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(dashboard?.salesSuggestions || []).map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-[#f8ead1] bg-[#fff8ec] p-4 text-xs text-[#8d592d] font-semibold leading-relaxed shadow-sm"
                        >
                          {suggestion}
                        </div>
                      ))}
                      {!dashboard?.salesSuggestions?.length && (
                        <p className="text-xs text-[#8c633d]">Add products and trigger sales orders to build AI insights.</p>
                      )}
                    </div>
                  </div>

                  {/* Low Stock Alerts */}
                  <div className="glass-panel rounded-[2rem] p-5 shadow-soft border border-[#8c633d]/12">
                    <h3 className="font-display text-xl font-bold text-[#3c281b] mb-4">Inventory alarms</h3>
                    <div className="space-y-2">
                      {(dashboard?.lowStockProducts || []).map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-semibold text-red-800"
                        >
                          <span>{prod.name}</span>
                          <span className="rounded-full bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold">
                            {prod.stock} left
                          </span>
                        </div>
                      ))}
                      {!dashboard?.lowStockProducts?.length && (
                        <div className="rounded-xl border border-dashed border-green-200 bg-green-50/50 p-4 text-center text-green-700 text-xs font-semibold">
                          🟢 All items are sufficiently stocked.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: INVENTORY */}
            {adminTab === 'inventory' && (
              <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
                {/* Left Form: Add/Edit Product */}
                <div className="glass-panel rounded-[2rem] p-5 shadow-soft border border-[#8c633d]/12 lg:sticky lg:top-24 self-start">
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#3c281b]">
                        {editingId ? '✍️ Edit Gourmet Product' : '➕ Add Gourmet Product'}
                      </h3>
                      <p className="text-xs text-[#8c633d]">Provide details, save, then run the copy generator.</p>
                    </div>
                    <button
                      onClick={() => setPanelMode(panelMode === 'create' ? 'ai' : 'create')}
                      className="rounded-xl border border-[#f8ead1] bg-white px-3 py-1.5 text-xs font-bold text-[#8d592d] hover:bg-[#fff8ec]"
                    >
                      {panelMode === 'create' ? 'AI generator mode' : 'Form editor mode'}
                    </button>
                  </div>

                  {panelMode === 'create' ? (
                    <form onSubmit={saveProduct} className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-[#604024]">Product Name</label>
                        <input
                          className="w-full rounded-xl border border-[#f8ead1] bg-white px-4 py-2.5 text-xs outline-none transition focus:border-[#d89b54]"
                          placeholder="e.g. Pecan Caramel cookie"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#604024]">Category</label>
                        <select
                          className="w-full rounded-xl border border-[#f8ead1] bg-white px-4 py-2.5 text-xs outline-none transition focus:border-[#d89b54]"
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                          <option value="Cookies">Cookies</option>
                          <option value="Chocolates">Chocolates</option>
                          <option value="Specialty">Specialty</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#604024]">Image URL</label>
                        <input
                          className="w-full rounded-xl border border-[#f8ead1] bg-white px-4 py-2.5 text-xs outline-none transition focus:border-[#d89b54]"
                          placeholder="https://images.unsplash.com/..."
                          value={form.imageUrl}
                          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#604024]">Selling Price ($)</label>
                        <input
                          className="w-full rounded-xl border border-[#f8ead1] bg-white px-4 py-2.5 text-xs outline-none transition focus:border-[#d89b54]"
                          type="number"
                          step="0.01"
                          required
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#604024]">Cost Price ($)</label>
                        <input
                          className="w-full rounded-xl border border-[#f8ead1] bg-white px-4 py-2.5 text-xs outline-none transition focus:border-[#d89b54]"
                          type="number"
                          step="0.01"
                          required
                          value={form.cost}
                          onChange={(e) => setForm({ ...form, cost: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#604024]">Inventory Stock</label>
                        <input
                          className="w-full rounded-xl border border-[#f8ead1] bg-white px-4 py-2.5 text-xs outline-none transition focus:border-[#d89b54]"
                          type="number"
                          required
                          value={form.stock}
                          onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#604024]">Units Sold</label>
                        <input
                          className="w-full rounded-xl border border-[#f8ead1] bg-white px-4 py-2.5 text-xs outline-none transition focus:border-[#d89b54]"
                          type="number"
                          required
                          value={form.sales}
                          onChange={(e) => setForm({ ...form, sales: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-[#604024]">Tags (separated by comma)</label>
                        <input
                          className="w-full rounded-xl border border-[#f8ead1] bg-white px-4 py-2.5 text-xs outline-none transition focus:border-[#d89b54]"
                          placeholder="butter, chewy, pecan"
                          value={form.tags}
                          onChange={(e) => setForm({ ...form, tags: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-[#604024]">Product description</label>
                        <textarea
                          className="w-full min-h-[80px] rounded-xl border border-[#f8ead1] bg-white px-4 py-2.5 text-xs outline-none transition focus:border-[#d89b54]"
                          placeholder="Detail flavor profile, ingredients..."
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                      </div>

                      <div className="flex gap-2 sm:col-span-2">
                        <button
                          disabled={loading}
                          className="rounded-xl bg-[#604024] hover:bg-[#8d592d] text-white px-5 py-3 text-xs font-bold transition shadow-sm"
                        >
                          {editingId ? 'Update product' : 'Add product'}
                        </button>
                        {editingId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setForm(emptyForm);
                            }}
                            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs font-bold hover:bg-gray-50"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-[#8c633d]">
                        Click on any product from the catalog on the right to immediately run Gemini AI Copywriter.
                      </p>
                      <div className="grid gap-3">
                        {products.map((prod) => (
                          <button
                            key={prod._id}
                            onClick={() => generateAI(prod)}
                            className="rounded-2xl border border-[#f8ead1] bg-white p-4 text-left transition hover:border-[#d89b54] hover:bg-[#fff8ec] flex justify-between items-center gap-4 shadow-sm"
                          >
                            <div>
                              <div className="font-bold text-[#3c281b]">{prod.name}</div>
                              <div className="text-[10px] text-[#8c633d] uppercase tracking-wider">{prod.category}</div>
                            </div>
                            <span className="rounded-xl bg-[#604024]/10 text-[#604024] font-bold text-[10px] px-3 py-1.5">
                              Generate AI Copy 🤖
                            </span>
                          </button>
                        ))}
                        {!products.length && (
                          <p className="text-xs text-[#8c633d]">Seed or create products before using AI.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Panel: Product Catalog */}
                <div className="glass-panel rounded-[2rem] p-5 shadow-soft border border-[#8c633d]/12 flex flex-col max-h-[850px]">
                  <div className="flex justify-between items-center mb-5 shrink-0">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#3c281b]">Product Catalog</h3>
                      <p className="text-xs text-[#8c633d]">Total registered items: {products.length}</p>
                    </div>
                  </div>

                  <div className="space-y-4 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                    {products.map((prod) => (
                      <article
                        key={prod._id}
                        className="rounded-3xl border border-[#8c633d]/8 bg-white/95 p-5 shadow-sm space-y-4 flex flex-col md:flex-row gap-5 items-start justify-between"
                      >
                        {/* Visual summary info */}
                        <div className="flex-1 flex flex-col sm:flex-row gap-4 items-start">
                          {/* Image preview (small) */}
                          {prod.imageUrl && (
                            <div className="h-24 w-36 rounded-xl overflow-hidden border border-[#8c633d]/10 bg-gray-50 shrink-0">
                              <img src={prod.imageUrl} alt={prod.name} className="object-cover w-full h-full" />
                            </div>
                          )}
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-display text-xl font-black text-[#3c281b]">{prod.name}</h4>
                              <span className="rounded-full bg-[#f8ead1] text-[#8d592d] text-[10px] font-bold px-2 py-0.5 border border-[#8d592d]/10">
                                Trending Score {prod.trendingScore || 50}%
                              </span>
                            </div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-[#8c633d]">
                              {prod.category}
                            </p>

                            <p className="text-xs text-[#604024] leading-relaxed max-w-lg">
                              {prod.description || 'No description added yet. Click AI generate to write.'}
                            </p>

                            {/* AI values if generated */}
                            {prod.marketingCaption && (
                              <div className="rounded-xl bg-[#fff8ec] border border-[#f8ead1] p-3 text-[11px] text-[#8d592d]">
                                <span className="font-bold">Marketing Caption:</span> {prod.marketingCaption}
                              </div>
                            )}
                            {prod.pricingRecommendation && (
                              <div className="rounded-xl bg-[#fff8ec] border border-[#f8ead1] p-3 text-[11px] text-[#8d592d] mt-2">
                                <span className="font-bold">💡 AI Pricing Ideas:</span> {prod.pricingRecommendation}
                              </div>
                            )}
                            {prod.salesInsight && (
                              <div className="rounded-xl bg-[#fff8ec] border border-[#f8ead1] p-3 text-[11px] text-[#8d592d] mt-2">
                                <span className="font-bold">📈 AI Sales Insights:</span> {prod.salesInsight}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Inventory & Actions */}
                        <div className="w-full md:w-48 bg-[#fffdf8] border border-[#f8ead1] rounded-2xl p-4 space-y-3 shrink-0">
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                            <div>
                              <div className="text-[#8c633d] uppercase tracking-wider">Price</div>
                              <div className="text-[#3c281b] text-xs font-black">{formatCurrency(prod.price)}</div>
                            </div>
                            <div>
                              <div className="text-[#8c633d] uppercase tracking-wider">Cost</div>
                              <div className="text-[#3c281b] text-xs font-black">{formatCurrency(prod.cost)}</div>
                            </div>
                            <div>
                              <div className="text-[#8c633d] uppercase tracking-wider">Stock</div>
                              <div className="text-[#3c281b] text-xs font-black">{prod.stock}</div>
                            </div>
                            <div>
                              <div className="text-[#8c633d] uppercase tracking-wider">Sold</div>
                              <div className="text-[#3c281b] text-xs font-black">{prod.sales}</div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#8c633d]/8 flex flex-col gap-1.5">
                            <button
                              onClick={() => generateAI(prod)}
                              disabled={aiBusyId === prod._id}
                              className="w-full rounded-xl bg-[#604024] hover:bg-[#8d592d] text-white font-bold text-xs py-2 transition shadow-sm disabled:opacity-50"
                            >
                              {aiBusyId === prod._id ? 'Generating...' : 'AI Generate 🤖'}
                            </button>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                onClick={() => beginEdit(prod)}
                                className="w-full rounded-xl border border-gray-300 bg-white font-bold text-xs py-2 hover:bg-gray-50 text-gray-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeProduct(prod._id)}
                                className="w-full rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs py-2 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                    {!products.length && (
                      <div className="rounded-[1.5rem] border border-dashed border-cream-300 bg-white/70 p-10 text-center text-cream-700">
                        No products registered. Navigate to "Demo Tools" or create one in the editor.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TOOLS */}
            {adminTab === 'tools' && (
              <section className="glass-panel rounded-[2rem] p-6 shadow-soft bg-white/70 border border-[#8c633d]/12 space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#3c281b]">Developer Testing Utilities</h3>
                  <p className="text-xs text-[#8c633d] mt-1">
                    Control the backend MERN database state instantly to simulate real shopping scenarios.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Seed Box */}
                  <div className="rounded-2xl border border-[#f8ead1] bg-white p-5 space-y-4">
                    <h4 className="font-display text-lg font-bold text-[#3c281b]">Seed Luxury Pastry Catalog</h4>
                    <p className="text-xs text-[#8c633d] leading-relaxed">
                      Wipes the database and loads 6 gourmet products (sea salt dark chocolate, chewy pecan cookies, red velvet macadamia, truffles, macarons, brownies) with realistic prices, costs, stock levels, sales velocity, and high-quality photo URLs.
                    </p>
                    <button
                      onClick={handleSeedData}
                      disabled={loading}
                      className="rounded-xl bg-[#604024] hover:bg-[#8d592d] text-white font-bold text-xs px-5 py-3 transition shadow-sm disabled:opacity-60"
                    >
                      Seed Demo Data
                    </button>
                  </div>

                  {/* Reset Box */}
                  <div className="rounded-2xl border border-red-100 bg-white p-5 space-y-4">
                    <h4 className="font-display text-lg font-bold text-red-800">Clear Database</h4>
                    <p className="text-xs text-[#8c633d] leading-relaxed">
                      Instantly deletes all products in the database. Clean slate to test manual product addition from the Inventory Manager.
                    </p>
                    <button
                      onClick={handleClearData}
                      disabled={loading}
                      className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-3 transition shadow-sm disabled:opacity-60"
                    >
                      Reset Store (Clear All)
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* CUSTOMER CART SLIDEOVER PANEL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Overlay background */}
            <div
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-[#3c281b]/40 backdrop-blur-sm transition-opacity"
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md animate-reveal">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl border-l border-[#8c633d]/12">
                  {/* Cart Header */}
                  <div className="px-6 py-6 bg-[#604024] text-white flex justify-between items-center shadow-md">
                    <h2 className="font-display font-bold text-xl">Your Gourmet Cart 🛒</h2>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Cart List */}
                  <div className="flex-1 py-6 overflow-y-auto px-6 space-y-6">
                    {cart.map((item) => (
                      <div key={item.product._id} className="flex gap-4 items-center justify-between pb-4 border-b border-[#8c633d]/8">
                        <div className="flex items-center gap-3">
                          {item.product.imageUrl ? (
                            <img src={item.product.imageUrl} alt={item.product.name} className="h-14 w-14 rounded-xl object-cover border border-[#8c633d]/10" />
                          ) : (
                            <span className="text-3xl">🍪</span>
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-[#3c281b]">{item.product.name}</h4>
                            <span className="text-[#8d592d] text-xs font-semibold">{formatCurrency(item.product.price)}</span>
                          </div>
                        </div>

                        {/* Count adjust controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQuantity(item.product._id, -1)}
                            className="h-7 w-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xs text-[#3c281b]"
                          >
                            -
                          </button>
                          <span className="font-bold text-sm text-[#3c281b] w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product._id, 1)}
                            className="h-7 w-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xs text-[#3c281b]"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product._id)}
                            className="text-xs text-red-500 hover:underline font-bold ml-2"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {!cart.length && (
                      <div className="h-64 flex flex-col justify-center items-center text-center text-[#8c633d]">
                        <span className="text-5xl block mb-2">🛒</span>
                        <p className="font-bold text-sm">Your cart is empty.</p>
                        <p className="text-xs mt-1">Browse our storefront and add some gourmet treats!</p>
                      </div>
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && (
                    <div className="border-t border-[#8c633d]/12 px-6 py-6 bg-[#fffdf8] space-y-4 shadow-inner">
                      <div className="space-y-1.5 text-xs text-[#8c633d]">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-bold text-[#3c281b]">{formatCurrency(cartSubtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Bakery Tax (8%)</span>
                          <span className="font-bold text-[#3c281b]">{formatCurrency(cartSubtotal * 0.08)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-2 border-t border-dashed border-[#8c633d]/12">
                          <span className="text-[#3c281b]">Total Amount</span>
                          <span className="text-[#8d592d] text-base">{formatCurrency(cartSubtotal * 1.08)}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className="w-full rounded-2xl bg-[#604024] hover:bg-[#8d592d] text-white py-4 font-bold text-sm transition shadow-md flex items-center justify-center gap-2"
                      >
                        {loading ? 'Processing Order...' : 'Place Order 💳'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;