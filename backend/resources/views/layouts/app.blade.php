<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>@yield('title', 'Aqua Admin')</title>

  {{-- Tailwind CDN for quick admin styling (no npm required) --}}
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            aqua: '#1E3A8A',
            'aqua-light': '#3B82F6'
          }
        }
      }
    }
  </script>
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    /* Small helpers to keep original look */
    .card {
      @apply bg-white rounded-lg shadow-sm border border-gray-200;
    }

    /* Fallbacks when Tailwind CDN is not available */
    .text-aqua {
      color: #1E3A8A;
    }

    .bg-aqua {
      background: linear-gradient(90deg, #1E3A8A, #3B82F6);
      color: #fff;
    }
  </style>
</head>

<body class="min-h-screen bg-gray-50 text-gray-800">
  <div x-data="{ open: false }" class="min-h-screen flex">
    {{-- Sidebar (hidden on small, toggled with open) --}}
    <div :class="open ? 'block' : 'hidden'" class="lg:block">
      @include('layouts.sidebar')
    </div>

    {{-- Main content area --}}
    <div class="flex-1">
      {{-- Mobile header with hamburger --}}
      <div class="lg:hidden bg-white border-b">
        <div class="flex items-center justify-between p-3">
          <button @click="open = !open" class="p-2 rounded-md text-gray-600">
            <!-- simple hamburger -->
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <div class="text-lg font-semibold">@yield('title', 'Aqua Admin')</div>
          <div></div>
        </div>
      </div>

      <main class="p-4 lg:p-10 lg:pl-8">
        @yield('content')
      </main>
    </div>
  </div>

  {{-- Alpine.js for simple toggle (CDN) --}}
  <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
  
  {{-- Stack for page-specific scripts --}}
  @stack('scripts')
</body>

</html>