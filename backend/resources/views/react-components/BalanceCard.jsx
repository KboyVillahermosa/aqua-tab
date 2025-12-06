/**
 * BalanceCard Component
 * Large card displaying balance with currency and trend
 */

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const BalanceCard = ({
  title = 'Account Balance',
  amount = 12549.99,
  trend = 'up',
  trendValue = '+12.5%',
  lastUpdate = 'Updated just now',
  accentColor = 'from-blue-500 to-blue-600',
}) => {
  const isPositive = trend === 'up';

  return (
    <div
      className={`bg-gradient-to-br ${accentColor} rounded-2xl shadow-lg overflow-hidden text-white p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <p className="text-blue-100 uppercase text-xs font-semibold tracking-widest mb-2">
          {title}
        </p>

        {/* Amount */}
        <h2 className="text-4xl font-bold mb-6">₱{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>

        {/* Footer with Trend and Update */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${
                isPositive
                  ? 'bg-green-400/20 text-green-100'
                  : 'bg-red-400/20 text-red-100'
              }`}
            >
              {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              {trendValue} from last month
            </div>
          </div>
          <p className="text-sm text-blue-100">{lastUpdate}</p>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
    </div>
  );
};

export default BalanceCard;
