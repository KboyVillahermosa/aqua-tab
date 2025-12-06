/**
 * ActionButton Component
 * Icon-based action buttons for table row actions
 */

import React from 'react';
import { Eye, Pencil, Trash2, Download, Copy } from 'lucide-react';

const ActionButton = ({ action, onClick, disabled = false, tooltip }) => {
  const actionConfigs = {
    view: { icon: Eye, color: 'text-blue-600 hover:bg-blue-50', tooltip: 'View' },
    edit: { icon: Pencil, color: 'text-amber-600 hover:bg-amber-50', tooltip: 'Edit' },
    delete: { icon: Trash2, color: 'text-red-600 hover:bg-red-50', tooltip: 'Delete' },
    download: { icon: Download, color: 'text-green-600 hover:bg-green-50', tooltip: 'Download' },
    copy: { icon: Copy, color: 'text-slate-600 hover:bg-slate-50', tooltip: 'Copy' },
  };

  const config = actionConfigs[action];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all duration-200 ${config.color} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      title={tooltip || config.tooltip}
    >
      <Icon size={18} />
    </button>
  );
};

export default ActionButton;
