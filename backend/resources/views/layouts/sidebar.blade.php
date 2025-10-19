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

            <a href="{{ route('admin.hydration.index') }}" class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium {{ request()->is('admin/hydration*') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100' }}">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>
                Hydration
            </a>

            <a href="{{ route('admin.medication.index') }}" class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium {{ request()->is('admin/medication*') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100' }}">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 14H9c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z" fill="currentColor"/></svg>
                Medication
            </a>

            <a href="{{ route('admin.notifications.index') }}" class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium {{ request()->is('admin/notifications*') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100' }}">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/></svg>
                Notifications
            </a>
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
            <a href="{{ route('admin.hydration.index') }}" @click="open = false" class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium {{ request()->is('admin/hydration*') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100' }}">Hydration</a>
            <a href="{{ route('admin.medication.index') }}" @click="open = false" class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium {{ request()->is('admin/medication*') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100' }}">Medication</a>
            <a href="{{ route('admin.notifications.index') }}" @click="open = false" class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium {{ request()->is('admin/notifications*') ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100' }}">Notifications</a>
        </nav>
        <div class="mt-8">
            <form method="POST" action="{{ route('admin.logout') }}">
                @csrf
                <button type="submit" class="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-gray-50">Logout</button>
            </form>
        </div>
    </div>
</aside>
