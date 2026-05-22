import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { fetchDashboardStats, fetchAISalesSuggestions } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { DollarSign, Package, Users, AlertTriangle, TrendingUp, Sparkles, ShoppingCart, BarChart3, RefreshCw, Shield, Clock, PlusCircle, UserPlus, RefreshCcw } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Filler, Legend);

const CATEGORY_COLORS = ['#2FA084', '#6FCF97', '#1F6F5F', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStats(user.token);
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user.token]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2FA084]"></div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const tickColor = isDarkMode ? 'rgba(148,163,184,0.8)' : 'rgba(100,116,139,0.8)';
  const gridColor = isDarkMode ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.2)';

  // Revenue Line Chart
  const revenueData = {
    labels: stats.salesOverTime.map(s => s._id),
    datasets: [{
      fill: true,
      label: 'Revenue ($)',
      data: stats.salesOverTime.map(s => s.revenue),
      borderColor: '#2FA084',
      backgroundColor: isDarkMode ? 'rgba(111,207,151,0.15)' : 'rgba(47,160,132,0.15)',
      tension: 0.4,
    }],
  };

  // Top Products Bar Chart
  const topProductsLabels = stats.topProducts.slice(0, 4).map(p => p.name.substring(0, 15) + (p.name.length > 15 ? '...' : ''));
  const topProductsData = {
    labels: topProductsLabels,
    datasets: [{
      label: 'Revenue ($)',
      data: stats.topProducts.slice(0, 4).map(p => p.totalRevenue),
      backgroundColor: '#6FCF97',
      borderRadius: 4,
    }],
  };

  // Category Pie Chart
  const pieData = {
    labels: stats.categorySales.map(c => c._id || 'General'),
    datasets: [{
      data: stats.categorySales.map(c => c.totalRevenue),
      backgroundColor: CATEGORY_COLORS.slice(0, stats.categorySales.length),
      borderWidth: 2,
      borderColor: isDarkMode ? '#1e293b' : '#ffffff',
    }],
  };

  const chartOpts = (showLegend = false, hideX = false) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: showLegend, labels: { color: tickColor } } },
    scales: {
      y: { grid: { color: gridColor }, ticks: { color: tickColor } },
      x: { grid: { display: false }, ticks: { color: tickColor, display: !hideX } },
    },
  });

  const inStock = stats.totalProducts - stats.lowStockCount;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time metrics and AI analytics.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-lg text-indigo-700 dark:text-indigo-300">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-semibold">Admin Privileges Active</span>
        </div>
      </div>

      {/* Stat Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-6 w-6 text-[#2FA084]" />} accent="border-[#6FCF97]/30 bg-gradient-to-br from-[#6FCF97]/10 to-transparent" trend="+12%" />
        <StatCard title="Total Orders" value={stats.totalSalesCount} icon={<ShoppingCart className="h-6 w-6 text-blue-500" />} accent="border-blue-200 dark:border-blue-500/30 bg-gradient-to-br from-blue-50 dark:from-blue-500/10 to-transparent" trend="+5%" />
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="h-6 w-6 text-purple-500" />} accent="border-purple-200 dark:border-purple-500/30 bg-gradient-to-br from-purple-50 dark:from-purple-500/10 to-transparent" trend="+18%" />
        
        {/* Inventory Mini Card */}
        <div className="border rounded-xl p-4 border-amber-200 dark:border-amber-500/30 bg-gradient-to-br from-amber-50 dark:from-amber-500/10 to-transparent transition-all hover:-translate-y-1">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">Inventory Status</p>
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalProducts}</h3>
            <Package className="h-5 w-5 text-amber-500 mb-1" />
          </div>
          <div className="flex gap-2 text-[10px] font-bold">
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">{inStock} In Stock</span>
            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">{stats.lowStockCount} Low</span>
          </div>
        </div>
      </div>

      {/* Charts Layout - Better Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Revenue Trend (Spans 2 cols, full height) */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center justify-between">
            <span className="flex items-center"><TrendingUp className="h-5 w-5 text-[#2FA084] mr-2" /> Revenue Trend (7 days)</span>
            <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Daily</span>
          </h2>
          <div className="flex-1 min-h-[350px]"><Line data={revenueData} options={chartOpts()} /></div>
        </div>

        {/* Right side: Two stacked smaller charts */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-5 flex-1 flex flex-col justify-center">
            <h2 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">Category Sales</h2>
            <div className="h-[140px] flex items-center justify-center">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: tickColor, padding: 10, font: { size: 10 }, boxWidth: 10 } } } }} />
            </div>
          </div>
          
          <div className="glass-panel p-5 flex-1 flex flex-col justify-center">
            <h2 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">Top Products</h2>
            <div className="h-[140px]"><Bar data={topProductsData} options={chartOpts(false, false)} /></div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Recent Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Timeline */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" /> Recent System Activity
          </h2>
          <div className="space-y-4">
            {stats.recentSales && stats.recentSales.slice(0, 4).map((sale, i) => (
              <ActivityItem 
                key={sale._id || i}
                icon={<ShoppingCart className="h-4 w-4 text-[#2FA084]" />} 
                bg="bg-[#6FCF97]/20" 
                text={`Order ${sale.orderNumber ? '#' + sale.orderNumber : 'received'}`} 
                time={new Date(sale.saleDate).toLocaleDateString()} 
                desc={`${sale.product?.name || 'Product'} for $${sale.totalAmount.toFixed(2)}`} 
              />
            ))}
            {(!stats.recentSales || stats.recentSales.length === 0) && (
              <p className="text-sm text-slate-500">No recent activity found.</p>
            )}
          </div>
        </div>

        {/* Small Top Selling Table */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Top Selling Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 pr-4 font-medium">Product</th>
                  <th className="pb-3 pr-4 font-medium">Sales Vol</th>
                  <th className="pb-3 font-medium">Total Rev</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">{i+1}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{p.totalQuantity} units</td>
                    <td className="py-3 font-bold text-[#2FA084] dark:text-[#6FCF97]">${p.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ title, value, icon, accent, trend }) => (
  <div className={`border rounded-xl p-5 ${accent} transition-all hover:-translate-y-1 relative overflow-hidden group`}>
    <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 dark:bg-black/10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <div className="flex items-end gap-2 mt-1">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
          {trend && <span className="text-xs font-bold text-emerald-500 mb-1">{trend}</span>}
        </div>
      </div>
      <div className="p-3 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm">{icon}</div>
    </div>
  </div>
);

const ActivityItem = ({ icon, bg, text, time, desc }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="w-px h-full bg-slate-200 dark:bg-slate-700 mt-2"></div>
    </div>
    <div className="pb-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{text}</p>
        <span className="text-[10px] text-slate-400 font-medium">{time}</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
    </div>
  </div>
);

export default Dashboard;
