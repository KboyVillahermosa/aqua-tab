<aside
    :class="collapsed ? 'w-20' : 'w-64'"
    class="hidden lg:flex flex-col bg-slate-900 border-r border-slate-800 min-h-screen sticky top-0 transition-all duration-300 ease-in-out shadow-xl z-30">
    <div class="flex items-center justify-between p-6 border-b border-slate-800">
        <div x-show="!collapsed" class="flex items-center gap-3 transition-opacity duration-200">
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg">
                A
            </div>
            <div>
                <h1 class="text-lg font-bold text-white tracking-tight">AQUATAB</h1>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Admin Panel</p>
            </div>
        </div>

        <button
            @click="collapsed = !collapsed"
            class="p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors focus:outline-none"
            :class="collapsed ? 'mx-auto' : ''">
            <svg
                class="w-5 h-5 transition-transform duration-300"
                :class="collapsed ? 'rotate-180' : ''"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    </div>

    <nav class="flex-1 px-3 py-6 space-y-2 overflow-y-auto">

        <a href="{{ route('admin.dashboard') }}"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
           {{ request()->routeIs('admin.dashboard') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}"
            title="Dashboard">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span x-show="!collapsed" class="text-sm font-medium whitespace-nowrap transition-opacity duration-200">Dashboard</span>
        </a>

        <a href="{{ route('admin.users.index') }}"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
           {{ request()->is('admin/users*') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}"
            title="Users">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span x-show="!collapsed" class="text-sm font-medium whitespace-nowrap transition-opacity duration-200">Users</span>
        </a>

        <a href="{{ route('admin.hydration.index') }}"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
           {{ request()->is('admin/hydration*') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}"
            title="Hydration">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span x-show="!collapsed" class="text-sm font-medium whitespace-nowrap transition-opacity duration-200">Hydration</span>
        </a>

        <a href="{{ route('admin.medication.index') }}"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
           {{ request()->is('admin/medication*') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}"
            title="Medication">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span x-show="!collapsed" class="text-sm font-medium whitespace-nowrap transition-opacity duration-200">Medication</span>
        </a>

        <a href="{{ route('admin.notifications.index') }}"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
           {{ request()->is('admin/notifications*') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}"
            title="Notifications">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L16 7l-4 4-4-4z" />
            </svg>
            <span x-show="!collapsed" class="text-sm font-medium whitespace-nowrap transition-opacity duration-200">Notifications</span>
        </a>

    </nav>

    <div class="p-4 border-t border-slate-800">
        <form method="POST" action="{{ route('admin.logout') }}">
            @csrf
            <button type="submit"
                class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group"
                title="Logout">
                <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span x-show="!collapsed" class="text-sm font-medium whitespace-nowrap transition-opacity duration-200">Logout</span>
            </button>
        </form>
    </div>
</aside>

<div x-show="open" class="lg:hidden relative z-50" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
    <div
        x-show="open"
        x-transition:enter="ease-in-out duration-500"
        x-transition:enter-start="opacity-0"
        x-transition:enter-end="opacity-100"
        x-transition:leave="ease-in-out duration-500"
        x-transition:leave-start="opacity-100"
        x-transition:leave-end="opacity-0"
        class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
        @click="open = false"></div>

    <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
            <div class="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
                <div
                    x-show="open"
                    x-transition:enter="transform transition ease-in-out duration-500 sm:duration-700"
                    x-transition:enter-start="-translate-x-full"
                    x-transition:enter-end="translate-x-0"
                    x-transition:leave="transform transition ease-in-out duration-500 sm:duration-700"
                    x-transition:leave-start="translate-x-0"
                    x-transition:leave-end="-translate-x-full"
                    class="pointer-events-auto relative w-screen max-w-xs">
                    <div class="flex h-full flex-col overflow-y-auto bg-slate-900 shadow-xl">
                        <div class="flex items-center justify-between px-6 py-6 border-b border-slate-800">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg">A</div>
                                <div>
                                    <h2 class="text-lg font-bold text-white tracking-tight">AQUATAB</h2>
                                    <p class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Admin Panel</p>
                                </div>
                            </div>
                            <button @click="open = false" type="button" class="text-slate-400 hover:text-white">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div class="flex-1 px-4 py-6 space-y-2">
                            <a href="{{ route('admin.dashboard') }}" @click="open = false" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium {{ request()->routeIs('admin.dashboard') ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}">
                                Dashboard
                            </a>
                            <a href="{{ route('admin.users.index') }}" @click="open = false" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium {{ request()->is('admin/users*') ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}">
                                Users
                            </a>
                            <a href="{{ route('admin.hydration.index') }}" @click="open = false" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium {{ request()->is('admin/hydration*') ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}">
                                Hydration
                            </a>
                            <a href="{{ route('admin.medication.index') }}" @click="open = false" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium {{ request()->is('admin/medication*') ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}">
                                Medication
                            </a>
                            <a href="{{ route('admin.notifications.index') }}" @click="open = false" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium {{ request()->is('admin/notifications*') ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white' }}">
                                Notifications
                            </a>
                        </div>

                        <div class="border-t border-slate-800 p-6">
                            <form method="POST" action="{{ route('admin.logout') }}">
                                @csrf
                                <button type="submit" class="flex w-full items-center gap-3 text-slate-400 hover:text-red-500 transition-colors">
                                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                    </svg>
                                    <span class="text-sm font-medium">Logout</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>