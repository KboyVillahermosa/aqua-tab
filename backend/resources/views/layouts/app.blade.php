<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>@yield('title', 'AQUATAB ADMIN')</title>

  {{-- Tailwind CDN for quick admin styling (no npm required) --}}
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            aqua: '#1E3A8A',
            'aqua-light': '#3B82F6',
            slate: {
              50: '#f8fafc',
              100: '#f1f5f9',
              200: '#e2e8f0',
              300: '#cbd5e1',
              400: '#94a3b8',
              500: '#64748b',
              600: '#475569',
              700: '#334155',
              800: '#1e293b',
              900: '#0f172a'
            }
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif']
          }
        }
      }
    }
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

  <style>
    * {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    /* Modern card component */
    .card {
      @apply bg-white rounded-2xl shadow-sm border border-slate-100;
    }

    /* Color utilities */
    .text-aqua {
      color: #1E3A8A;
    }

    .bg-aqua {
      background: linear-gradient(90deg, #1E3A8A, #3B82F6);
      color: #fff;
    }

    /* Smooth transitions */
    * {
      @apply transition-colors duration-200;
    }
  </style>
</head>

<body class="min-h-screen bg-slate-50 text-slate-900" x-data="{ sidebarOpen: false, collapsed: false }">
  <div class="min-h-screen flex flex-col lg:flex-row">
    {{-- Sidebar --}}
    <div
      :class="{ 'block': sidebarOpen, 'hidden': !sidebarOpen }"
      class="hidden lg:block flex-shrink-0 bg-slate-900 text-white overflow-y-auto fixed lg:sticky lg:top-0 lg:h-screen z-50 lg:z-0 shadow-lg lg:shadow-none transition-all duration-300"
      :style="`width: ${collapsed ? '5rem' : '16rem'}`"
      x-transition>
      @include('layouts.sidebar')
    </div>

    {{-- Mobile overlay --}}
    <div
      x-show="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 bg-black/50 lg:hidden z-40"
      x-transition></div>

    {{-- Main content area --}}
    <div class="flex-1 flex flex-col transition-all duration-300"
      :class="collapsed ? 'lg:ml-0' : 'lg:ml-0'">
      {{-- Header --}}
      <div class="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm lg:shadow-none">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {{-- Mobile hamburger --}}
          <button
            @click="sidebarOpen = true"
            class="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle sidebar">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          {{-- Empty spacer for layout --}}
          <div></div>
        </div>
      </div>

      {{-- Main content --}}
      <main class="flex-1 overflow-y-auto">
        @yield('content')
      </main>
    </div>
  </div>

  {{-- Alpine.js for interactivity (CDN) --}}
  <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

  {{-- Stack for page-specific scripts --}}
  @stack('scripts')
</body>

</html>