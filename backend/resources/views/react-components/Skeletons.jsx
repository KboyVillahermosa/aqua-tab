/**
 * Loading Skeleton Components
 * Reusable skeleton components for loading states
 */

import React from 'react';

/**
 * Table Row Skeleton
 */
export const TableRowSkeleton = () => (
  <tr className="border-b border-slate-200 hover:bg-slate-50">
    <td className="px-6 py-4">
      <div className="h-4 bg-slate-200 rounded animate-pulse w-32"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-slate-200 rounded animate-pulse w-40"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-slate-200 rounded animate-pulse w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-slate-200 rounded animate-pulse w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-slate-200 rounded animate-pulse w-28"></div>
    </td>
    <td className="px-6 py-4">
      <div className="flex gap-2">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-8"></div>
        <div className="h-8 bg-slate-200 rounded animate-pulse w-8"></div>
        <div className="h-8 bg-slate-200 rounded animate-pulse w-8"></div>
      </div>
    </td>
  </tr>
);

/**
 * StatCard Skeleton
 */
export const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="h-3 bg-slate-200 rounded animate-pulse w-24 mb-2"></div>
        <div className="h-6 bg-slate-200 rounded animate-pulse w-32"></div>
      </div>
      <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse"></div>
    </div>
    <div className="h-3 bg-slate-200 rounded animate-pulse w-20"></div>
  </div>
);

/**
 * Chart Skeleton
 */
export const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
    <div className="h-4 bg-slate-200 rounded animate-pulse w-40 mb-6"></div>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-slate-200 rounded animate-pulse"></div>
      ))}
    </div>
  </div>
);

/**
 * Full Dashboard Skeleton
 */
export const DashboardSkeleton = () => (
  <div>
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Balance Cards */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm p-6 h-40">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-32 mb-4"></div>
          <div className="h-8 bg-slate-200 rounded animate-pulse w-40 mb-4"></div>
          <div className="h-3 bg-slate-200 rounded animate-pulse w-24"></div>
        </div>
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <ChartSkeleton key={i} />
      ))}
    </div>
  </div>
);

/**
 * Table Skeleton
 */
export const TableSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <table className="w-full">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
            Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
            Role
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
            Plan
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
            Joined
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4, 5].map((i) => (
          <TableRowSkeleton key={i} />
        ))}
      </tbody>
    </table>
  </div>
);

export default {
  TableRowSkeleton,
  StatCardSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  TableSkeleton,
};
