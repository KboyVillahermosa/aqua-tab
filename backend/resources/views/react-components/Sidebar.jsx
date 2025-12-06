/**
 * Sidebar Component
 * Navigation sidebar with smooth hover effects and active states
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
} from 'lucide-react';

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-slate-700 text-white transition-all duration-300 ease-in-out flex flex-col h-screen fixed left-0 top-0 shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-600">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg">
              A
            </div>
            <h1 className="text-xl font-bold">AQUATAB</h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
        >
          <ChevronDown
            size={20}
            className={`transform transition-transform ${collapsed ? 'rotate-90' : 'rotate-0'}`}
          />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveMenu(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeMenu === id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-600 hover:text-white'
            }`}
            title={collapsed ? label : ''}
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer - Logout */}
      <div className="border-t border-slate-600 p-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-600 hover:text-white transition-all duration-200">
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
