/\*\*

-   SETUP & INSTALLATION GUIDE
-   Complete React + Tailwind CSS Admin Dashboard
    \*/

# AQUATAB Admin Dashboard - Complete Setup Guide

## 📋 Prerequisites

-   Node.js 16.x or higher
-   npm or yarn package manager
-   React 18.x
-   Tailwind CSS 3.x
-   React Router v6

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
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

html {
    scroll-behavior: smooth;
}

body {
    @apply bg-slate-50 text-slate-900 font-sans;
}

* {
    @apply transition-all duration-200;
}
```

### 3. Project Structure

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
│   └── UserTable.jsx
├── pages/
│   ├── Dashboard.jsx
│   └── UserManagement.jsx
├── theme.js
├── App.jsx
├── index.css
└── main.jsx
```

### 4. main.jsx Setup

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

### 5. Vite Configuration (vite.config.js)

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

## 📦 Component Overview

### Core Components

1. **Sidebar** - Navigation with collapsible menu
2. **Topbar** - Search bar, notifications, user profile
3. **StatCard** - Reusable stat display card with trends
4. **BalanceCard** - Large card with balance/investment display
5. **ChartCard** - Wrapper for chart components
6. **StatusBadge** - Status indicator with color variants
7. **ActionButton** - Icon-based action buttons for tables
8. **UserTable** - Full-featured user management table

### Page Components

1. **Dashboard** - Main dashboard with all stats and charts
2. **UserManagement** - User management page with filters and table

## 🎨 Design System

### Color Palette

-   **Primary Blue**: Used for primary actions, active states
-   **Slate Gray**: Used for text, backgrounds, neutral elements
-   **Teal**: Used for secondary actions and accents
-   **Status Colors**: Green (success), Red (error), Yellow (warning)

### Typography

-   **Headings**: Bold, dark slate (text-slate-900)
-   **Body Text**: Regular weight, medium gray (text-slate-600)
-   **Labels**: Small, uppercase, slate-500
-   **Font**: Inter or system fonts

### Spacing & Layout

-   **Card Padding**: p-6 (1.5rem)
-   **Gap Between Cards**: gap-6 (1.5rem)
-   **Border Radius**: rounded-2xl (2rem)
-   **Shadows**: Subtle soft shadows (shadow-sm, shadow-md)

## 🔌 API Integration

Replace mock data with API calls:

### Example: Fetch Users

```javascript
// In UserTable.jsx
useEffect(() => {
    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/users");
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
    fetchUsers();
}, []);
```

### Example: Delete User

```javascript
const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure?")) {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                // Refresh user list
                setUsers(users.filter((u) => u.id !== userId));
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }
};
```

## 📱 Responsive Design

All components are built with responsive design:

-   **Mobile**: Single column layouts
-   **Tablet**: Two column grids
-   **Desktop**: Four column grids for stats

```javascript
// Example responsive grid
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6";
```

## 🎭 Customization

### Change Primary Color

Update in `tailwind.config.js`:

```javascript
colors: {
  blue: {
    600: '#your-color-hex',
  }
}
```

### Add New Status Badge

In `StatusBadge.jsx`:

```javascript
const statusConfigs = {
    // ... existing
    newStatus: {
        bg: "bg-pink-50",
        text: "text-pink-700",
        dot: "bg-pink-400",
    },
};
```

### Add New Action Button

In `ActionButton.jsx`:

```javascript
const actionConfigs = {
    // ... existing
    newAction: {
        icon: YourIcon,
        color: "text-custom-600 hover:bg-custom-50",
        tooltip: "Action Name",
    },
};
```

## 🚀 Performance Optimization

1. **Lazy Load Routes** - Use React.lazy() for page components
2. **Memoization** - Use React.memo() for frequently rendered components
3. **Virtualization** - Use react-window for large lists
4. **Image Optimization** - Use next/image or similar optimization
5. **Bundle Size** - Tree shake unused components

### Example: Lazy Loading

```javascript
const Dashboard = React.lazy(() => import("./Dashboard"));
const UserManagement = React.lazy(() => import("./UserManagement"));

<Suspense fallback={<LoadingSpinner />}>
    <Route path="/dashboard" element={<Dashboard />} />
</Suspense>;
```

## 🧪 Testing

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Example test:

```javascript
import { render, screen } from "@testing-library/react";
import StatCard from "./StatCard";

test("renders stat card with correct value", () => {
    render(<StatCard label="Test" value={100} />);
    expect(screen.getByText("100")).toBeInTheDocument();
});
```

## 📦 Building for Production

```bash
npm run build
```

This creates an optimized production build in `dist/` directory.

## 🐛 Troubleshooting

### Tailwind styles not applied

1. Ensure content paths in `tailwind.config.js` are correct
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Restart dev server

### Components not rendering

1. Ensure all imports are correct
2. Check React version compatibility
3. Verify component exports

### Performance issues

1. Profile with React DevTools
2. Check for unnecessary re-renders
3. Implement useMemo() for expensive operations

## 📚 Resources

-   [Tailwind CSS Docs](https://tailwindcss.com)
-   [React Docs](https://react.dev)
-   [Lucide Icons](https://lucide.dev)
-   [React Router Docs](https://reactrouter.com)

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Maintained by**: AQUATAB Team
