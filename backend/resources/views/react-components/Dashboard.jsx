/**
 * Dashboard Page Component
 * Main dashboard with stats, balance, and charts
 */

import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
} from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import StatCard from './StatCard';
import BalanceCard from './BalanceCard';
import ChartCard from './ChartCard';
import { RevenueChart, UserDistributionChart, SubscriptionChart } from './Charts';

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Mock data for stats
  const stats = [
    {
      icon: Users,
      label: 'Total Users',
      value: 2847,
      trend: 'up',
      trendValue: '+12.5%',
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: TrendingUp,
      label: 'Active Users',
      value: 1294,
      trend: 'up',
      trendValue: '+8.2%',
      iconBgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      icon: DollarSign,
      label: 'Monthly Revenue',
      value: 42580,
      trend: 'up',
      trendValue: '+24.3%',
      currency: true,
      iconBgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      icon: Activity,
      label: 'Conversion Rate',
      value: 3.8,
      trend: 'down',
      trendValue: '-2.1%',
      iconBgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500 mt-2">Welcome back! Here's your performance overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  trend={stat.trend}
                  trendValue={stat.trendValue}
                  currency={stat.currency}
                  iconBgColor={stat.iconBgColor}
                  iconColor={stat.iconColor}
                />
              ))}
            </div>

            {/* Balance & Invested Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <BalanceCard
                title="Account Balance"
                amount={12549.99}
                trend="up"
                trendValue="+12.5%"
                accentColor="from-blue-500 to-blue-600"
              />
              <BalanceCard
                title="Total Invested"
                amount={8320.50}
                trend="down"
                trendValue="-3.2%"
                accentColor="from-teal-500 to-teal-600"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <ChartCard
                title="Revenue Trend"
                description="Last 12 months performance"
                onRefresh={() => console.log('Refresh revenue chart')}
              >
                <RevenueChart />
              </ChartCard>

              {/* Distribution Chart */}
              <ChartCard
                title="User Distribution"
                description="By subscription type"
                onRefresh={() => console.log('Refresh distribution chart')}
              >
                <SubscriptionChart />
              </ChartCard>
            </div>

            {/* Activity Timeline */}
            <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 pb-4 border-b border-slate-100 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Activity size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        New user registration
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {Math.random() > 0.5 ? '2 hours' : '5 minutes'} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
