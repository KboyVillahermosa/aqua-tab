/**
 * App.jsx - Main Application Component
 * Handles routing, layout, and page rendering for AQUATAB Admin
 * 
 * Architecture:
 * - Sidebar (fixed left navigation)
 * - Main content area with page components
 * - Active menu state management
 * - Route handling with React Router
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './pages/Sidebar';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import Topbar from './components/navigation/Topbar';

/**
 * Main App Layout Component
 * Provides the overall layout with Sidebar and content area
 */
const AppLayout = ({ children, activeMenu, onMenuChange, onLogout }) => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={onMenuChange}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 transition-all duration-300">
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

/**
 * App Component - Root application component
 * Manages routing, authentication, and global state
 */
const AppContent = () => {
  // State management
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  /**
   * Initialize app - check authentication, load user data
   */
  useEffect(() => {
    // Simulate checking authentication
    // In production, this would verify JWT token and fetch user data
    const initializeApp = async () => {
      try {
        // Check if user is logged in (check localStorage or API)
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Fetch user data from API
          // const response = await fetch('/api/me', {
          //   headers: { 'Authorization': `Bearer ${token}` }
          // });
          // const userData = await response.json();
          // setUser(userData);

          // For now, set dummy user
          setUser({
            id: 1,
            name: 'John Doe',
            email: 'admin@aquatab.com',
            role: 'admin',
          });
        } else {
          // Redirect to login if no token
          // window.location.href = '/login';
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  /**
   * Update active menu based on current route
   */
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('dashboard')) {
      setActiveMenu('dashboard');
    } else if (path.includes('users')) {
      setActiveMenu('users');
    } else if (path.includes('orders')) {
      setActiveMenu('orders');
    } else if (path.includes('inventory')) {
      setActiveMenu('inventory');
    } else if (path.includes('notifications')) {
      setActiveMenu('notifications');
    } else if (path.includes('settings')) {
      setActiveMenu('settings');
    }
  }, [location.pathname]);

  /**
   * Handle menu change
   * Update activeMenu state when user clicks sidebar item
   */
  const handleMenuChange = (menuValue) => {
    setActiveMenu(menuValue);
  };

  /**
   * Handle logout
   * Clear authentication and redirect to login
   */
  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem('auth_token');
    // Clear user data
    setUser(null);
    // Redirect to login
    // window.location.href = '/login';
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">AQUATAB</h1>
          <p className="text-slate-600 mt-2">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if on root /admin path
  if (location.pathname === '/admin' || location.pathname === '/admin/') {
    return <Navigate to="/admin/dashboard" />;
  }

  return (
    <AppLayout
      activeMenu={activeMenu}
      onMenuChange={handleMenuChange}
      onLogout={handleLogout}
    >
      <Routes>
        {/* Dashboard Route */}
        <Route path="/admin/dashboard" element={<DashboardPage />} />

        {/* Users Management Route */}
        <Route path="/admin/users" element={<UsersPage />} />

        {/* Orders Route (Placeholder - create OrdersPage.jsx following UsersPage pattern) */}
        <Route
          path="/admin/orders"
          element={
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h1 className="text-2xl font-bold mb-2">Orders</h1>
              <p className="text-slate-600">Orders page - Coming soon</p>
            </div>
          }
        />

        {/* Inventory Route (Placeholder - create InventoryPage.jsx following UsersPage pattern) */}
        <Route
          path="/admin/inventory"
          element={
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h1 className="text-2xl font-bold mb-2">Inventory</h1>
              <p className="text-slate-600">Inventory page - Coming soon</p>
            </div>
          }
        />

        {/* Notifications Route (Placeholder - create NotificationsPage.jsx) */}
        <Route
          path="/admin/notifications"
          element={
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h1 className="text-2xl font-bold mb-2">Notifications</h1>
              <p className="text-slate-600">Notifications page - Coming soon</p>
            </div>
          }
        />

        {/* Settings Route (Placeholder - create SettingsPage.jsx) */}
        <Route
          path="/admin/settings"
          element={
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h1 className="text-2xl font-bold mb-2">Settings</h1>
              <p className="text-slate-600">Settings page - Coming soon</p>
            </div>
          }
        />

        {/* Catch-all redirect to dashboard */}
        <Route path="*" element={<Navigate to="/admin/dashboard" />} />
      </Routes>
    </AppLayout>
  );
};

/**
 * Root App wrapper with Router
 */
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
