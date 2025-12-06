@extends('layouts.app')

@section('title', 'Medication Management - Enhanced')

@section('content')
<div class="min-h-screen bg-slate-50 py-4">
    <div class="max-w-7xl mx-auto px-6">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-slate-900">Medication Management</h1>
                <p class="text-slate-500 mt-2">Track medication schedules, adherence rates, and compliance issues</p>
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
                    <div class="p-3 bg-teal-50 rounded-xl">
                        <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Active Medications</p>
                    <p class="text-3xl font-bold text-slate-900">{{ $activeMedications }}</p>
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
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Adherence Rate</p>
                    <p class="text-3xl font-bold text-slate-900">{{ $adherenceRate }}%</p>
                    <p class="text-xs text-slate-500 mt-2">System-wide average</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-red-50 rounded-xl">
                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Missed Doses</p>
                    <p class="text-3xl font-bold text-slate-900">{{ $missedDoses }}</p>
                    <p class="text-xs text-slate-500 mt-2">this period</p>
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
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Critical Users</p>
                    <p class="text-3xl font-bold text-slate-900">{{ $criticalMissedMedications->count() }}</p>
                    <p class="text-xs text-slate-500 mt-2">repeated offenders</p>
                </div>
            </div>
        </div>

        <!-- Critical Missed Doses Alert -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
            <div class="px-6 py-5 border-b border-slate-100 bg-red-50">
                <h3 class="text-lg font-bold text-red-900">🚨 Critical Missed Doses Alert</h3>
                <p class="text-sm text-red-700 mt-1">Users with repeated missed medications requiring immediate follow-up</p>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User Name</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Missed Count (7d)</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Medications</th>
                            <th class="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse($criticalMissedMedications as $record)
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <p class="font-medium text-slate-900">{{ $record['user_name'] }}</p>
                            </td>
                            <td class="px-6 py-4">
                                <p class="text-sm text-slate-600">{{ $record['user_email'] }}</p>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">{{ $record['missed_count'] }} times</span>
                            </td>
                            <td class="px-6 py-4">
                                <p class="text-sm text-slate-600">{{ $record['medications'] }}</p>
                            </td>
                            <td class="px-6 py-4 text-right whitespace-nowrap">
                                <a href="/admin/users/{{ $record['user_id'] }}" class="text-blue-600 hover:text-blue-900 text-sm font-medium">View Profile →</a>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                                <p class="text-sm">No critical missed doses found</p>
                            </td>
                        </tr>
                        @endforelse
                </table>
            </div>
        </div>

        <!-- Compliance Ranking -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Top Performers -->
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-5 border-b border-slate-100 bg-green-50">
                    <h3 class="text-lg font-bold text-green-900">⭐ Top Performers</h3>
                    <p class="text-sm text-green-700 mt-1">Highest medication adherence rates</p>
                </div>
                <div class="divide-y divide-slate-100">
                    @forelse($complianceRanking['top_users'] as $user)
                    <div class="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                            <p class="font-semibold text-slate-900">{{ $user['name'] }}</p>
                            <p class="text-xs text-slate-500 mt-1">{{ $user['completed'] }}/{{ $user['total'] }} doses completed</p>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-bold text-green-600">{{ $user['adherence_rate'] }}%</p>
                            <div class="w-16 h-2 bg-slate-200 rounded-full mt-1">
                                <div class="bg-green-600 h-2 rounded-full" style="width: {{ $user['adherence_rate'] }}%"></div>
                            </div>
                        </div>
                    </div>
                    @empty
                    <div class="px-6 py-8 text-center text-slate-400">
                        <p class="text-sm">No data available</p>
                    </div>
                    @endforelse
                </div>
            </div>

            <!-- Bottom Performers -->
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-5 border-b border-slate-100 bg-red-50">
                    <h3 class="text-lg font-bold text-red-900">⚠️ Need Attention</h3>
                    <p class="text-sm text-red-700 mt-1">Lowest medication adherence rates</p>
                </div>
                <div class="divide-y divide-slate-100">
                    @forelse($complianceRanking['bottom_users'] as $user)
                    <div class="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                            <p class="font-semibold text-slate-900">{{ $user['name'] }}</p>
                            <p class="text-xs text-slate-500 mt-1">{{ $user['completed'] }}/{{ $user['total'] }} doses completed</p>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-bold {{ $user['adherence_rate'] < 60 ? 'text-red-600' : 'text-amber-600' }}">{{ $user['adherence_rate'] }}%</p>
                            <div class="w-16 h-2 bg-slate-200 rounded-full mt-1">
                                <div class="{{ $user['adherence_rate'] < 60 ? 'bg-red-600' : 'bg-amber-600' }} h-2 rounded-full" style="width: {{ $user['adherence_rate'] }}%"></div>
                            </div>
                        </div>
                    </div>
                    @empty
                    <div class="px-6 py-8 text-center text-slate-400">
                        <p class="text-sm">No data available</p>
                    </div>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Adherence by Medication Type</h3>
                        <p class="text-slate-500 text-sm">Compliance rates by category</p>
                    </div>
                </div>
                <div class="relative h-64 w-full">
                    <canvas id="medicationTypeChart"></canvas>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Weekly Adherence Trend</h3>
                        <p class="text-slate-500 text-sm">Last 30 days performance</p>
                    </div>
                </div>
                <div class="relative h-64 w-full">
                    <canvas id="weeklyAdherenceChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Problematic Entries -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-slate-100">
                <h3 class="text-lg font-bold text-slate-900">Recent Problematic Entries</h3>
                <p class="text-slate-500 text-sm">Missed and late medication records</p>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Medication</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Scheduled Time</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Taken Time</th>
                            <th class="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse($problematicEntries as $entry)
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-sm text-slate-600">{{ $entry->created_at->format('M d, Y') }}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <p class="font-medium text-slate-900">{{ $entry->user->name }}</p>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <p class="text-sm text-slate-600">{{ $entry->medication->name ?? 'Unknown' }}</p>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold {{ $entry->status === 'missed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800' }}">
                                    {{ ucfirst($entry->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <p class="text-sm text-slate-600">{{ $entry->scheduled_time ?? '-' }}</p>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <p class="text-sm text-slate-600">{{ $entry->taken_time ?? '-' }}</p>
                            </td>
                            <td class="px-6 py-4 text-right whitespace-nowrap">
                                <a href="/admin/users/{{ $entry->user_id }}" class="text-blue-600 hover:text-blue-900 text-sm font-medium">View →</a>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" class="px-6 py-8 text-center text-slate-400">
                                <p class="text-sm">No problematic entries found</p>
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
    let medicationTypeChart, weeklyAdherenceChart;

    function initCharts() {
        // Adherence by Medication Type
        const typeCtx = document.getElementById('medicationTypeChart');
        if (typeCtx) {
            const medicationTypes = @json($medicationTypeData);
            medicationTypeChart = new Chart(typeCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: medicationTypes.map(m => m.type),
                    datasets: [{
                        label: 'Adherence Rate (%)',
                        data: medicationTypes.map(m => m.adherence),
                        backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                borderDash: [2, 2],
                                drawBorder: false
                            },
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        // Weekly Adherence Trend
        const weeklyCtx = document.getElementById('weeklyAdherenceChart');
        if (weeklyCtx) {
            weeklyAdherenceChart = new Chart(weeklyCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'System-wide Adherence',
                        data: [82, 85, 87, 89],
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
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                borderDash: [2, 2],
                                drawBorder: false
                            },
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
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