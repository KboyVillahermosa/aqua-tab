/**
 * UserTable Component
 * Comprehensive user management table with sorting, filtering, and actions
 */

import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';

const UserTable = ({ onAddUser, onViewUser, onEditUser, onDeleteUser }) => {
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with API call
  const mockUsers = [
    {
      id: 1,
      name: 'Sarah Anderson',
      email: 'sarah.anderson@email.com',
      role: 'admin',
      subscription: 'premium',
      joined: '2024-01-15',
      status: 'active',
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      role: 'user',
      subscription: 'free',
      joined: '2024-02-10',
      status: 'active',
    },
    {
      id: 3,
      name: 'Emma Wilson',
      email: 'emma.wilson@email.com',
      role: 'user',
      subscription: 'premium',
      joined: '2024-01-05',
      status: 'active',
    },
    {
      id: 4,
      name: 'James Rodriguez',
      email: 'james.rodriguez@email.com',
      role: 'user',
      subscription: 'free',
      joined: '2024-03-20',
      status: 'pending',
    },
    {
      id: 5,
      name: 'Lisa Park',
      email: 'lisa.park@email.com',
      role: 'user',
      subscription: 'premium',
      joined: '2024-01-30',
      status: 'active',
    },
  ];

  const itemsPerPage = 10;
  const totalPages = Math.ceil(mockUsers.length / itemsPerPage);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSortIcon = (column) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  const roleConfig = {
    admin: { label: 'Admin', status: 'admin' },
    user: { label: 'User', status: 'inactive' },
  };

  const subscriptionConfig = {
    premium: { label: 'Premium', status: 'premium' },
    free: { label: 'Free', status: 'free' },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Users Management
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {mockUsers.length} total users
          </p>
        </div>
        <button
          onClick={onAddUser}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 pl-10 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                >
                  Name
                  {getSortIcon('name')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('email')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                >
                  Email
                  {getSortIcon('email')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('role')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                >
                  Role
                  {getSortIcon('role')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('subscription')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                >
                  Subscription
                  {getSortIcon('subscription')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('joined')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                >
                  Joined
                  {getSortIcon('joined')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900"
                >
                  Status
                  {getSortIcon('status')}
                </button>
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {user.name}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={roleConfig[user.role].status}
                      label={roleConfig[user.role].label}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={subscriptionConfig[user.subscription].status}
                      label={subscriptionConfig[user.subscription].label}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">
                      {new Date(user.joined).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={user.status}
                      label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <ActionButton
                        action="view"
                        onClick={() => onViewUser(user.id)}
                      />
                      <ActionButton
                        action="edit"
                        onClick={() => onEditUser(user.id)}
                      />
                      <ActionButton
                        action="delete"
                        onClick={() => onDeleteUser(user.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-slate-500"
                >
                  <p>No users found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
        <p className="text-sm text-slate-600">
          Page {currentPage} of {totalPages} ({filteredUsers.length} results)
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="p-2 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
