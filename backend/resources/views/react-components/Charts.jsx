/**
 * Advanced Chart Components
 * Reusable chart components for Dashboard integration
 */

import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * LineChart Component - For revenue trends
 */
export const RevenueChart = ({ data = MOCK_REVENUE_DATA }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: 'none',
            borderRadius: '8px',
            color: '#f8fafc',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#0284c7"
          strokeWidth={2}
          dot={{ fill: '#0284c7', r: 4 }}
          activeDot={{ r: 6 }}
          name="Revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * BarChart Component - For user distribution
 */
export const UserDistributionChart = ({ data = MOCK_USER_DATA }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: 'none',
            borderRadius: '8px',
            color: '#f8fafc',
          }}
        />
        <Legend />
        <Bar dataKey="premium" stackId="a" fill="#0284c7" name="Premium" />
        <Bar dataKey="free" stackId="a" fill="#cbd5e1" name="Free" />
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * PieChart Component - For subscription breakdown
 */
export const SubscriptionChart = ({ data = MOCK_SUBSCRIPTION_DATA }) => {
  const COLORS = ['#0284c7', '#14b8a6', '#f59e0b', '#ef4444'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name} (${value}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: 'none',
            borderRadius: '8px',
            color: '#f8fafc',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Mock data
const MOCK_REVENUE_DATA = [
  { month: 'Jan', revenue: 24000 },
  { month: 'Feb', revenue: 32000 },
  { month: 'Mar', revenue: 28000 },
  { month: 'Apr', revenue: 42000 },
  { month: 'May', revenue: 51000 },
  { month: 'Jun', revenue: 48000 },
  { month: 'Jul', revenue: 62000 },
  { month: 'Aug', revenue: 71000 },
  { month: 'Sep', revenue: 68000 },
  { month: 'Oct', revenue: 82000 },
  { month: 'Nov', revenue: 89000 },
  { month: 'Dec', revenue: 95000 },
];

const MOCK_USER_DATA = [
  { name: 'Week 1', premium: 240, free: 320 },
  { name: 'Week 2', premium: 280, free: 350 },
  { name: 'Week 3', premium: 320, free: 380 },
  { name: 'Week 4', premium: 350, free: 420 },
];

const MOCK_SUBSCRIPTION_DATA = [
  { name: 'Premium', value: 35 },
  { name: 'Free', value: 65 },
];

export default {
  RevenueChart,
  UserDistributionChart,
  SubscriptionChart,
};
