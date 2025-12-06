/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component
 * Wraps components to catch and handle errors
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <RefreshCw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Alert Component
 * Display inline error messages
 */
export const ErrorAlert = ({ message, onDismiss }) => (
  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-medium text-red-800">{message}</p>
    </div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        className="text-red-600 hover:text-red-700 flex-shrink-0"
      >
        ✕
      </button>
    )}
  </div>
);

/**
 * API Error Handler
 * Parse and format API error messages
 */
export const parseApiError = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Loading Error State
 * Display when data fetch fails
 */
export const DataLoadingError = ({ error, onRetry }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
    <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-slate-900 mb-2">
      Failed to load data
    </h3>
    <p className="text-slate-600 mb-6">{error}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
    >
      <RefreshCw size={16} />
      Try Again
    </button>
  </div>
);

export default {
  ErrorBoundary,
  ErrorAlert,
  parseApiError,
  DataLoadingError,
};
