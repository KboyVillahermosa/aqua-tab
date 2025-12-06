/\*\*

-   SETUP & INSTALLATION GUIDE - UPDATED
-   Complete React + Tailwind CSS Admin Dashboard with Charts & Forms
    \*/

# AQUATAB Admin Dashboard - Complete Setup Guide (v2)

## 📋 Prerequisites

-   Node.js 16.x or higher
-   npm or yarn package manager
-   React 18.x
-   Tailwind CSS 3.x
-   React Router v6
-   Recharts for data visualization

## 🚀 Installation Steps

### 1. Install Required Dependencies

```bash
npm install react-router-dom lucide-react recharts classnames
npm install -D tailwindcss postcss autoprefixer
```

### 2. Tailwind CSS Configuration

#### Create `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                blue: {
                    50: "#f0f9ff",
                    100: "#e0f2fe",
                    500: "#0ea5e9",
                    600: "#0284c7",
                    700: "#0369a1",
                    900: "#0c2d57",
                },
                slate: {
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0",
                    300: "#cbd5e1",
                    500: "#64748b",
                    600: "#475569",
                    700: "#334155",
                    900: "#0f172a",
                },
                teal: {
                    50: "#f0fdfa",
                    100: "#ccfbf1",
                    500: "#14b8a6",
                    600: "#0d9488",
                    700: "#0f766e",
                },
            },
            fontFamily: {
                sans: [
                    "Inter",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "sans-serif",
                ],
                mono: ['"JetBrains Mono"', "monospace"],
            },
            boxShadow: {
                sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            },
            borderRadius: {
                "2xl": "2rem",
            },
        },
    },
    plugins: [],
};
```

#### Create `postcss.config.js`:

```javascript
export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
```

#### Create `index.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

html {
    scroll-behavior: smooth;
}

body {
    @apply bg-slate-50 text-slate-900 font-sans;
}

* {
    @apply transition-all duration-200;
}

/* Utility classes */
@layer components {
    .btn-primary {
        @apply bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed;
    }

    .btn-secondary {
        @apply bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed;
    }

    .card {
        @apply bg-white rounded-2xl border border-slate-100 shadow-sm;
    }

    .card-hover {
        @apply card hover:shadow-md hover:-translate-y-1 cursor-pointer;
    }
}
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx
│   ├── Topbar.jsx
│   ├── StatCard.jsx
│   ├── BalanceCard.jsx
│   ├── ChartCard.jsx
│   ├── StatusBadge.jsx
│   ├── ActionButton.jsx
│   ├── UserTable.jsx
│   ├── UserForm.jsx
│   ├── Charts.jsx
│   ├── Skeletons.jsx
│   └── ErrorBoundary.jsx
├── hooks/
│   └── useApi.js
├── pages/
│   ├── Dashboard.jsx
│   └── UserManagement.jsx
├── theme.js
├── App.jsx
├── index.css
└── main.jsx
```

## 🔧 Component Overview

### UI Components (Reusable Building Blocks)

| Component        | Purpose                        | Props                                   |
| ---------------- | ------------------------------ | --------------------------------------- |
| **Sidebar**      | Main navigation menu           | activeMenu, onMenuChange, onLogout      |
| **Topbar**       | Header with search and profile | onSearch, notifications                 |
| **StatCard**     | Display KPI statistics         | icon, label, value, trend, iconBgColor  |
| **BalanceCard**  | Large balance/total cards      | title, amount, trend, accentColor       |
| **ChartCard**    | Wrapper for charts             | title, description, onRefresh, children |
| **StatusBadge**  | Status indicator               | status (active, inactive, pending, etc) |
| **ActionButton** | Table row actions              | action (view, edit, delete), onClick    |
| **UserTable**    | Full user management table     | users, onEdit, onDelete, onView         |

### Data Visualization Components

| Component                 | Purpose               | Data Format                    |
| ------------------------- | --------------------- | ------------------------------ |
| **RevenueChart**          | Line chart for trends | Array of {month, revenue}      |
| **UserDistributionChart** | Stacked bar chart     | Array of {name, premium, free} |
| **SubscriptionChart**     | Pie chart breakdown   | Array of {name, value}         |

### Form Components

| Component         | Purpose                          | Props                                  |
| ----------------- | -------------------------------- | -------------------------------------- |
| **UserForm**      | Reusable user creation/edit form | initialData, onSubmit, onCancel        |
| **UserFormModal** | Modal wrapper for UserForm       | isOpen, initialData, onSubmit, onClose |
| **FormField**     | Text input component             | label, value, onChange, error          |
| **SelectField**   | Dropdown component               | label, value, onChange, options        |

### Utility Components

| Component         | Purpose                    | Usage                                   |
| ----------------- | -------------------------- | --------------------------------------- |
| **Skeletons**     | Loading state placeholders | TableRowSkeleton, StatCardSkeleton, etc |
| **ErrorBoundary** | React error catching       | Wrap components to catch errors         |
| **ErrorAlert**    | Inline error messages      | Display validation/API errors           |

### Custom Hooks

| Hook                  | Purpose                        | Returns                          |
| --------------------- | ------------------------------ | -------------------------------- |
| **useFetch**          | GET request with loading/error | {data, loading, error, refetch}  |
| **useApiMutation**    | POST/PUT/DELETE requests       | {execute, loading, error, data}  |
| **useUsers**          | Fetch users from /api/users    | {users, loading, error, refetch} |
| **useDashboardStats** | Fetch stats from /api/stats    | {stats, loading, error, refetch} |
| **useDeleteUser**     | Delete user mutation           | {deleteUser, loading, error}     |
| **useCreateUser**     | Create user mutation           | {createUser, loading, error}     |
| **useUpdateUser**     | Update user mutation           | {updateUser, loading, error}     |

## 📋 Page Setup

### main.jsx

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

### vite.config.js

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            "/api": {
                target: "http://localhost:8000",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, "/api"),
            },
        },
    },
});
```

## 🎨 Design System

### Color Palette

```javascript
// Primary Colors
blue-500: #0ea5e9    // Primary action
blue-600: #0284c7    // Hover state
blue-900: #0c2d57    // Dark variant

// Neutral Colors
slate-50: #f8fafc    // Lightest background
slate-100: #f1f5f9   // Light background
slate-500: #64748b   // Text secondary
slate-900: #0f172a   // Text primary

// Secondary Colors
teal-500: #14b8a6    // Secondary action
teal-700: #0f766e    // Secondary hover

// Status Colors
green-500: #22c55e   // Success/Active
red-500: #ef4444     // Error/Danger
yellow-500: #eab308  // Warning
purple-500: #a855f7  // Premium
```

### Spacing Scale

```
xs: 0.25rem (4px)
sm: 0.5rem  (8px)
md: 1rem    (16px)
lg: 1.5rem  (24px)
xl: 2rem    (32px)
2xl: 3rem   (48px)
```

### Typography

```
Body Font: Inter (sans-serif)
Mono Font: JetBrains Mono

Sizes:
- xs: 12px (900)
- sm: 14px (600)
- base: 16px (500)
- lg: 18px (600)
- xl: 20px (700)
- 2xl: 24px (800)
- 3xl: 30px (800)
```

## 🔌 API Integration

### Backend Endpoints Required

```
GET    /api/users              - Fetch all users
GET    /api/users/{id}         - Fetch single user
POST   /api/users              - Create user
PUT    /api/users/{id}         - Update user
DELETE /api/users/{id}         - Delete user

GET    /api/stats              - Dashboard statistics
GET    /api/charts             - Chart data

POST   /api/auth/login         - User login
POST   /api/auth/logout        - User logout
GET    /api/auth/me            - Current user
```

### Example: Integrating useUsers Hook

```javascript
import { useUsers } from "./hooks/useApi";
import { TableSkeleton } from "./components/Skeletons";
import { DataLoadingError } from "./components/ErrorBoundary";

export const UserManagement = () => {
    const { users, loading, error, refetch } = useUsers();

    if (loading) return <TableSkeleton />;
    if (error) return <DataLoadingError error={error} onRetry={refetch} />;

    return <UserTable users={users || []} />;
};
```

### Example: Integrating useCreateUser Hook

```javascript
import { useCreateUser } from "./hooks/useApi";
import { UserFormModal } from "./components/UserForm";

export const Dashboard = () => {
    const [showForm, setShowForm] = useState(false);
    const { createUser, loading, error } = useCreateUser();

    const handleAddUser = async (formData) => {
        try {
            await createUser(formData);
            setShowForm(false);
            refetchUsers(); // Refresh user list
        } catch (err) {
            console.error("Failed to create user:", err);
        }
    };

    return (
        <>
            <UserFormModal
                isOpen={showForm}
                onSubmit={handleAddUser}
                onClose={() => setShowForm(false)}
                isLoading={loading}
            />
        </>
    );
};
```

### Example: Integrating Charts

```javascript
import { RevenueChart, UserDistributionChart } from "./components/Charts";

export const Dashboard = () => {
    const { chartData, loading } = useChartData();

    if (loading) return <ChartSkeleton />;

    return (
        <ChartCard title="Revenue Trend">
            <RevenueChart data={chartData?.revenue} />
        </ChartCard>
    );
};
```

## 🎯 Best Practices

### 1. Error Handling

```javascript
// Use ErrorBoundary to catch component errors
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Use ErrorAlert for form validation
<ErrorAlert message="Email is invalid" onDismiss={() => setError(null)} />
```

### 2. Loading States

```javascript
// Use Skeleton components
import { TableSkeleton, DashboardSkeleton } from "./components/Skeletons";

if (loading) return <DashboardSkeleton />;
```

### 3. Form Validation

```javascript
// UserForm component includes built-in validation
<UserForm
    initialData={userData}
    onSubmit={handleSubmit}
    onCancel={handleCancel}
/>
```

### 4. Responsive Design

```css
/* Mobile first approach */
.grid-cols-1          /* 1 column on mobile */
.md:grid-cols-2       /* 2 columns on tablet */
.lg:grid-cols-4       /* 4 columns on desktop */
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Create `.env` file:

```
VITE_API_URL=https://api.aquatab.com
VITE_APP_NAME=AQUATAB Admin
```

### Docker Deployment

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📚 Resources

-   [Tailwind CSS Docs](https://tailwindcss.com/docs)
-   [React Router Docs](https://reactrouter.com/)
-   [Lucide React Icons](https://lucide.dev/)
-   [Recharts Docs](https://recharts.org/)
-   [Vite Documentation](https://vitejs.dev/)

## 🆘 Troubleshooting

### Issue: Chart not displaying

-   Ensure Recharts is installed: `npm install recharts`
-   Check data format matches expected structure
-   Verify ResponsiveContainer parent has height

### Issue: Styles not applying

-   Clear Tailwind cache: `rm -rf .next` (if using Next.js)
-   Rebuild: `npm run dev`
-   Ensure paths in `tailwind.config.js` are correct

### Issue: API errors

-   Check CORS configuration on backend
-   Verify proxy settings in `vite.config.js`
-   Log network requests in browser DevTools

### Issue: Form submission fails

-   Check form validation errors
-   Verify API endpoint exists
-   Check request payload format
-   Enable CORS on backend

## 📝 File Checksums & Sizes

-   Sidebar.jsx: ~71 lines
-   Topbar.jsx: ~59 lines
-   StatCard.jsx: ~56 lines
-   BalanceCard.jsx: ~70 lines
-   ChartCard.jsx: ~35 lines
-   StatusBadge.jsx: ~39 lines
-   ActionButton.jsx: ~35 lines
-   UserTable.jsx: ~320 lines
-   Charts.jsx: ~190 lines (Recharts integration)
-   Skeletons.jsx: ~170 lines (Loading placeholders)
-   UserForm.jsx: ~240 lines (Form + Modal)
-   ErrorBoundary.jsx: ~100 lines (Error handling)
-   useApi.js: ~160 lines (Custom hooks)
-   Dashboard.jsx: ~180 lines
-   UserManagement.jsx: ~120 lines
-   App.jsx: ~30 lines
-   theme.js: ~37 lines

**Total: ~1,650 lines of production-ready code**

## 🎉 Next Steps

1. ✅ Install dependencies
2. ✅ Set up Tailwind configuration
3. ✅ Create project structure
4. ✅ Copy component files
5. 🔄 Configure API endpoints
6. 🔄 Integrate with backend
7. 🔄 Add authentication
8. 🔄 Deploy to production

---

Generated for AQUATAB Project | Last Updated: 2025
