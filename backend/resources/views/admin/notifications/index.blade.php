@extends('layouts.app')

@section('title', 'Notifications Management')

@section('content')
<div class="min-h-screen bg-slate-50 py-4">
    <div class="max-w-7xl mx-auto px-6">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-slate-900">Notifications Management</h1>
                <p class="text-slate-500 mt-2">Monitor notification delivery and user engagement</p>
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
                    <p class="text-3xl font-bold text-slate-900" id="totalNotifications">-</p>
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
                    <p class="text-3xl font-bold text-slate-900" id="deliveredNotifications">-</p>
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
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Snoozed</p>
                    <p class="text-3xl font-bold text-slate-900" id="snoozedNotifications">-</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-red-50 rounded-xl">
                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Missed</p>
                    <p class="text-3xl font-bold text-slate-900" id="missedNotifications">-</p>
                </div>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Notification Status Chart -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="text-lg font-bold text-slate-900 mb-6">Notification Status</h3>
                <canvas id="notificationStatusChart" width="400" height="200"></canvas>
            </div>

            <!-- Notification Types Chart -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="text-lg font-bold text-slate-900 mb-6">Notification Types</h3>
                <canvas id="notificationTypesChart" width="400" height="200"></canvas>
            </div>
        </div>

        <!-- Daily Notification Volume Chart -->
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
            <h3 class="text-lg font-bold text-slate-900 mb-6">Daily Notification Volume</h3>
            <canvas id="dailyVolumeChart" width="800" height="300"></canvas>
        </div>

        <!-- Response Time Analysis Chart -->
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
            <h3 class="text-lg font-bold text-slate-900 mb-6">Response Time Analysis</h3>
            <h3 class="text-lg font-semibold mb-4">Average Response Time</h3>
            <canvas id="responseTimeChart" width="800" height="300"></canvas>
        </div>

        <!-- Recent Notifications Table -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-slate-100">
                <h3 class="text-lg font-bold text-slate-900">Recent Notifications</h3>
            </div>
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold">Recent Notifications</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                        </tr>
                    </thead>
                    <tbody id="notificationsTable" class="bg-white divide-y divide-gray-200">
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
    let notificationStatusChart, notificationTypesChart, dailyVolumeChart, responseTimeChart;

    // Initialize charts
    function initCharts() {
        // Notification Status Chart
        const statusCtx = document.getElementById('notificationStatusChart').getContext('2d');
        notificationStatusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Delivered', 'Snoozed', 'Missed', 'Pending'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(59, 130, 246, 0.8)'
                    ],
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

        // Notification Types Chart
        const typesCtx = document.getElementById('notificationTypesChart').getContext('2d');
        notificationTypesChart = new Chart(typesCtx, {
            type: 'bar',
            data: {
                labels: ['Hydration', 'Medication'],
                datasets: [{
                    label: 'Count',
                    data: [0, 0],
                    backgroundColor: ['rgba(59, 130, 246, 0.5)', 'rgba(34, 197, 94, 0.5)'],
                    borderColor: ['rgba(59, 130, 246, 1)', 'rgba(34, 197, 94, 1)'],
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

        // Daily Volume Chart
        const volumeCtx = document.getElementById('dailyVolumeChart').getContext('2d');
        dailyVolumeChart = new Chart(volumeCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Notifications Sent',
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

        // Response Time Chart
        const responseCtx = document.getElementById('responseTimeChart').getContext('2d');
        responseTimeChart = new Chart(responseCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Avg Response Time (minutes)',
                    data: [],
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
    }

    // Load notification data
    async function loadNotificationData() {
        try {
            const timeRange = document.getElementById('timeRange').value;
            const response = await fetch(`/api/notifications/stats?days=${timeRange}`);
            const data = await response.json();

            // Update stats cards
            document.getElementById('totalNotifications').textContent = data.total_notifications || 0;
            document.getElementById('deliveredNotifications').textContent = data.delivered_count || 0;
            document.getElementById('snoozedNotifications').textContent = data.snoozed_count || 0;
            document.getElementById('missedNotifications').textContent = data.missed_count || 0;

            // Update notification status chart
            notificationStatusChart.data.datasets[0].data = [
                data.delivered_count || 0,
                data.snoozed_count || 0,
                data.missed_count || 0,
                data.pending_count || 0
            ];
            notificationStatusChart.update();

            // Update notification types chart
            notificationTypesChart.data.datasets[0].data = [
                data.hydration_count || 0,
                data.medication_count || 0
            ];
            notificationTypesChart.update();

            // Update daily volume chart
            dailyVolumeChart.data.labels = data.daily_volume.map(item => item.date);
            dailyVolumeChart.data.datasets[0].data = data.daily_volume.map(item => item.count);
            dailyVolumeChart.update();

            // Update response time chart
            responseTimeChart.data.labels = data.response_times.map(item => item.date);
            responseTimeChart.data.datasets[0].data = data.response_times.map(item => item.avg_response_time);
            responseTimeChart.update();

            // Update recent notifications table
            updateNotificationsTable(data.recent_notifications || []);

        } catch (error) {
            console.error('Error loading notification data:', error);
        }
    }

    // Update notifications table
    function updateNotificationsTable(notifications) {
        const tbody = document.getElementById('notificationsTable');
        tbody.innerHTML = '';

        notifications.forEach(notification => {
            const statusColor = notification.status === 'delivered' ? 'text-green-600' :
                notification.status === 'snoozed' ? 'text-yellow-600' :
                notification.status === 'missed' ? 'text-red-600' : 'text-blue-600';
            const statusText = notification.status.charAt(0).toUpperCase() + notification.status.slice(1);

            const responseTime = notification.response_time ?
                `${Math.round(notification.response_time)} min` : '-';

            const row = document.createElement('tr');
            row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${notification.user_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${notification.type}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${notification.title}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${statusColor}">${statusText}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(notification.scheduled_at).toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${responseTime}</td>
        `;
            tbody.appendChild(row);
        });
    }

    // Event listeners
    document.getElementById('timeRange').addEventListener('change', loadNotificationData);

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        initCharts();
        loadNotificationData();
    });
</script>
@endpush