/**
 * StatusBadge Component
 * Reusable badge component for various statuses
 */

import React from 'react';

const StatusBadge = ({ status, label }) => {
  const statusConfigs = {
    active: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      dot: 'bg-green-400',
    },
    inactive: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      dot: 'bg-slate-400',
    },
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      dot: 'bg-yellow-400',
    },
    premium: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      dot: 'bg-purple-400',
    },
    free: {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      dot: 'bg-slate-300',
    },
    admin: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-400',
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      dot: 'bg-red-400',
    },
  };

  const config = statusConfigs[status] || statusConfigs.inactive;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      {label}
    </div>
  );
};

export default StatusBadge;
