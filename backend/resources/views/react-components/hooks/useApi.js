/**
 * useApi Hook
 * Custom hook for handling API requests with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Generic API hook for GET requests
 * @param {string} url - The API endpoint URL
 * @param {object} options - Additional options (headers, etc.)
 * @returns {object} { data, loading, error, refetch }
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

/**
 * Mutation hook for POST, PUT, DELETE requests
 * @param {string} url - The API endpoint URL
 * @param {object} options - Additional options (method, headers, etc.)
 * @returns {object} { execute, loading, error, data }
 */
export const useApiMutation = (url, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (payload = null) => {
      try {
        setLoading(true);
        setError(null);

        const fetchOptions = {
          method: options.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers,
          },
          ...options,
        };

        if (payload) {
          fetchOptions.body = JSON.stringify(payload);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err.message || 'An error occurred while making request';
        setError(errorMessage);
        console.error('Mutation error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, options]
  );

  return { execute, loading, error, data };
};

/**
 * Hook for fetching users from API
 * @returns {object} { users, loading, error, refetch }
 */
export const useUsers = () => {
  return useFetch('/api/users');
};

/**
 * Hook for fetching dashboard stats
 * @returns {object} { stats, loading, error, refetch }
 */
export const useDashboardStats = () => {
  return useFetch('/api/stats');
};

/**
 * Hook for fetching chart data
 * @returns {object} { chartData, loading, error, refetch }
 */
export const useChartData = () => {
  return useFetch('/api/charts');
};

/**
 * Hook for deleting a user
 * @returns {object} { deleteUser, loading, error }
 */
export const useDeleteUser = () => {
  const { execute, loading, error } = useApiMutation('', { method: 'DELETE' });

  const deleteUser = useCallback(
    async (userId) => {
      return execute(null, `/api/users/${userId}`);
    },
    [execute]
  );

  return { deleteUser, loading, error };
};

/**
 * Hook for creating a user
 * @returns {object} { createUser, loading, error }
 */
export const useCreateUser = () => {
  const { execute, loading, error } = useApiMutation('/api/users', { method: 'POST' });

  return { createUser: execute, loading, error };
};

/**
 * Hook for updating a user
 * @returns {object} { updateUser, loading, error }
 */
export const useUpdateUser = (userId) => {
  const { execute, loading, error } = useApiMutation(`/api/users/${userId}`, { method: 'PUT' });

  return { updateUser: execute, loading, error };
};

export default {
  useFetch,
  useApiMutation,
  useUsers,
  useDashboardStats,
  useChartData,
  useDeleteUser,
  useCreateUser,
  useUpdateUser,
};
