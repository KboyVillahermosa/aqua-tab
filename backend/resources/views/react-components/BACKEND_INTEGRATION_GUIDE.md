/\*\*

-   BACKEND INTEGRATION GUIDE
-   How to connect React frontend with Laravel backend
    \*/

# Backend API Integration Guide

## 🔗 Laravel API Endpoints Setup

### 1. Create API Routes (routes/api.php)

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StatsController;

Route::middleware('auth:api')->group(function () {
    // User Management
    Route::apiResource('users', UserController::class);
    Route::delete('users/{id}', [UserController::class, 'destroy']);

    // Dashboard Stats
    Route::get('stats', [StatsController::class, 'getDashboardStats']);
    Route::get('charts', [StatsController::class, 'getChartData']);

    // Current User
    Route::get('auth/me', function (Request $request) {
        return $request->user();
    });
});

Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/register', [AuthController::class, 'register']);
```

### 2. Create User Controller

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Get all users
     */
    public function index(): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'role', 'subscription', 'created_at', 'status')
            ->latest()
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $users,
            'message' => 'Users retrieved successfully'
        ]);
    }

    /**
     * Create a new user
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'role' => 'required|in:admin,manager,user',
            'subscription' => 'required|in:free,premium,enterprise',
        ]);

        $user = User::create([
            ...$validated,
            'password' => bcrypt('default_password'),
            'status' => 'active'
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $user,
            'message' => 'User created successfully'
        ], 201);
    }

    /**
     * Get single user
     */
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $user,
            'message' => 'User retrieved successfully'
        ]);
    }

    /**
     * Update user
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role' => 'sometimes|in:admin,manager,user',
            'subscription' => 'sometimes|in:free,premium,enterprise',
            'status' => 'sometimes|in:active,inactive'
        ]);

        $user->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => $user,
            'message' => 'User updated successfully'
        ]);
    }

    /**
     * Delete user
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully'
        ]);
    }
}
```

### 3. Create Stats Controller

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getDashboardStats()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'total_users' => User::count(),
                'active_users' => User::where('status', 'active')->count(),
                'premium_users' => User::where('subscription', 'premium')->count(),
                'monthly_revenue' => 42580,
                'conversion_rate' => 3.8,
                'new_users_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
            ]
        ]);
    }

    /**
     * Get chart data
     */
    public function getChartData()
    {
        $monthlyRevenue = DB::table('orders')
            ->select(DB::raw('DATE_FORMAT(created_at, "%b") as month'), DB::raw('SUM(amount) as revenue'))
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->latest('created_at')
            ->limit(12)
            ->get();

        $subscriptionBreakdown = User::select('subscription', DB::raw('count(*) as count'))
            ->groupBy('subscription')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'revenue' => $monthlyRevenue,
                'subscription' => $subscriptionBreakdown,
            ]
        ]);
    }
}
```

### 4. CORS Configuration (config/cors.php)

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'https://yourdomain.com'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## React Frontend Integration

### 1. Environment Setup (.env)

```
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
```

### 2. API Client Setup (api/client.js)

```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

export const apiClient = {
    async request(method, endpoint, data = null) {
        const token = localStorage.getItem("auth_token");
        const headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
            signal: AbortSignal.timeout(API_TIMEOUT),
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (!response.ok) {
            if (response.status === 401) {
                // Handle unauthorized
                localStorage.removeItem("auth_token");
                window.location.href = "/login";
            }
            throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
    },

    get(endpoint) {
        return this.request("GET", endpoint);
    },

    post(endpoint, data) {
        return this.request("POST", endpoint, data);
    },

    put(endpoint, data) {
        return this.request("PUT", endpoint, data);
    },

    delete(endpoint) {
        return this.request("DELETE", endpoint);
    },
};
```

### 3. Updated useApi Hook (hooks/useApi.js)

```javascript
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";

export const useFetch = (endpoint) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await apiClient.get(endpoint);
            setData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

export const useUsers = () => {
    return useFetch("/api/users");
};

export const useDashboardStats = () => {
    return useFetch("/api/stats");
};
```

### 4. Updated UserTable with Real API (components/UserTable.jsx)

```javascript
import React, { useState, useEffect } from "react";
import { useUsers } from "../hooks/useApi";
import { TableSkeleton, TableRowSkeleton } from "./Skeletons";
import { DataLoadingError } from "./ErrorBoundary";

export const UserTable = ({ onEdit, onDelete, onView }) => {
    const { users, loading, error, refetch } = useUsers();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        if (users) {
            const filtered = users.filter(
                (user) =>
                    user.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
            setCurrentPage(1);
        }
    }, [users, searchTerm]);

    if (loading) return <TableSkeleton />;
    if (error) return <DataLoadingError error={error} onRetry={refetch} />;

    const itemsPerPage = 10;
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Search Bar */}
            <div className="p-6 border-b border-slate-200">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
            </div>

            {/* Table */}
            <table className="w-full">
                <tbody>
                    {paginatedUsers.map((user) => (
                        <tr
                            key={user.id}
                            className="border-b hover:bg-slate-50"
                        >
                            <td className="px-6 py-4">{user.name}</td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4">
                                <StatusBadge status={user.status} />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    <ActionButton
                                        action="view"
                                        onClick={() => onView(user)}
                                    />
                                    <ActionButton
                                        action="edit"
                                        onClick={() => onEdit(user)}
                                    />
                                    <ActionButton
                                        action="delete"
                                        onClick={() => onDelete(user.id)}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="p-6 border-t flex justify-between items-center">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};
```

### 5. Complete Dashboard with API (pages/Dashboard.jsx)

```javascript
import React, { useState } from "react";
import { useDashboardStats } from "../hooks/useApi";
import { DashboardSkeleton } from "../components/Skeletons";
import StatCard from "../components/StatCard";
import { Users, TrendingUp, DollarSign, Activity } from "lucide-react";

export const Dashboard = () => {
    const { data: stats, loading, error } = useDashboardStats();

    if (loading) return <DashboardSkeleton />;
    if (error) return <div>Error loading dashboard</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    label="Total Users"
                    value={stats?.total_users || 0}
                    trend="up"
                    trendValue="+12.5%"
                />
                <StatCard
                    icon={Activity}
                    label="Active Users"
                    value={stats?.active_users || 0}
                    trend="up"
                    trendValue="+8.2%"
                />
                <StatCard
                    icon={DollarSign}
                    label="Monthly Revenue"
                    value={`₱${stats?.monthly_revenue || 0}`}
                    trend="up"
                    trendValue="+5.1%"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Conversion Rate"
                    value={`${stats?.conversion_rate || 0}%`}
                    trend="down"
                    trendValue="-2.3%"
                />
            </div>
        </div>
    );
};
```

## Error Handling

### 1. API Error Response Format

```javascript
// Success Response
{
  "status": "success",
  "data": { /* user object */ },
  "message": "User created successfully"
}

// Error Response
{
  "status": "error",
  "errors": {
    "email": ["Email already exists"],
    "name": ["Name is required"]
  },
  "message": "Validation failed"
}
```

### 2. Handle Validation Errors in Form

```javascript
const handleSubmit = async (formData) => {
    try {
        await createUser(formData);
    } catch (error) {
        // Parse Laravel validation errors
        const errors = error.response?.data?.errors || {};
        setFormErrors(errors);
    }
};
```

## Authentication

### 1. Login & Token Storage

```javascript
export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useCallback(async (email, password) => {
        try {
            setLoading(true);
            const response = await apiClient.post("/api/auth/login", {
                email,
                password,
            });
            localStorage.setItem("auth_token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { login, loading, error };
};
```

### 2. Protected Routes

```javascript
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
        return <Navigate to="/login" />;
    }

    return children;
};

// Usage in App.jsx
<Route
    path="/admin/*"
    element={
        <ProtectedRoute>
            <AdminLayout />
        </ProtectedRoute>
    }
/>;
```

## Deployment Checklist

-   [ ] Configure CORS on Laravel backend
-   [ ] Set up API routes and controllers
-   [ ] Update React .env with production API URL
-   [ ] Test all CRUD operations
-   [ ] Implement authentication/authorization
-   [ ] Add error handling
-   [ ] Test loading states with skeletons
-   [ ] Verify pagination works correctly
-   [ ] Test search and filters
-   [ ] Optimize API calls (pagination, filtering)

---

For more information, refer to [Laravel API Documentation](https://laravel.com/docs) and [React Documentation](https://react.dev)
