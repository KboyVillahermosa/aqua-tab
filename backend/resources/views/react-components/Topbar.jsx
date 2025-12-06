/**
 * Topbar Component
 * Header with search, user profile, and notifications
 */

import React from 'react';
import { Search, Bell, User, Settings } from 'lucide-react';

const Topbar = () => {
  return (
    <div className="bg-white border-b border-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 ml-8">
          {/* Notifications */}
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200"></div>

          {/* User Profile Dropdown */}
          <div className="flex items-center gap-3 pl-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">John Doe</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-md transition-shadow">
              JD
            </div>
          </div>

          {/* Settings Button */}
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-4">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
