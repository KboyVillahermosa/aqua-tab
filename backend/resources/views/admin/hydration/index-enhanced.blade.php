@extends('layouts.app')

@section('title', 'Hydration Management - Enhanced')

@section('content')
<div class="min-h-screen bg-slate-50 py-4">
    <div class="max-w-7xl mx-auto px-6">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-slate-900">Hydration Management</h1>
                <p class="text-slate-500 mt-2">Monitor user hydration goals and daily water intake with actionable insights</p>
            </div>
            <div class="flex items-center gap-3 mt-6 md:mt-0">
                <select id="timeRange" class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    <option value="7">Last 7 days</option>
                    <option value="30" selected>Last 30 days</option>
                    <option value="90">Last 90 days</option>
                </select>
                <select id="userType" class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    <option value="">All Users</option>
                    <option value="free">Free Tier</option>
                    <option value="premium">Premium</option>
                </select>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-blue-50 rounded-xl">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Total Users</p>
                    <p class="text-3xl font-bold text-slate-900">{{ $totalUsers }}</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-green-50 rounded-xl">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Avg Daily Intake</p>
                    <p class="text-3xl font-bold text-slate-900">{{ number_format($avgDailyIntake) }}</p>
                    <p class="text-xs text-slate-500 mt-2">ml per day</p>
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
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Goal Achievement</p>
                    <p class="text-3xl font-bold text-slate-900">{{ $goalAchievement }}%</p>
                    <p class="text-xs text-slate-500 mt-2">of users on track</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-red-50 rounded-xl">
                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">At-Risk Users</p>
                    <p class="text-3xl font-bold text-slate-900">{{ $atRiskUsers->count() }}</p>
                    <p class="text-xs text-slate-500 mt-2">Below 50% goal</p>
                </div>
            </div>
        </div>

        <!-- At-Risk Users Table -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
            <div class="px-6 py-5 border-b border-slate-100 bg-red-50">
                <h3 class="text-lg font-bold text-red-900">⚠️ At-Risk Users (Below 50% Goal)</h3>
                <p class="text-sm text-red-700 mt-1">Immediate intervention recommended for these users</p>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User Name</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Daily Goal</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Avg Intake</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Achievement %</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Days Logged</th>
                            <th class="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse($atRiskUsers as $user)
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <p class="font-medium text-slate-900">{{ $user['name'] }}</p>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <p class="text-sm text-slate-600">{{ $user['email'] }}</p>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <p class="text-sm font-medium text-slate-900">{{ number_format($user['goal']) }} ml</p>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <p class="text-sm text-slate-600">{{ number_format($user['intake']) }} ml</p>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center gap-2">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">{{ $user['percentage'] }}%</span>
                                    <div class="w-12 h-2 bg-slate-200 rounded-full">
                                        <div class="bg-red-600 h-2 rounded-full" style="width: {{ $user['percentage'] }}%"></div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <p class="text-sm text-slate-600">{{ $user['days_logged'] }} days</p>
                            </td>
                            <td class="px-6 py-4 text-right whitespace-nowrap">
                                <a href="/admin/users/{{ $user['id'] }}" class="text-blue-600 hover:text-blue-900 text-sm font-medium">View Profile →</a>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" class="px-6 py-8 text-center text-slate-400">
                                <p class="text-sm">No at-risk users found</p>
                            </td>
                        </tr>
                        @endforelse
                </table>
            </div>
        </div>

        <!-- Goal vs Actual Comparison Chart -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Goal vs Actual Comparison</h3>
                        <p class="text-slate-500 text-sm">Weekly hydration performance</p>
                    </div>
                </div>
                <div class="relative h-64 w-full">
                    <canvas id="goalVsActualChart"></canvas>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Weekly Hydration Trend</h3>
                        <p class="text-slate-500 text-sm">Last 30 days average</p>
                    </div>
                </div>
                <div class="relative h-64 w-full">
                    <canvas id="weeklyTrendChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Low Intake Entries Table -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-slate-100">
                <h3 class="text-lg font-bold text-slate-900">Low Intake Exceptions</h3>
                <p class="text-slate-500 text-sm">Days when users fell below 50% of daily goal</p>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Daily Goal</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actual Intake</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Achievement %</th>
                            <th class="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100" id="lowIntakeTableBody">
                        <tr>
                            <td colspan="6" class="px-6 py-8 text-center text-slate-400">
                                <p class="text-sm">Loading low intake entries...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    let goalVsActualChart, weeklyTrendChart;

    function initCharts() {
        // Goal vs Actual Chart
        const goalCtx = document.getElementById('goalVsActualChart');
        if (goalCtx) {
            const chartData = @json($chartData);
            goalVsActualChart = new Chart(goalCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: chartData.map(item => item.date),
                    datasets: [{
                            label: 'Goal',
                            data: chartData.map(item => item.goal),
                            backgroundColor: 'rgba(203, 213, 225, 0.5)',
                            borderColor: '#94a3b8',
                            borderWidth: 1
                        },
                        {
                            label: 'Actual',
                            data: chartData.map(item => item.actual),
                            backgroundColor: '#3b82f6',
                            borderColor: '#1e40af',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                borderDash: [2, 2],
                                drawBorder: false
                            },
                            ticks: {
                                callback: function(value) {
                                    return value + ' ml';
                                }
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

        // Weekly Trend Chart
        const weeklyCtx = document.getElementById('weeklyTrendChart');
        if (weeklyCtx) {
            const chartData = @json($chartData);
            weeklyTrendChart = new Chart(weeklyCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: chartData.map(item => item.date),
                    datasets: [{
                        label: 'Average Daily Intake',
                        data: chartData.map(item => item.actual),
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#22c55e',
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
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                borderDash: [2, 2],
                                drawBorder: false
                            },
                            ticks: {
                                callback: function(value) {
                                    return value + ' ml';
                                }
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
    }

    document.addEventListener('DOMContentLoaded', initCharts);
</script>
@endpush
@endsection