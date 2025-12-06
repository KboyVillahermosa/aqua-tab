/**
 * Sidebar Component
 * Main navigation sidebar with active menu state management
 * Integrates with DashboardPage and UsersPage for active menu highlighting
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/**
 * Sidebar - Navigation menu component
 * Props:
 *   - activeMenu: Current active menu item (e.g., 'dashboard', 'users')
 *   - onMenuChange: Callback when menu item is clicked
 *   - onNavigate: Callback to navigate to page (optional, for routing)
 *   - onLogout: Callback for logout functionality
 */
const Sidebar = ({ activeMenu = 'dashboard', onMenuChange, onNavigate, onLogout }) => {
  // State for collapsed/expanded sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);

  /**
   * Menu items configuration
   * Each item has icon, label, value (for active state), and href for routing
   */
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      value: 'dashboard',
      href: '/admin/dashboard',
      description: 'View dashboard and analytics',
    },
    {
      icon: Users,
      label: 'Users',
      value: 'users',
      href: '/admin/users',
      description: 'Manage users and permissions',
    },
    {
      icon: ShoppingCart,
      label: 'Orders',
      value: 'orders',
      href: '/admin/orders',
      description: 'View and manage orders',
    },
    {
      icon: Package,
      label: 'Inventory',
      value: 'inventory',
      href: '/admin/inventory',
      description: 'Manage inventory and stock',
    },
    {
      icon: Bell,
      label: 'Notifications',
      value: 'notifications',
      href: '/admin/notifications',
      description: 'System notifications and alerts',
    },
    {
      icon: Settings,
      label: 'Settings',
      value: 'settings',
      href: '/admin/settings',
      description: 'System configuration and settings',
    },
  ];

  /**
   * Handle menu item click
   * Calls both onMenuChange (for state) and onNavigate (for routing)
   */
  const handleMenuClick = (item) => {
    // Update active menu state
    if (onMenuChange) {
      onMenuChange(item.value);
    }

    // Navigate to page (if onNavigate is provided)
    if (onNavigate) {
      onNavigate(item.href);
    }
  };

  /**
   * Handle logout click
   */
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      if (onLogout) {
        onLogout();
      }
      // Redirect to login (adjust path as needed)
      window.location.href = '/login';
    }
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-slate-900 to-slate-800 text-white h-screen fixed left-0 top-0 shadow-lg transition-all duration-300 z-50 flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
              A
            </div>
            <div>
              <h2 className="font-bold text-lg">AQUATAB</h2>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        )}

        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-slate-700 rounded transition"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Main Menu Items */}
        <div className="space-y-2 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.value;

            return (
              <button
                key={item.value}
                onClick={() => handleMenuClick(item)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }
                `}
                title={isCollapsed ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />

                {/* Label (hidden when collapsed) */}
                {!isCollapsed && (
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">{item.label}</p>
                    {isActive && (
                      <p className="text-xs text-blue-100">{item.description}</p>
                    )}
                  </div>
                )}

                {/* Active indicator */}
                {isActive && !isCollapsed && (
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0 ml-auto"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Divider */}
      <div className="border-t border-slate-700"></div>

      {/* Bottom Section - User Info & Logout */}
      <div className="p-4 space-y-3">
        {/* User Profile Card (hidden when collapsed) */}
        {!isCollapsed && (
          <div className="bg-slate-700 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">John Doe</p>
                <p className="text-xs text-slate-400 truncate">admin@aquatab.com</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
            text-slate-300 hover:bg-red-500 hover:text-white
          `}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>

        {/* Settings Button (alternative to main Settings menu) */}
        {isCollapsed && (
          <button
            onClick={() => handleMenuClick(menuItems[5])}
            className="w-full flex items-center justify-center p-3 hover:bg-slate-700 rounded-lg transition"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        )}
      </div>

      {/* Sidebar Footer - Version Info (hidden when collapsed) */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-t border-slate-700 text-xs text-slate-400 text-center">
          <p>v2.0</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
