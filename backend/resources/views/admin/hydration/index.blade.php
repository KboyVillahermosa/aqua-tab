@extends('layouts.app')

@section('title', 'Hydration Management')

@section('content')
<div class="min-h-screen bg-slate-50 py-4">
    <div class="max-w-7xl mx-auto px-6">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-slate-900">Hydration Management</h1>
                <p class="text-slate-500 mt-2">Monitor user hydration goals and daily water intake</p>
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
                    <div class="p-3 bg-blue-50 rounded-xl">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Total Users</p>
                    <p class="text-3xl font-bold text-slate-900" id="totalUsers">-</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-green-50 rounded-xl">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Avg Daily Intake</p>
                    <p class="text-3xl font-bold text-slate-900" id="avgDailyIntake">-</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-amber-50 rounded-xl">
                        <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Goal Achievement</p>
                    <p class="text-3xl font-bold text-slate-900" id="goalAchievement">-</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-red-50 rounded-xl">
                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Missed Reminders</p>
                    <p class="text-3xl font-bold text-slate-900" id="missedReminders">-</p>
                </div>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Daily Intake Chart -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="text-lg font-bold text-slate-900 mb-6">Daily Intake</h3>
                <canvas id="dailyIntakeChart" width="400" height="200"></canvas>
            </div>

            <!-- Goal Achievement Chart -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="text-lg font-bold text-slate-900 mb-6">Goal Achievement</h3>
                <canvas id="goalAchievementChart" width="400" height="200"></canvas>
            </div>
        </div>

        <!-- Weekly Trend Chart -->
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
            <h3 class="text-lg font-bold text-slate-900 mb-6">Weekly Hydration Trend</h3>
            <canvas id="weeklyTrendChart" width="800" height="300"></canvas>
        </div>

        <!-- Recent Entries Table -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-slate-100">
                <h3 class="text-lg font-bold text-slate-900">Recent Hydration Entries</h3>
            </div>
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold">Recent Hydration Entries</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody id="hydrationEntriesTable" class="bg-white divide-y divide-gray-200">
                        <!-- Data will be loaded here -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    let dailyIntakeChart, goalAchievementChart, weeklyTrendChart;

    // Initialize charts
    function initCharts() {
        console.log('Initializing charts...');

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded!');
            return;
        }

        // Daily Intake Chart
        const dailyCtx = document.getElementById('dailyIntakeChart');
        if (!dailyCtx) {
            console.error('Daily intake chart canvas not found!');
            return;
        }

        dailyIntakeChart = new Chart(dailyCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Water Intake (ml)',
                    data: [],
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Goal Achievement Chart
        const goalCtx = document.getElementById('goalAchievementChart');
        if (!goalCtx) {
            console.error('Goal achievement chart canvas not found!');
            return;
        }

        goalAchievementChart = new Chart(goalCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Achieved', 'Not Achieved'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Weekly Trend Chart
        const weeklyCtx = document.getElementById('weeklyTrendChart');
        if (!weeklyCtx) {
            console.error('Weekly trend chart canvas not found!');
            return;
        }

        weeklyTrendChart = new Chart(weeklyCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Average Daily Intake',
                    data: [],
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        console.log('All charts initialized successfully!');
    }

    // Load hydration data
    async function loadHydrationData() {
        try {
            const timeRange = document.getElementById('timeRange').value;
            console.log('Loading hydration data for', timeRange, 'days');
            const response = await fetch(`/api/hydration/stats?days=${timeRange}`);
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Received data:', data);

            // Update stats cards
            document.getElementById('totalUsers').textContent = data.total_users || 0;
            document.getElementById('avgDailyIntake').textContent = `${Math.round(data.avg_daily_intake || 0)}ml`;
            document.getElementById('goalAchievement').textContent = `${Math.round(data.goal_achievement_rate || 0)}%`;
            document.getElementById('missedReminders').textContent = data.missed_reminders || 0;

            // Update daily intake chart
            if (data.daily_intake && data.daily_intake.length > 0 && dailyIntakeChart) {
                dailyIntakeChart.data.labels = data.daily_intake.map(item => item.date);
                dailyIntakeChart.data.datasets[0].data = data.daily_intake.map(item => item.total_amount);
                dailyIntakeChart.update();
            }

            // Update goal achievement chart
            const achieved = data.goal_achievement_rate || 0;
            const notAchieved = 100 - achieved;
            if (goalAchievementChart) {
                goalAchievementChart.data.datasets[0].data = [achieved, notAchieved];
                goalAchievementChart.update();
            }

            // Update weekly trend chart
            if (data.weekly_trend && data.weekly_trend.length > 0 && weeklyTrendChart) {
                weeklyTrendChart.data.labels = data.weekly_trend.map(item => item.week);
                weeklyTrendChart.data.datasets[0].data = data.weekly_trend.map(item => item.avg_intake);
                weeklyTrendChart.update();
            }

            // Update recent entries table
            updateRecentEntriesTable(data.recent_entries || []);

        } catch (error) {
            console.error('Error loading hydration data:', error);
            // Show error in UI
            document.getElementById('totalUsers').textContent = 'Error';
            document.getElementById('avgDailyIntake').textContent = 'Error';
            document.getElementById('goalAchievement').textContent = 'Error';
            document.getElementById('missedReminders').textContent = 'Error';
        }
    }

    // Update recent entries table
    function updateRecentEntriesTable(entries) {
        const tbody = document.getElementById('hydrationEntriesTable');
        tbody.innerHTML = '';

        entries.forEach(entry => {
            const progress = entry.goal > 0 ? Math.round((entry.total_amount / entry.goal) * 100) : 0;
            const progressColor = progress >= 100 ? 'text-green-600' : progress >= 75 ? 'text-yellow-600' : 'text-red-600';

            const row = document.createElement('tr');
            row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${entry.user_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.total_amount}ml</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.goal}ml</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${progressColor}">${progress}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(entry.date).toLocaleDateString()}</td>
        `;
            tbody.appendChild(row);
        });
    }

    // Event listeners
    document.getElementById('timeRange').addEventListener('change', loadHydrationData);

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        initCharts();
        loadHydrationData();
    });
</script>
@endpush