import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchOrders, updateOrderStatus, deleteOrder } from '../services/api';
import { ShoppingCart, Search, Filter, Trash2, ChevronDown } from 'lucide-react';

const STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'];

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const loadOrders = async () => {
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;

      const data = await fetchOrders(user.token, params);
      setOrders(data.orders);
      setTotalPages(data.pages);
      setTotalOrders(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user.token, search, statusFilter, page]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(user.token, id, newStatus);
      await loadOrders();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteOrder(user.token, id);
      await loadOrders();
    } catch (error) {
      alert(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
      case 'Processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
      case 'Shipped': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30';
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'Canceled': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-[#2FA084]" /> Order Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View and manage customer orders.</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden flex flex-col">
        {/* Filters bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:border-[#2FA084] transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-8 text-sm outline-none focus:border-[#2FA084] appearance-none transition-colors cursor-pointer"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{order.product?.name || 'Deleted Product'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Qty: {order.quantity}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {order.buyer?.email || 'Guest User'}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#2FA084] dark:text-[#6FCF97]">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(order.saleDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-md border outline-none cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      {STATUSES.filter(s => s !== 'All').map(s => (
                        <option key={s} value={s} className="bg-white text-slate-800">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(order._id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center text-sm text-slate-500 bg-slate-50/50 dark:bg-slate-800/30">
          <span>Total {totalOrders} orders</span>
          <div className="flex gap-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 disabled:opacity-50"
            >
              Prev
            </button>
            <button className="px-3 py-1 border border-[#2FA084] rounded bg-[#2FA084] text-white">{page}</button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page >= totalPages}
              className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
