@extends('layouts.app')

@section('title', 'Medication Management')

@section('content')
<div class="min-h-screen bg-slate-50 py-4">
    <div class="max-w-7xl mx-auto px-6">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-slate-900">Medication Management</h1>
                <p class="text-slate-500 mt-2">Track medication schedules and adherence rates</p>
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
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 14H9c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Active Medications</p>
                    <p class="text-3xl font-bold text-slate-900" id="activeMedications">-</p>
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
                    <p class="text-3xl font-bold text-slate-900" id="adherenceRate">-</p>
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
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Upcoming Doses</p>
                    <p class="text-3xl font-bold text-slate-900" id="upcomingDoses">-</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-red-50 rounded-xl">
                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Missed Doses</p>
                    <p class="text-3xl font-bold text-slate-900" id="missedDoses">-</p>
                </div>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Adherence Chart -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="text-lg font-bold text-slate-900 mb-6">Adherence Rate</h3>
                <canvas id="adherenceChart" width="400" height="200"></canvas>
            </div>

            <!-- Medication Types Chart -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="text-lg font-bold text-slate-900 mb-6">Medication Types</h3>
                <canvas id="medicationTypesChart" width="400" height="200"></canvas>
            </div>
        </div>

        <!-- Weekly Adherence Trend Chart -->
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
            <h3 class="text-lg font-bold text-slate-900 mb-6">Weekly Adherence Trend</h3>
            <canvas id="weeklyAdherenceChart" width="800" height="300"></canvas>
        </div>

        <!-- Recent Medication History Table -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-slate-100">
                <h3 class="text-lg font-bold text-slate-900">Recent Medication History</h3>
            </div>
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold">Recent Medication History</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Time</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taken Time</th>
                        </tr>
                    </thead>
                    <tbody id="medicationHistoryTable" class="bg-white divide-y divide-gray-200">
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
    let adherenceChart, medicationTypesChart, weeklyAdherenceChart;

    // Initialize charts
    function initCharts() {
        console.log('Initializing medication charts...');

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded!');
            return;
        }

        // Adherence Chart
        const adherenceCtx = document.getElementById('adherenceChart');
        if (!adherenceCtx) {
            console.error('Adherence chart canvas not found!');
            return;
        }

        adherenceChart = new Chart(adherenceCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Taken', 'Missed', 'Snoozed'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(245, 158, 11, 0.8)'],
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

        // Medication Types Chart
        const typesCtx = document.getElementById('medicationTypesChart');
        if (!typesCtx) {
            console.error('Medication types chart canvas not found!');
            return;
        }

        medicationTypesChart = new Chart(typesCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Count',
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

        // Weekly Adherence Trend Chart
        const weeklyCtx = document.getElementById('weeklyAdherenceChart');
        if (!weeklyCtx) {
            console.error('Weekly adherence chart canvas not found!');
            return;
        }

        weeklyAdherenceChart = new Chart(weeklyCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Adherence Rate (%)',
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
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        console.log('All medication charts initialized successfully!');
    }

    // Load medication data
    async function loadMedicationData() {
        try {
            const timeRange = document.getElementById('timeRange').value;
            console.log('Loading medication data for', timeRange, 'days');
            const response = await fetch(`/api/medications/stats?days=${timeRange}`);
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Received medication data:', data);

            // Update stats cards
            document.getElementById('activeMedications').textContent = data.active_medications || 0;
            document.getElementById('adherenceRate').textContent = `${Math.round(data.adherence_rate || 0)}%`;
            document.getElementById('upcomingDoses').textContent = data.upcoming_doses || 0;
            document.getElementById('missedDoses').textContent = data.missed_doses || 0;

            // Update adherence chart
            if (adherenceChart) {
                adherenceChart.data.datasets[0].data = [
                    data.taken_count || 0,
                    data.missed_count || 0,
                    data.snoozed_count || 0
                ];
                adherenceChart.update();
            }

            // Update medication types chart
            if (medicationTypesChart && data.medication_types && data.medication_types.length > 0) {
                medicationTypesChart.data.labels = data.medication_types.map(item => item.type);
                medicationTypesChart.data.datasets[0].data = data.medication_types.map(item => item.count);
                medicationTypesChart.update();
            }

            // Update weekly adherence trend chart
            if (weeklyAdherenceChart && data.weekly_adherence && data.weekly_adherence.length > 0) {
                weeklyAdherenceChart.data.labels = data.weekly_adherence.map(item => item.week);
                weeklyAdherenceChart.data.datasets[0].data = data.weekly_adherence.map(item => item.adherence_rate);
                weeklyAdherenceChart.update();
            }

            // Update recent medication history table
            updateMedicationHistoryTable(data.recent_history || []);

        } catch (error) {
            console.error('Error loading medication data:', error);
            // Show error in UI
            document.getElementById('activeMedications').textContent = 'Error';
            document.getElementById('adherenceRate').textContent = 'Error';
            document.getElementById('upcomingDoses').textContent = 'Error';
            document.getElementById('missedDoses').textContent = 'Error';
        }
    }

    // Update medication history table
    function updateMedicationHistoryTable(history) {
        const tbody = document.getElementById('medicationHistoryTable');
        tbody.innerHTML = '';

        history.forEach(entry => {
            const statusColor = entry.status === 'taken' ? 'text-green-600' :
                entry.status === 'missed' ? 'text-red-600' : 'text-yellow-600';
            const statusText = entry.status === 'taken' ? 'Taken' :
                entry.status === 'missed' ? 'Missed' : 'Snoozed';

            const row = document.createElement('tr');
            row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${entry.user_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.medication_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.dosage}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${statusColor}">${statusText}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(entry.scheduled_time).toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.taken_time ? new Date(entry.taken_time).toLocaleString() : '-'}</td>
        `;
            tbody.appendChild(row);
        });
    }

    // Event listeners
    document.getElementById('timeRange').addEventListener('change', loadMedicationData);

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        initCharts();
        loadMedicationData();
    });
</script>
@endpush