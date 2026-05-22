import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Settings, Sparkles, ShoppingCart, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const linkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
      isActive
        ? 'bg-[#6FCF97]/10 text-[#2FA084] dark:text-[#6FCF97] border border-[#6FCF97]/20'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-50'
    }`;

  return (
    <div className="w-64 bg-white/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700/50 backdrop-blur-xl flex flex-col transition-colors duration-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700/50 transition-colors">
        <Sparkles className="h-6 w-6 text-[#2FA084] dark:text-[#6FCF97] mr-2" />
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2FA084] to-[#1F6F5F] dark:from-[#6FCF97] dark:to-[#2FA084]">
          SmartStore AI
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <p className="px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Admin Panel</p>
        <nav className="px-4 space-y-1">
          <NavLink to="/admin/dashboard" className={linkClass}>
            <LayoutDashboard className="h-5 w-5 mr-3" /> Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            <ShoppingCart className="h-5 w-5 mr-3" /> Orders
          </NavLink>
          <NavLink to="/admin/products" className={linkClass}>
            <Package className="h-5 w-5 mr-3" /> Products
          </NavLink>
          <NavLink to="/admin/ai-generator" className={linkClass}>
            <Sparkles className="h-5 w-5 mr-3" /> AI Generator
          </NavLink>
          <NavLink to="/admin/users" className={linkClass}>
            <Users className="h-5 w-5 mr-3" /> Users
          </NavLink>
          <NavLink to="/admin/profile" className={linkClass}>
            <Settings className="h-5 w-5 mr-3" /> Profile
          </NavLink>
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 mt-auto">
        <button 
          onClick={logout}
          className="flex w-full items-center px-4 py-3 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
