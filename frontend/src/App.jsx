import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import UsersPage from './pages/UsersPage';
import UserProfile from './pages/UserProfile';
import Store from './pages/Store';
import AIGenerator from './pages/AIGenerator';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/store" replace />;
  return children;
};

const UserRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RootRoute = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/store" replace />;
};

const LoadingScreen = () => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2FA084]"></div>
  </div>
);

const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-50 transition-colors duration-300">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide" id="main-content-area">
        <Navbar />
        <main className="w-full h-full grow p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Root redirect */}
              <Route path="/" element={<RootRoute />} />

              {/* User Routes */}
              <Route path="/store" element={<UserRoute><Store /></UserRoute>} />
              <Route path="/profile" element={<UserRoute><Store /></UserRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><Dashboard /></AdminLayout></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><AdminLayout><Products /></AdminLayout></AdminRoute>} />
              <Route path="/admin/ai-generator" element={<AdminRoute><AdminLayout><AIGenerator /></AdminLayout></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminLayout><Orders /></AdminLayout></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminLayout><UsersPage /></AdminLayout></AdminRoute>} />
              <Route path="/admin/profile" element={<AdminRoute><AdminLayout><UserProfile /></AdminLayout></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
