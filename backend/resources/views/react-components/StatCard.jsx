/**
 * StatCard Component
 * Reusable stat card with icon, value, and optional trend indicator
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  currency = false,
}) => {
  const isPositive = trend === 'up';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 p-6">
      {/* Header with Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBgColor} rounded-lg p-3`}>
          <Icon size={24} className={iconColor} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
              isPositive
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {isPositive ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            {trendValue}
          </div>
        )}
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">
        {label}
      </p>

      {/* Value */}
      <p className="text-3xl font-bold text-slate-900">
        {currency ? '$' : ''}
        {value.toLocaleString()}
      </p>
    </div>
  );
};

export default StatCard;
