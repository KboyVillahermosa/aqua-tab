@extends('layouts.app')

@section('title', 'Notifications Management - Enhanced')

@section('content')
<div class="min-h-screen bg-slate-50 py-4">
    <div class="max-w-7xl mx-auto px-6">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-slate-900">Notifications Management</h1>
                <p class="text-slate-500 mt-2">Monitor notification delivery, engagement, and effectiveness metrics</p>
            </div>
            <div class="flex items-center gap-3 mt-6 md:mt-0">
                <select id="timeRange" class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    <option value="7">Last 7 days</option>
                    <option value="30" selected>Last 30 days</option>
                    <option value="90">Last 90 days</option>
                </select>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-purple-50 rounded-xl">
                        <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L16 7l-4 4-4-4z"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Total Notifications</p>
                    <p class="text-3xl font-bold text-slate-900">{{ number_format($totalNotifications) }}</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-green-50 rounded-xl">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Delivered</p>
                    <p class="text-3xl font-bold text-slate-900">{{ number_format($deliveredNotifications) }}</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-blue-50 rounded-xl">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Open Rate</p>
                    <p class="text-3xl font-bold text-slate-900">{{ $openRate }}%</p>
                    <p class="text-xs text-slate-500 mt-2">user engagement</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-amber-50 rounded-xl">
                        <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Effectiveness</p>
                    <p class="text-3xl font-bold text-slate-900">{{ $effectivenessRate }}%</p>
                    <p class="text-xs text-slate-500 mt-2">action within 30 mins</p>
                </div>
            </div>
        </div>

        <!-- Additional Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500 uppercase tracking-wide">Snoozed</p>
                        <p class="text-2xl font-bold text-slate-900 mt-2">{{ number_format($snoozedCount) }}</p>
                    </div>
                    <div class="text-right text-xs text-slate-500">
                        <p>{{ $totalNotifications > 0 ? round(($snoozedCount / $totalNotifications) * 100, 1) : 0 }}% of total</p>
                    </div>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500 uppercase tracking-wide">Failed</p>
                        <p class="text-2xl font-bold text-red-600 mt-2">{{ number_format($failedCount) }}</p>
                    </div>
                    <div class="text-right text-xs text-slate-500">
                        <p>{{ $totalNotifications > 0 ? round(($failedCount / $totalNotifications) * 100, 1) : 0 }}% of total</p>
                    </div>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500 uppercase tracking-wide">Avg Response Time</p>
                        <p class="text-2xl font-bold text-slate-900 mt-2">~5 min</p>
                    </div>
                    <div class="text-right text-xs text-slate-500">
                        <p>when opened</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Failed Notifications Log -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
            <div class="px-6 py-5 border-b border-slate-100 bg-red-50">
                <h3 class="text-lg font-bold text-red-900">⚠️ Failed Notifications Log</h3>
                <p class="text-sm text-red-700 mt-1">Notifications that failed to deliver with error details</p>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Message</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Error Reason</th>
                            <th class="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Retry</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse($failedNotifications as $notif)
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-sm text-slate-600">{{ $notif['created_at']->format('M d, Y H:i') }}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <p class="font-medium text-slate-900">{{ $notif['user_name'] }}</p>
                            </td>
                            <td class="px-6 py-4">
                                <p class="text-sm text-slate-600 truncate">{{ $notif['message'] }}</p>
                            </td>
                            <td class="px-6 py-4">
                                <p class="text-sm text-slate-600">{{ $notif['error'] }}</p>
                            </td>
                            <td class="px-6 py-4 text-right whitespace-nowrap">
                                <button onclick="retryNotification({{ $notif['id'] }})" class="text-blue-600 hover:text-blue-900 text-sm font-medium">Retry →</button>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                                <p class="text-sm">No failed notifications</p>
                            </td>
                        </tr>
                        @endforelse
                </table>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Daily Notification Volume</h3>
                        <p class="text-slate-500 text-sm">Last 30 days trend</p>
                    </div>
                </div>
                <div class="relative h-64 w-full">
                    <canvas id="dailyVolumeChart"></canvas>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Notification Types Distribution</h3>
                        <p class="text-slate-500 text-sm">Breakdown by notification type</p>
                    </div>
                </div>
                <div class="relative h-64 w-full">
                    <canvas id="typesChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Notification Effectiveness & User Interaction Status -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Engagement Status</h3>
                        <p class="text-slate-500 text-sm">User interaction breakdown</p>
                    </div>
                </div>
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between mb-2">
                            <span class="text-sm font-semibold text-slate-700">Opened & Actioned</span>
                            <span class="text-sm font-bold text-green-600">68%</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-2">
                            <div class="bg-green-600 h-2 rounded-full" style="width: 68%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between mb-2">
                            <span class="text-sm font-semibold text-slate-700">Opened Only</span>
                            <span class="text-sm font-bold text-blue-600">18%</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: 18%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between mb-2">
                            <span class="text-sm font-semibold text-slate-700">Not Opened</span>
                            <span class="text-sm font-bold text-slate-600">14%</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-2">
                            <div class="bg-slate-600 h-2 rounded-full" style="width: 14%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Effectiveness Score</h3>
                        <p class="text-slate-500 text-sm">Notifications leading to action within 30 mins</p>
                    </div>
                </div>
                <div class="flex flex-col items-center justify-center py-8">
                    <div class="relative w-40 h-40 rounded-full border-8 border-slate-200 flex items-center justify-center" style="border-color: #e2e8f0">
                        <div class="absolute inset-1 rounded-full border-8 flex items-center justify-center" style="border-color: #10b981; border-left-color: #e2e8f0; transform: rotate(-90deg)">
                            <div class="text-center">
                                <p class="text-4xl font-bold text-slate-900">72%</p>
                                <p class="text-xs text-slate-500 mt-1">effective</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Notifications with User Interaction -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-slate-100">
                <h3 class="text-lg font-bold text-slate-900">Recent Notifications</h3>
                <p class="text-slate-500 text-sm">Latest notifications with user interaction status</p>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Message</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User Interaction</th>
                            <th class="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse($recentNotifications as $notif)
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-sm text-slate-600">{{ $notif['created_at']->format('M d, Y') }}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <p class="font-medium text-slate-900">{{ $notif['user_name'] }}</p>
                            </td>
                            <td class="px-6 py-4">
                                <p class="text-sm text-slate-600 truncate">{{ $notif['message'] }}</p>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-xs font-semibold text-slate-600">{{ $notif['type'] }}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold {{ $notif['status'] === 'delivered' ? 'bg-green-100 text-green-800' : ($notif['status'] === 'failed' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800') }}">
                                    {{ ucfirst($notif['status']) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold {{ $notif['user_interaction'] === 'Opened & Actioned' ? 'bg-green-100 text-green-800' : ($notif['user_interaction'] === 'Opened Only' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800') }}">
                                    {{ $notif['user_interaction'] }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right whitespace-nowrap">
                                <a href="/admin/users/{{ $notif['user_id'] ?? '#' }}" class="text-blue-600 hover:text-blue-900 text-sm font-medium">View →</a>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" class="px-6 py-8 text-center text-slate-400">
                                <p class="text-sm">No recent notifications</p>
                            </td>
                        </tr>
                        @endforelse
                </table>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    let dailyVolumeChart, typesChart;

    function initCharts() {
        // Daily Notification Volume
        const dailyCtx = document.getElementById('dailyVolumeChart');
        if (dailyCtx) {
            dailyVolumeChart = new Chart(dailyCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
                    datasets: [{
                        label: 'Notifications Sent',
                        data: [245, 312, 289, 356, 298, 401, 378],
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#8b5cf6',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                borderDash: [2, 2],
                                drawBorder: false
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        // Notification Types Distribution
        const typesCtx = document.getElementById('typesChart');
        if (typesCtx) {
            typesChart = new Chart(typesCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Hydration Reminders', 'Medication Alerts', 'Achievement', 'Updates', 'Other'],
                    datasets: [{
                        data: [35, 30, 15, 12, 8],
                        backgroundColor: ['#3b82f6', '#ef4444', '#fbbf24', '#10b981', '#8b5cf6'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 8,
                                padding: 15
                            }
                        }
                    }
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', initCharts);
</script>
@endpush
@endsection