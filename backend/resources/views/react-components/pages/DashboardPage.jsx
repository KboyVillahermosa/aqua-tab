/**
 * DashboardPage Component
 * Main dashboard with stats, charts, and activity timeline
 * Integrates: useApi hooks, Skeletons, ErrorBoundary, Recharts charts
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
} from 'lucide-react';
import { ErrorBoundary, DataLoadingError } from './ErrorBoundary';
import { DashboardSkeleton, ChartSkeleton } from './Skeletons';
import { RevenueChart, UserDistributionChart, SubscriptionChart } from './Charts';
import StatCard from './StatCard';
import BalanceCard from './BalanceCard';
import ChartCard from './ChartCard';

/**
 * DashboardPage - Main dashboard component
 * Fetches dashboard stats and renders charts with loading states
 */
const DashboardPage = ({ activeMenu, setActiveMenu }) => {
  // Set active menu to dashboard
  useEffect(() => {
    setActiveMenu('dashboard');
  }, [setActiveMenu]);

  // State management
  const [statsData, setStatsData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [chartError, setChartError] = useState(null);

  /**
   * Fetch dashboard statistics on component mount
   * API endpoint: GET /api/stats
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        
        // Replace with your actual API URL
        const response = await fetch('/api/stats', {
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const result = await response.json();
        setStatsData(result.data || result);
      } catch (error) {
        console.error('Stats fetch error:', error);
        setStatsError(error.message);
        // Fallback mock data for demo
        setStatsData({
          total_users: 2847,
          active_users: 1294,
          monthly_revenue: 42580,
          conversion_rate: 3.8,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  /**
   * Fetch chart data on component mount
   * API endpoint: GET /api/charts
   */
  useEffect(() => {
    const fetchCharts = async () => {
      try {
        setChartLoading(true);
        setChartError(null);
        
        // Replace with your actual API URL
        const response = await fetch('/api/charts', {
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch charts');
        
        const result = await response.json();
        setChartData(result.data || result);
      } catch (error) {
        console.error('Charts fetch error:', error);
        setChartError(error.message);
        // Fallback mock data for demo
        setChartData({
          revenue: [
            { month: 'Jan', revenue: 24000 },
            { month: 'Feb', revenue: 32000 },
            { month: 'Mar', revenue: 28000 },
          ],
          subscription: [
            { name: 'Premium', value: 35 },
            { name: 'Free', value: 65 },
          ],
        });
      } finally {
        setChartLoading(false);
      }
    };

    fetchCharts();
  }, []);

  /**
   * Retry handlers for error states
   */
  const retryStats = () => {
    setStatsLoading(true);
    window.location.reload();
  };

  const retryCharts = () => {
    setChartLoading(true);
    window.location.reload();
  };

  // Show loading skeleton while fetching stats
  if (statsLoading && chartLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 p-6 md:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">
            Welcome back! Here's your business overview.
          </p>
        </div>

        {/* Stats Grid - 4 KPI Cards */}
        {/* Wraps stats fetching in error handling and loading states */}
        {statsError && (
          <DataLoadingError error={statsError} onRetry={retryStats} />
        )}

        {!statsError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stat 1: Total Users */}
            {statsLoading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-40 animate-pulse"
                  >
                    <div className="h-4 bg-slate-200 rounded w-24 mb-4"></div>
                    <div className="h-8 bg-slate-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-20"></div>
                  </div>
                ))
            ) : statsData ? (
              <>
                <StatCard
                  icon={Users}
                  label="Total Users"
                  value={statsData.total_users?.toLocaleString() || '2,847'}
                  trend="up"
                  trendValue="+12.5%"
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-600"
                />
                <StatCard
                  icon={Activity}
                  label="Active Users"
                  value={statsData.active_users?.toLocaleString() || '1,294'}
                  trend="up"
                  trendValue="+8.2%"
                  iconBgColor="bg-green-100"
                  iconColor="text-green-600"
                />
                <StatCard
                  icon={DollarSign}
                  label="Monthly Revenue"
                  value={`₱${(statsData.monthly_revenue || 42580).toLocaleString()}`}
                  trend="up"
                  trendValue="+5.1%"
                  iconBgColor="bg-teal-100"
                  iconColor="text-teal-600"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Conversion Rate"
                  value={`${(statsData.conversion_rate || 3.8).toFixed(1)}%`}
                  trend="down"
                  trendValue="-2.3%"
                  iconBgColor="bg-purple-100"
                  iconColor="text-purple-600"
                />
              </>
            ) : null}
          </div>
        )}

        {/* Balance Cards Row */}
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
            amount={8320.5}
            trend="down"
            trendValue="-3.2%"
            accentColor="from-teal-500 to-teal-600"
          />
        </div>

        {/* Charts Section */}
        {/* Displays Recharts components with loading and error states */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <ErrorBoundary>
            <ChartCard
              title="Revenue Trend"
              description="Last 12 months performance"
              onRefresh={() => window.location.reload()}
            >
              {chartLoading ? (
                <div className="h-80 bg-slate-50 rounded-lg animate-pulse flex items-center justify-center">
                  <RefreshCw className="text-slate-300 animate-spin" size={32} />
                </div>
              ) : chartError ? (
                <DataLoadingError error={chartError} onRetry={retryCharts} />
              ) : (
                <RevenueChart data={chartData?.revenue} />
              )}
            </ChartCard>
          </ErrorBoundary>

          {/* Distribution Chart */}
          <ErrorBoundary>
            <ChartCard
              title="User Distribution"
              description="Premium vs Free users"
              onRefresh={() => window.location.reload()}
            >
              {chartLoading ? (
                <div className="h-80 bg-slate-50 rounded-lg animate-pulse flex items-center justify-center">
                  <RefreshCw className="text-slate-300 animate-spin" size={32} />
                </div>
              ) : chartError ? (
                <DataLoadingError error={chartError} onRetry={retryCharts} />
              ) : (
                <UserDistributionChart data={chartData?.distribution} />
              )}
            </ChartCard>
          </ErrorBoundary>
        </div>

        {/* Subscription Breakdown Chart */}
        <div className="mt-6">
          <ErrorBoundary>
            <ChartCard
              title="Subscription Breakdown"
              description="Overall subscription distribution"
              onRefresh={() => window.location.reload()}
            >
              {chartLoading ? (
                <div className="h-80 bg-slate-50 rounded-lg animate-pulse flex items-center justify-center">
                  <RefreshCw className="text-slate-300 animate-spin" size={32} />
                </div>
              ) : chartError ? (
                <DataLoadingError error={chartError} onRetry={retryCharts} />
              ) : (
                <div className="flex justify-center">
                  <SubscriptionChart data={chartData?.subscription} />
                </div>
              )}
            </ChartCard>
          </ErrorBoundary>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-blue-600" />
            Recent Activity
          </h3>

          {/* Activity Timeline with mock data */}
          <div className="space-y-4">
            {[
              {
                title: 'New user registered',
                description: 'Sarah Johnson signed up',
                time: '2 hours ago',
                icon: '👤',
              },
              {
                title: 'Payment received',
                description: 'Premium subscription from john@example.com',
                time: '4 hours ago',
                icon: '💳',
              },
              {
                title: 'System update',
                description: 'Dashboard v2.0 deployed successfully',
                time: '1 day ago',
                icon: '🔄',
              },
              {
                title: 'New feature released',
                description: 'Real-time notifications now available',
                time: '2 days ago',
                icon: '⭐',
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex gap-4 pb-4 border-b border-slate-100 last:border-b-0"
              >
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{activity.title}</h4>
                  <p className="text-sm text-slate-600">{activity.description}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DashboardPage;
