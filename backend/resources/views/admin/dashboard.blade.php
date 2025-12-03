@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
<!-- Logo and Header -->
<div class="flex items-center justify-between mb-8">
    <div class="flex items-center gap-4">
        <img src="{{ asset('../../app/assets/images/icon.png') }}" alt="AQUATAB Logo" class="h-12 w-12" onerror="this.style.display='none'">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">AQUATAB ADMIN</h1>
            <p class="text-sm text-gray-500">Dashboard Overview</p>
        </div>
    </div>
    <a href="{{ route('admin.users.create') }}" class="inline-flex items-center gap-2 bg-aqua text-white px-4 py-2 rounded-md hover:opacity-90 transition">Add New User</a>
</div>

<!-- Key Metrics Cards -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p class="text-3xl font-bold text-gray-900">{{ number_format($totalUsers) }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-lg">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM6 20v-1c0-2.76 3.58-4 6-4s6 1.24 6 4v1H6z"></path>
                </svg>
            </div>
        </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Active Users (DAU)</p>
                <p class="text-3xl font-bold text-gray-900">{{ number_format($dau) }}</p>
                <p class="text-xs text-gray-500 mt-1">Logged in today</p>
            </div>
            <div class="p-3 bg-green-100 rounded-lg">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
            </div>
        </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Total Revenue (MRR)</p>
                <p class="text-3xl font-bold text-gray-900">${{ number_format($mrr, 2) }}</p>
                <p class="text-xs text-gray-500 mt-1">Monthly Recurring</p>
            </div>
            <div class="p-3 bg-yellow-100 rounded-lg">
                <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
        </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Premium Conversion</p>
                <p class="text-3xl font-bold text-gray-900">{{ number_format($premiumConversionRate, 1) }}%</p>
                <p class="text-xs text-gray-500 mt-1">On Paid Plan</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-lg">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
            </div>
        </div>
    </div>
</div>

<!-- Charts Section -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
    <!-- User Growth: Line Chart (Last 30 days) -->
    <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-900">User Growth</h3>
        <p class="text-sm text-gray-500 mb-4">Last 30 days</p>
        <canvas id="userGrowthChart" height="100"></canvas>
    </div>

    <!-- Platform Split: Pie Chart -->
    <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-900">Platform Split</h3>
        <p class="text-sm text-gray-500 mb-4">iOS vs Android</p>
        <canvas id="platformSplitChart" height="200"></canvas>
    </div>
</div>

<!-- Hydration Stats: Bar Chart -->
<div class="bg-white p-6 rounded-lg shadow mb-8">
    <h3 class="text-lg font-semibold mb-4 text-gray-900">Hydration Stats</h3>
    <p class="text-sm text-gray-500 mb-4">Average water intake per day (Last 30 days)</p>
    <canvas id="hydrationStatsChart" height="80"></canvas>
</div>

<!-- Quick Actions -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <a href="{{ route('admin.hydration.index') }}" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
            </div>
            <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Hydration Management</h3>
                <p class="text-sm text-gray-600">View hydration analytics and user data</p>
            </div>
        </div>
    </a>

    <a href="{{ route('admin.medication.index') }}" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 14H9c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z"></path>
                </svg>
            </div>
            <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Medication Management</h3>
                <p class="text-sm text-gray-600">Monitor medication adherence and schedules</p>
            </div>
        </div>
    </a>

    <a href="{{ route('admin.notifications.index') }}" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-lg">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L16 7l-4 4-4-4z"></path>
                </svg>
            </div>
            <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
                <p class="text-sm text-gray-600">Track notification delivery and engagement</p>
            </div>
        </div>
    </a>
</div>

<!-- Users Table -->
<div class="bg-white rounded-lg shadow">
    <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold">Recent Users</h3>
    </div>
    <div class="overflow-x-auto">
        <table class="min-w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                @forelse ($users as $user)
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <a href="{{ route('admin.users.show', $user) }}" class="text-blue-600 hover:text-blue-900 hover:underline">{{ $user->name }}</a>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $user->email }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold {{ $user->role === 'admin' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700' }}">{{ $user->role }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $user->created_at->format('M j, Y') }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex gap-2">
                            <a href="{{ route('admin.users.show', $user) }}" class="text-green-600 hover:text-green-900">View</a>
                            <a href="{{ route('admin.users.edit', $user) }}" class="text-blue-600 hover:text-blue-900">Edit</a>
                            @if ($user->id !== auth()->id())
                            <form method="POST" action="{{ route('admin.users.destroy', $user) }}" style="display: inline;" onsubmit="return confirm('Are you sure you want to delete this user?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-600 hover:text-red-900">Delete</button>
                            </form>
                            @endif
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-gray-400">No users found.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <a href="{{ route('admin.users.index') }}" class="text-sm text-blue-600 hover:text-blue-900">View all users →</a>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    let userGrowthChart, platformSplitChart, hydrationStatsChart;

    // Initialize charts
    function initCharts() {
        console.log('Initializing dashboard charts...');

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded!');
            return;
        }

        // User Growth: Line Chart
        const userGrowthCtx = document.getElementById('userGrowthChart');
        if (userGrowthCtx) {
            const userGrowthData = {
                !!Js::from($userGrowth) !!
            };
            userGrowthChart = new Chart(userGrowthCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: userGrowthData.map(item => item.date),
                    datasets: [{
                        label: 'Total Users',
                        data: userGrowthData.map(item => item.users),
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        }

        // Platform Split: Pie Chart
        const platformCtx = document.getElementById('platformSplitChart');
        if (platformCtx) {
            const platformData = {
                !!Js::from($platformSplit) !!
            };
            platformSplitChart = new Chart(platformCtx.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: platformData.map(item => item.platform),
                    datasets: [{
                        data: platformData.map(item => item.count),
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(34, 197, 94, 0.8)'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Hydration Stats: Bar Chart
        const hydrationCtx = document.getElementById('hydrationStatsChart');
        if (hydrationCtx) {
            const hydrationData = {
                !!Js::from($hydrationStats) !!
            };
            hydrationStatsChart = new Chart(hydrationCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: hydrationData.map(item => item.date),
                    datasets: [{
                        label: 'Average Intake (ml)',
                        data: hydrationData.map(item => item.average),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                                callback: function(value) {
                                    return value + ' ml';
                                }
                            }
                        },
                        x: {
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            });
        }

        console.log('All dashboard charts initialized successfully!');
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        initCharts();
    });
</script>
@endpush