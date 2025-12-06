/**
 * ChartCard Component
 * Wrapper component for charts with title and description
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';

const ChartCard = ({ title, description, children, onRefresh }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {description && (
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        )}
      </div>

      {/* Chart Content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
