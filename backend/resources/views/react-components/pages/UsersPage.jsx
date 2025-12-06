/**
 * UsersPage Component
 * User management page with CRUD operations
 * Integrates: useApi hooks, Skeletons, ErrorBoundary, UserForm modal, ActionButtons, StatusBadges
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ErrorBoundary, ErrorAlert } from './ErrorBoundary';
import { TableSkeleton } from './Skeletons';
import { UserFormModal } from './UserForm';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';

/**
 * ActionCell Component
 * Renders action buttons for each user row
 */
const ActionCell = ({ user, onView, onEdit, onDelete, onDeleteLoading }) => {
  return (
    <div className="flex gap-2 items-center">
      <ActionButton
        action="view"
        onClick={() => onView(user)}
        tooltip="View user details"
      />
      <ActionButton
        action="edit"
        onClick={() => onEdit(user)}
        tooltip="Edit user"
      />
      <ActionButton
        action="delete"
        onClick={() => onDelete(user.id)}
        disabled={onDeleteLoading}
        tooltip="Delete user"
      />
    </div>
  );
};

/**
 * UsersPage - User management component
 * Displays users list, allows CRUD operations
 */
const UsersPage = ({ activeMenu, setActiveMenu }) => {
  // Set active menu to users
  useEffect(() => {
    setActiveMenu('users');
  }, [setActiveMenu]);

  // ==================== STATE MANAGEMENT ====================
  
  // User data state
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    subscription: '',
    role: '',
  });

  // Form modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // ==================== FETCH USERS ====================

  /**
   * Fetch users from API on component mount
   * API endpoint: GET /api/users
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        setUsersError(null);

        // Replace with your actual API URL
        const response = await fetch('/api/users', {
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch users');

        const result = await response.json();
        const usersData = result.data || result;
        
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error('Users fetch error:', error);
        setUsersError(error.message);
        
        // Fallback mock data for demo
        setUsers([
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            subscription: 'premium',
            status: 'active',
            created_at: '2025-01-15',
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'manager',
            subscription: 'premium',
            status: 'active',
            created_at: '2025-01-10',
          },
          {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike@example.com',
            role: 'user',
            subscription: 'free',
            status: 'active',
            created_at: '2025-01-05',
          },
        ]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ==================== SEARCH & FILTER ====================

  /**
   * Apply search, filters, and sorting to users list
   * Updates filteredUsers whenever users, searchTerm, or filters change
   */
  useEffect(() => {
    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((user) => user.status === filters.status);
    }

    // Apply subscription filter
    if (filters.subscription) {
      result = result.filter(
        (user) => user.subscription === filters.subscription
      );
    }

    // Apply role filter
    if (filters.role) {
      result = result.filter((user) => user.role === filters.role);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page
  }, [users, searchTerm, filters, sortBy, sortDirection]);

  // ==================== PAGINATION ====================

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ==================== CRUD OPERATIONS ====================

  /**
   * Handle view user - opens modal (can be extended to show details)
   */
  const handleViewUser = (user) => {
    console.log('View user:', user);
    // Implement view user logic here
  };

  /**
   * Handle edit user - opens form modal with user data
   */
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowFormModal(true);
  };

  /**
   * Handle delete user
   * API endpoint: DELETE /api/users/{id}
   */
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) throw new Error('Failed to delete user');

      // Remove user from list
      setUsers(users.filter((u) => u.id !== userId));
      setFormError(null);
    } catch (error) {
      console.error('Delete user error:', error);
      setFormError(`Failed to delete user: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Handle add new user - opens empty form modal
   */
  const handleAddUser = () => {
    setSelectedUser(null);
    setShowFormModal(true);
  };

  /**
   * Handle form submission (create or update user)
   * API endpoints: POST /api/users (create) or PUT /api/users/{id} (update)
   */
  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setFormError(null);

      const method = selectedUser ? 'PUT' : 'POST';
      const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save user');

      const result = await response.json();
      const newUser = result.data || result;

      if (selectedUser) {
        // Update existing user
        setUsers(users.map((u) => (u.id === newUser.id ? newUser : u)));
      } else {
        // Add new user
        setUsers([...users, newUser]);
      }

      setShowFormModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Form submit error:', error);
      setFormError(`Failed to save user: ${error.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Handle export users as CSV
   */
  const handleExportUsers = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Subscription', 'Status'];
    const rows = filteredUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.subscription,
      user.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString()}.csv`;
    link.click();
  };

  /**
   * Handle reset filters
   */
  const handleResetFilters = () => {
    setFilters({ status: '', subscription: '', role: '' });
    setSearchTerm('');
  };

  /**
   * Handle sort column
   */
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if clicking same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and reset to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // ==================== RENDER ====================

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 p-6 md:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Users size={28} className="text-blue-600" />
                User Management
              </h1>
              <p className="text-slate-600 mt-1">
                Manage and monitor all users in the system
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleAddUser}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
              >
                <Plus size={18} />
                Add User
              </button>
              <button
                onClick={handleExportUsers}
                className="flex items-center gap-2 bg-slate-200 text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-300 transition font-medium"
              >
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error Alert */}
        {(usersError || formError) && (
          <ErrorAlert
            message={usersError || formError}
            onDismiss={() => {
              setUsersError(null);
              setFormError(null);
            }}
          />
        )}

        {/* Filter Panel - Collapsible */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {showFilters && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Subscription Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subscription
                  </label>
                  <select
                    value={filters.subscription}
                    onChange={(e) =>
                      setFilters({ ...filters, subscription: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Plans</option>
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role
                  </label>
                  <select
                    value={filters.role}
                    onChange={(e) =>
                      setFilters({ ...filters, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>

              {/* Filter Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition font-medium text-sm"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        {/* Shows skeleton while loading, error state if failed, or table if loaded */}
        {usersLoading ? (
          <TableSkeleton />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Table Header with Info */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                Showing {paginatedUsers.length > 0 ? startIndex + 1 : 0} to{' '}
                {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{' '}
                {filteredUsers.length} users
              </p>
            </div>

            {/* Table */}
            {paginatedUsers.length > 0 ? (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {/* Name Column */}
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase hover:text-slate-900"
                      >
                        Name
                        {sortBy === 'name' &&
                          (sortDirection === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          ))}
                      </button>
                    </th>

                    {/* Email Column */}
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase hover:text-slate-900"
                      >
                        Email
                        {sortBy === 'email' &&
                          (sortDirection === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          ))}
                      </button>
                    </th>

                    {/* Role Column */}
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('role')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase hover:text-slate-900"
                      >
                        Role
                        {sortBy === 'role' &&
                          (sortDirection === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          ))}
                      </button>
                    </th>

                    {/* Subscription Column */}
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('subscription')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase hover:text-slate-900"
                      >
                        Plan
                        {sortBy === 'subscription' &&
                          (sortDirection === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          ))}
                      </button>
                    </th>

                    {/* Joined Column */}
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('created_at')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase hover:text-slate-900"
                      >
                        Joined
                        {sortBy === 'created_at' &&
                          (sortDirection === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          ))}
                      </button>
                    </th>

                    {/* Status Column */}
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase hover:text-slate-900"
                      >
                        Status
                        {sortBy === 'status' &&
                          (sortDirection === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          ))}
                      </button>
                    </th>

                    {/* Actions Column */}
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition"
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{user.name}</p>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <p className="text-slate-600 text-sm">{user.email}</p>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <StatusBadge status={user.role} />
                      </td>

                      {/* Subscription */}
                      <td className="px-6 py-4">
                        <StatusBadge status={user.subscription} />
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4">
                        <p className="text-slate-600 text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <ActionCell
                          user={user}
                          onView={handleViewUser}
                          onEdit={handleEditUser}
                          onDelete={handleDeleteUser}
                          onDeleteLoading={deleteLoading}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center">
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600 font-medium">No users found</p>
                <p className="text-slate-500 text-sm">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="text-sm text-slate-600 font-medium">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {/* Opens for both create and edit operations */}
      <UserFormModal
        isOpen={showFormModal}
        initialData={selectedUser}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setShowFormModal(false);
          setSelectedUser(null);
        }}
        isLoading={formLoading}
      />
    </ErrorBoundary>
  );
};

export default UsersPage;
