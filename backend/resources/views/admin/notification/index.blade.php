@extends('layouts.app')

@section('title', 'Notifications Management')

@section('content')
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Notifications Management</h1>
        <div class="flex gap-2">
            <select id="timeRange" class="px-3 py-2 border border-gray-300 rounded-md">
                <option value="7">Last 7 days</option>
                <option value="30" selected>Last 30 days</option>
                <option value="90">Last 90 days</option>
            </select>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
                <div class="p-2 bg-blue-100 rounded-lg">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L16 7l-4 4-4-4z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Notifications</p>
                    <p class="text-2xl font-semibold text-gray-900" id="totalNotifications">-</p>
                </div>
            </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
                <div class="p-2 bg-green-100 rounded-lg">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Delivered</p>
                    <p class="text-2xl font-semibold text-gray-900" id="deliveredNotifications">-</p>
                </div>
            </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
                <div class="p-2 bg-yellow-100 rounded-lg">
                    <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Snoozed</p>
                    <p class="text-2xl font-semibold text-gray-900" id="snoozedNotifications">-</p>
                </div>
            </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
                <div class="p-2 bg-red-100 rounded-lg">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Missed</p>
                    <p class="text-2xl font-semibold text-gray-900" id="missedNotifications">-</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Notification Status Chart -->
        <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-4">Notification Status Distribution</h3>
            <canvas id="notificationStatusChart" width="400" height="200"></canvas>
        </div>

        <!-- Notification Types Chart -->
        <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-4">Notification Types</h3>
            <canvas id="notificationTypesChart" width="400" height="200"></canvas>
        </div>
    </div>

    <!-- Daily Notification Volume Chart -->
    <div class="bg-white p-6 rounded-lg shadow mb-8">
        <h3 class="text-lg font-semibold mb-4">Daily Notification Volume</h3>
        <canvas id="dailyVolumeChart" width="800" height="300"></canvas>
    </div>

    <!-- Response Time Analysis Chart -->
    <div class="bg-white p-6 rounded-lg shadow mb-8">
        <h3 class="text-lg font-semibold mb-4">Average Response Time</h3>
        <canvas id="responseTimeChart" width="800" height="300"></canvas>
    </div>

    <!-- Recent Notifications Table -->
    <div class="bg-white rounded-lg shadow">
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
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
let notificationStatusChart, notificationTypesChart, dailyVolumeChart, responseTimeChart;

// Initialize charts
function initCharts() {
    console.log('Initializing notification charts...');
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded!');
        return;
    }
    
    // Notification Status Chart
    const statusCtx = document.getElementById('notificationStatusChart');
    if (!statusCtx) {
        console.error('Notification status chart canvas not found!');
        return;
    }
    
    notificationStatusChart = new Chart(statusCtx.getContext('2d'), {
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
    const typesCtx = document.getElementById('notificationTypesChart');
    if (!typesCtx) {
        console.error('Notification types chart canvas not found!');
        return;
    }
    
    notificationTypesChart = new Chart(typesCtx.getContext('2d'), {
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
    const volumeCtx = document.getElementById('dailyVolumeChart');
    if (!volumeCtx) {
        console.error('Daily volume chart canvas not found!');
        return;
    }
    
    dailyVolumeChart = new Chart(volumeCtx.getContext('2d'), {
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
    const responseCtx = document.getElementById('responseTimeChart');
    if (!responseCtx) {
        console.error('Response time chart canvas not found!');
        return;
    }
    
    responseTimeChart = new Chart(responseCtx.getContext('2d'), {
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
    
    console.log('All notification charts initialized successfully!');
}

// Load notification data
async function loadNotificationData() {
    try {
        const timeRange = document.getElementById('timeRange').value;
        console.log('Loading notification data for', timeRange, 'days');
        const response = await fetch(`/api/notifications/stats?days=${timeRange}`);
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Received notification data:', data);

        // Update stats cards
        document.getElementById('totalNotifications').textContent = data.total_notifications || 0;
        document.getElementById('deliveredNotifications').textContent = data.delivered_count || 0;
        document.getElementById('snoozedNotifications').textContent = data.snoozed_count || 0;
        document.getElementById('missedNotifications').textContent = data.missed_count || 0;

        // Update notification status chart
        if (notificationStatusChart) {
            notificationStatusChart.data.datasets[0].data = [
                data.delivered_count || 0,
                data.snoozed_count || 0,
                data.missed_count || 0,
                data.pending_count || 0
            ];
            notificationStatusChart.update();
        }

        // Update notification types chart
        if (notificationTypesChart) {
            notificationTypesChart.data.datasets[0].data = [
                data.hydration_count || 0,
                data.medication_count || 0
            ];
            notificationTypesChart.update();
        }

        // Update daily volume chart
        if (dailyVolumeChart && data.daily_volume && data.daily_volume.length > 0) {
            dailyVolumeChart.data.labels = data.daily_volume.map(item => item.date);
            dailyVolumeChart.data.datasets[0].data = data.daily_volume.map(item => item.count);
            dailyVolumeChart.update();
        }

        // Update response time chart
        if (responseTimeChart && data.response_times && data.response_times.length > 0) {
            responseTimeChart.data.labels = data.response_times.map(item => item.date);
            responseTimeChart.data.datasets[0].data = data.response_times.map(item => item.avg_response_time);
            responseTimeChart.update();
        }

        // Update recent notifications table
        updateNotificationsTable(data.recent_notifications || []);

    } catch (error) {
        console.error('Error loading notification data:', error);
        // Show error in UI
        document.getElementById('totalNotifications').textContent = 'Error';
        document.getElementById('deliveredNotifications').textContent = 'Error';
        document.getElementById('snoozedNotifications').textContent = 'Error';
        document.getElementById('missedNotifications').textContent = 'Error';
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
