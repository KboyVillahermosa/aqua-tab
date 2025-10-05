<aside class="hidden lg:block w-72 bg-white border-r border-gray-200 min-h-screen sticky top-0">
    <div class="p-6">
        <div class="mb-6">
            <h2 class="text-xl font-bold text-aqua">Aqua Admin</h2>
            <p class="text-sm text-gray-500">Health Management</p>
        </div>

        <nav class="space-y-2">
            <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium {{ request()->routeIs('admin.dashboard') ? 'bg-aqua text-white' : 'text-gray-700 hover:bg-gray-100' }}">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM3 21h8v-6H3v6zM13 11h8V3h-8v8z" fill="currentColor"/></svg>
                Dashboard
            </a>

            <a href="{{ route('admin.users.index') }}" class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium {{ request()->is('admin/users*') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100' }}">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM6 20v-1c0-2.76 3.58-4 6-4s6 1.24 6 4v1H6z" fill="currentColor"/></svg>
                Users
            </a>

            <!-- add more links here -->
        </nav>

        <div class="mt-8">
            <form method="POST" action="{{ route('admin.logout') }}">
                @csrf
                <button type="submit" class="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-gray-50">Logout</button>
            </form>
        </div>
    </div>
</aside>

{{-- Mobile sidebar (slide-in) --}}
<aside x-show="open" @click.away="open = false" class="lg:hidden fixed inset-0 z-40">
    <div class="absolute inset-0 bg-black opacity-30"></div>
    <div class="relative bg-white w-64 h-full border-r p-6">
        <div class="mb-6">
            <h2 class="text-xl font-bold text-aqua">Aqua Admin</h2>
            <p class="text-sm text-gray-500">Health Management</p>
        </div>
        <nav class="space-y-2">
            <a href="{{ route('admin.dashboard') }}" @click="open = false" class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium {{ request()->routeIs('admin.dashboard') ? 'bg-aqua text-white' : 'text-gray-700 hover:bg-gray-100' }}">Dashboard</a>
            <a href="{{ route('admin.users.index') }}" @click="open = false" class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium {{ request()->is('admin/users*') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100' }}">Users</a>
        </nav>
        <div class="mt-8">
            <form method="POST" action="{{ route('admin.logout') }}">
                @csrf
                <button type="submit" class="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-gray-50">Logout</button>
            </form>
        </div>
    </div>
</aside>
