import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Search, Bell, Plus, MessageSquare, Sun, Moon, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors">
      
      {/* Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md relative">
        <Search className="absolute left-3 h-4 w-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Global search (products, orders, users)..." 
          className="w-full bg-slate-100 dark:bg-slate-700/50 border border-transparent focus:border-[#2FA084]/50 rounded-lg py-2 pl-9 pr-4 outline-none text-slate-700 dark:text-slate-200 text-sm transition-all focus:bg-white dark:focus:bg-slate-800"
        />
        <div className="absolute right-2 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          <span className="border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 shadow-sm">Ctrl</span>
          <span className="border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 shadow-sm">K</span>
        </div>
      </div>

      <div className="flex-1 md:hidden"></div> {/* Spacer for mobile */}

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        <Link to="/admin/products" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#2FA084] hover:bg-[#1F6F5F] text-white text-sm font-medium rounded-lg shadow-sm transition-colors mr-2">
          <Plus className="h-4 w-4" /> Quick Add
        </Link>

        <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-[#2FA084] dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" title="Toggle theme">
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button className="p-2 text-slate-500 hover:text-[#2FA084] dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors relative" title="Messages">
          <MessageSquare className="h-5 w-5" />
        </button>

        <button className="p-2 text-slate-500 hover:text-[#2FA084] dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors relative" title="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-pink-500 border-2 border-white dark:border-slate-800"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{user?.name}</p>
            <p className="text-[10px] font-medium text-[#2FA084] dark:text-[#6FCF97] uppercase tracking-wider">Administrator</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6FCF97] to-[#2FA084] border-2 border-white dark:border-slate-700 shadow-sm flex items-center justify-center cursor-pointer">
             <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
