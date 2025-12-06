# 🎨 Design System & Component Reference

**For Integration into Laravel Blade Templates**

---

## 📐 Color Palette

### Primary Colors

```css
/* AQUA Blue (Primary) */
--aqua: #1E3A8A (bg-blue-900, text-blue-900)
--aqua-light: #3B82F6 (bg-blue-600, text-blue-600)

/* From Tailwind */
--blue-50: #eff6ff
--blue-100: #dbeafe
--blue-200: #bfdbfe
--blue-300: #93c5fd
--blue-400: #60a5fa
--blue-500: #3b82f6
--blue-600: #2563eb
--blue-700: #1d4ed8
--blue-900: #1e3a8a
```

### Neutral Colors (Slate Palette)

```css
--slate-50: #f8fafc   /* Lightest backgrounds */
--slate-100: #f1f5f9  /* Light backgrounds */
--slate-200: #e2e8f0  /* Borders */
--slate-300: #cbd5e1
--slate-400: #94a3b8
--slate-500: #64748b  /* Text muted */
--slate-600: #475569  /* Text secondary */
--slate-700: #334155
--slate-800: #1e293b
--slate-900: #0f172a  /* Dark backgrounds (sidebar) */
```

### Status Colors

```css
--green-50: #f0fdf4
--green-600: #16a34a
--green-700: #15803d

--red-50: #fef2f2
--red-600: #dc2626

--amber-50: #fffbeb
--amber-600: #d97706

--purple-50: #faf5ff
--purple-600: #9333ea
```

---

## 🔤 Typography

### Font Family

```css
font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
```

### Heading Sizes

```css
/* Page Titles */
h1 {
  font-size: 30px; /* text-3xl */
  font-weight: 700; /* font-bold */
  line-height: 1.25;
  color: #0f172a; /* text-slate-900 */
}

/* Section Titles */
h2,
h3 {
  font-size: 18px; /* text-lg */
  font-weight: 600; /* font-semibold */
  color: #0f172a;
}

/* Form Labels */
label {
  font-size: 14px; /* text-sm */
  font-weight: 600; /* font-semibold */
  color: #0f172a;
  margin-bottom: 8px; /* mb-2 */
}

/* Body Text */
p,
a {
  font-size: 14px; /* text-sm */
  font-weight: 400;
  color: #475569; /* text-slate-600 */
}
```

---

## 📏 Spacing System

### Base Unit: 4px (Tailwind)

```css
/* Padding */
p-1: 4px
p-2: 8px
p-3: 12px
p-4: 16px
p-6: 24px
p-8: 32px

/* Margins */
m-1: 4px
m-2: 8px
m-3: 12px
m-4: 16px
m-6: 24px
m-8: 32px
mb-2: 8px (margin-bottom)
mb-4: 16px
mb-6: 24px
mb-8: 32px

/* Gaps (Flexbox) */
gap-1: 4px
gap-2: 8px
gap-3: 12px
gap-4: 16px
gap-6: 24px
```

---

## 🎴 Component Patterns

### 1. Page Header

```blade
<div class="mb-8">
    <div class="flex items-center gap-3 mb-4">
        <a href="#" class="text-slate-500 hover:text-slate-700 font-medium">Back</a>
        <span class="text-slate-400">/</span>
        <span class="text-slate-900 font-medium">Current Page</span>
    </div>
    <h1 class="text-3xl font-bold text-slate-900">Page Title</h1>
    <p class="text-slate-500 mt-2">Brief description</p>
</div>
```

### 2. Stat Card

```blade
<div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
    <div class="flex items-center gap-4">
        <div class="p-3 bg-blue-50 rounded-lg">
            <svg class="w-6 h-6 text-blue-600"><!-- Icon --></svg>
        </div>
        <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Label</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">123</p>
        </div>
    </div>
</div>
```

### 3. Card Container

```blade
<div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-8 py-8 border-b border-slate-100 bg-slate-50">
        <h3 class="text-lg font-semibold text-slate-900">Card Title</h3>
    </div>
    <!-- Content -->
    <div class="px-8 py-8">
        <!-- Content goes here -->
    </div>
</div>
```

### 4. Form Input

```blade
<div>
    <label for="fieldname" class="block text-sm font-semibold text-slate-900 mb-2">
        Label <span class="text-red-600">*</span>
    </label>
    <input
        type="text"
        id="fieldname"
        name="fieldname"
        placeholder="Placeholder text"
        class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
    >
    @error('fieldname')
        <p class="mt-1.5 text-sm text-red-600">{{ $message }}</p>
    @enderror
</div>
```

### 5. Badge / Pill

```blade
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
    <span class="w-2 h-2 rounded-full bg-blue-400"></span>
    Badge Text
</span>
```

### 6. Button

```blade
<!-- Primary Button -->
<button type="submit" class="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors shadow-sm">
    Button Text
</button>

<!-- Secondary Button -->
<a href="#" class="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors">
    Cancel
</a>

<!-- Icon Button -->
<button class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
    <svg class="w-5 h-5"><!-- Icon --></svg>
</button>
```

### 7. Alert

```blade
<!-- Success Alert -->
<div class="p-4 bg-green-50 border border-green-200 rounded-lg">
    <div class="flex gap-3">
        <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"><!-- Icon --></svg>
        <div>
            <h3 class="font-semibold text-green-800">Success</h3>
            <p class="text-sm text-green-700 mt-0.5">Message text</p>
        </div>
    </div>
</div>

<!-- Error Alert -->
<div class="p-4 bg-red-50 border border-red-200 rounded-lg">
    <div class="flex gap-3">
        <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"><!-- Icon --></svg>
        <div>
            <h3 class="font-semibold text-red-800">Error</h3>
            <p class="text-sm text-red-700 mt-0.5">Message text</p>
        </div>
    </div>
</div>
```

### 8. Table

```blade
<div class="overflow-x-auto">
    <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Column</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 text-sm text-slate-900">Data</td>
            </tr>
        </tbody>
    </table>
</div>
```

### 9. Action Buttons (Group)

```blade
<div class="flex items-center gap-2">
    <a href="#" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        <svg class="w-5 h-5"><!-- View icon --></svg>
    </a>
    <a href="#" class="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
        <svg class="w-5 h-5"><!-- Edit icon --></svg>
    </a>
    <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
        <svg class="w-5 h-5"><!-- Delete icon --></svg>
    </button>
</div>
```

### 10. Tab Navigation

```blade
<div class="border-b border-slate-100">
    <div class="flex" role="tablist">
        <button onclick="showTab('tab1')" class="flex-1 md:flex-none px-6 py-4 text-sm font-semibold text-slate-600 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors active-tab">
            Tab 1
        </button>
        <button onclick="showTab('tab2')" class="flex-1 md:flex-none px-6 py-4 text-sm font-semibold text-slate-600 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors">
            Tab 2
        </button>
    </div>
</div>
```

---

## 📱 Responsive Classes

```css
/* Default = Mobile */
.hidden           /* hidden on all sizes */
.lg:hidden        /* hidden only on large screens */
.hidden lg:block  /* hidden on small, visible on large */

/* Grid Layouts */
.grid-cols-1      /* 1 column (mobile) */
.md:grid-cols-2   /* 2 columns on tablet */
.lg:grid-cols-4   /* 4 columns on desktop */

/* Flex Layouts */
.flex-col         /* Stack vertically (default) */
.md:flex-row      /* Side-by-side on tablet */
.lg:flex-row      /* Side-by-side on desktop */

/* Sizing */
.w-full           /* 100% width */
.max-w-2xl        /* Max width 42rem */
.max-w-7xl        /* Max width 80rem */

/* Padding */
.px-4             /* 16px horizontal */
.px-6 lg:px-8     /* 24px on mobile, 32px on desktop */
```

---

## ✨ Hover & Transition States

```css
/* Transitions */
.transition           /* smooth transition */
.transition-colors   /* smooth color transition */
.duration-200        /* 200ms duration */

/* Hover Effects */
.hover:bg-slate-50   /* Light background on hover */
.hover:text-slate-900 /* Darker text on hover */
.hover:shadow-md     /* More shadow on hover */
.hover:border-slate-300 /* Darker border on hover */

/* Focus States */
.focus:outline-none
.focus:ring-2
.focus:ring-blue-500
.focus:border-transparent

/* Active/Current States */
.active-tab          /* Custom class for active tab */
.bg-blue-600         /* Solid background for active */
.border-blue-500     /* Blue border for active */
.text-blue-600       /* Blue text for active */
```

---

## 🎯 Common Patterns

### Header with Actions

```blade
<div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
    <div>
        <h1 class="text-3xl font-bold text-slate-900">Title</h1>
        <p class="text-slate-500 mt-2">Description</p>
    </div>
    <div class="flex items-center gap-3 mt-6 md:mt-0">
        <button class="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
            <svg><!-- icon --></svg> Filter
        </button>
        <a href="#" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm">
            <svg><!-- icon --></svg> Add New
        </a>
    </div>
</div>
```

### Data Grid

```blade
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    @foreach($items as $item)
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
        <!-- Card content -->
    </div>
    @endforeach
</div>
```

### Form Row

```blade
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
        <label class="block text-sm font-semibold text-slate-900 mb-2">Field 1</label>
        <input type="text" class="w-full px-4 py-2.5 border border-slate-200 rounded-lg">
    </div>
    <div>
        <label class="block text-sm font-semibold text-slate-900 mb-2">Field 2</label>
        <input type="text" class="w-full px-4 py-2.5 border border-slate-200 rounded-lg">
    </div>
</div>
```

---

## 🔗 Implementation Checklist

When creating new Blade templates, ensure:

- [ ] Use slate color palette for consistency
- [ ] Apply rounded-2xl to main cards
- [ ] Use shadow-sm for cards, shadow-md for hover
- [ ] Add border border-slate-100 to cards
- [ ] Use text-3xl font-bold for main titles
- [ ] Apply proper spacing (mb-6, mb-8, gap-6)
- [ ] Include hover effects on interactive elements
- [ ] Use focus:ring-2 focus:ring-blue-500 on inputs
- [ ] Apply responsive classes (md:, lg:)
- [ ] Use icon buttons for actions (p-2, text-color, hover:bg-color-50)
- [ ] Create proper error/success alerts with icons
- [ ] Maintain consistent typography hierarchy
- [ ] Test on mobile, tablet, and desktop

---

## 📚 Quick Reference

| Element       | Class                                                                                            | Example               |
| ------------- | ------------------------------------------------------------------------------------------------ | --------------------- |
| **Page**      | `min-h-screen bg-slate-50`                                                                       | Background            |
| **Container** | `max-w-7xl mx-auto px-6`                                                                         | Max width + centering |
| **Card**      | `bg-white rounded-2xl border border-slate-100 shadow-sm`                                         | Main card             |
| **Heading**   | `text-3xl font-bold text-slate-900`                                                              | Page title            |
| **Text**      | `text-slate-600 text-sm`                                                                         | Body text             |
| **Input**     | `px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500`                | Form input            |
| **Button**    | `px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700`                                | Primary button        |
| **Badge**     | `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700` | Status badge          |
| **Alert**     | `p-4 bg-red-50 border border-red-200 rounded-lg`                                                 | Error message         |
| **Table**     | `w-full border-collapse divide-y divide-slate-100`                                               | Data table            |

---

## 🎨 Color Usage Guide

```css
/* UI Elements */
.border-slate-100    /* Cards, sections */
.border-slate-200    /* Inputs, tables */
.bg-slate-50         /* Light backgrounds, headers */
.bg-slate-900        /* Dark backgrounds, sidebar */
.text-slate-600      /* Body text, secondary */
.text-slate-900      /* Headings, primary text */

/* Interactive */
.bg-blue-600         /* Buttons, active states */
.text-blue-600       /* Links, active menu items */
.hover:bg-blue-50    /* Hover backgrounds */

/* Status */
.bg-green-50         /* Success messages */
.text-green-600      /* Success text */
.bg-red-50           /* Error messages */
.text-red-600        /* Error text */
.bg-amber-50         /* Warning backgrounds */
.text-amber-600      /* Warning text */
```

---

**Last Updated:** Session 3 Integration  
**Version:** 1.0  
**Status:** Complete ✅
