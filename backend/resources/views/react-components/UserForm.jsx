/**
 * User Form Component
 * Reusable form for creating and editing users
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Form Field Component
 */
const FormField = ({ label, id, type = 'text', value, onChange, error, placeholder }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
        error
          ? 'border-red-300 focus:ring-red-200'
          : 'border-slate-300 focus:ring-blue-200'
      }`}
    />
    {error && (
      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

/**
 * Select Field Component
 */
const SelectField = ({ label, id, value, onChange, options, error }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
        error
          ? 'border-red-300 focus:ring-red-200'
          : 'border-slate-300 focus:ring-blue-200'
      }`}
    >
      <option value="">Select an option</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

/**
 * User Form Component
 */
export const UserForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    subscription: 'free',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.subscription) {
      newErrors.subscription = 'Subscription plan is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Full Name"
        id="name"
        placeholder="John Doe"
        value={formData.name}
        onChange={handleChange('name')}
        error={submitted ? errors.name : ''}
      />

      <FormField
        label="Email Address"
        id="email"
        type="email"
        placeholder="john@example.com"
        value={formData.email}
        onChange={handleChange('email')}
        error={submitted ? errors.email : ''}
      />

      <SelectField
        label="Role"
        id="role"
        value={formData.role}
        onChange={handleChange('role')}
        options={[
          { value: 'admin', label: 'Administrator' },
          { value: 'manager', label: 'Manager' },
          { value: 'user', label: 'User' },
        ]}
        error={submitted ? errors.role : ''}
      />

      <SelectField
        label="Subscription Plan"
        id="subscription"
        value={formData.subscription}
        onChange={handleChange('subscription')}
        options={[
          { value: 'free', label: 'Free' },
          { value: 'premium', label: 'Premium' },
          { value: 'enterprise', label: 'Enterprise' },
        ]}
        error={submitted ? errors.subscription : ''}
      />

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-500 text-white font-medium py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update User' : 'Create User'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-slate-200 text-slate-900 font-medium py-2 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

/**
 * User Form Modal
 */
export const UserFormModal = ({
  isOpen,
  initialData,
  onSubmit,
  onClose,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          {initialData ? 'Edit User' : 'Add New User'}
        </h2>
        <UserForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default {
  UserForm,
  UserFormModal,
  FormField,
  SelectField,
};
