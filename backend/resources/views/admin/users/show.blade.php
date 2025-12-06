@extends('layouts.app')

@section('title', 'User Details - ' . $user->name)

@section('content')
<div class="min-h-screen bg-slate-50 py-4">
    <div class="max-w-7xl mx-auto px-6">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
                <div class="flex items-center gap-3 mb-4">
                    <a href="{{ route('admin.users.index') }}" class="text-slate-500 hover:text-slate-700 font-medium">Users</a>
                    <span class="text-slate-400">/</span>
                    <span class="text-slate-900 font-medium">{{ $user->name }}</span>
                </div>
                <h1 class="text-3xl font-bold text-slate-900">{{ $user->name }}</h1>
                <p class="text-slate-500 mt-1">{{ $user->email }}</p>
            </div>
            <div class="flex items-center gap-3 mt-6 md:mt-0">
                <a href="{{ route('admin.users.edit', $user) }}" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit User
                </a>
                <a href="{{ route('admin.users.index') }}" class="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back
                </a>
            </div>
        </div>

        <!-- User Info Card -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
            <div class="px-8 py-8 grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</p>
                    <p class="text-lg font-semibold text-slate-900 mt-2">{{ $user->name }}</p>
                </div>
                <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</p>
                    <p class="text-sm font-medium text-slate-600 mt-2 break-all">{{ $user->email }}</p>
                </div>
                <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</p>
                    <div class="mt-2">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold {{ $user->role === 'admin' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-700' }}">
                            <span class="w-2 h-2 rounded-full {{ $user->role === 'admin' ? 'bg-blue-400' : 'bg-slate-400' }}"></span>
                            {{ ucfirst($user->role) }}
                        </span>
                    </div>
                </div>
                <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Member Since</p>
                    <p class="text-sm font-medium text-slate-600 mt-2">{{ $user->created_at->format('M j, Y') }}</p>
                </div>
                <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subscription</p>
                    <div class="mt-2">
                        @if($currentSubscription && $currentSubscription->isActive())
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                            <span class="w-2 h-2 rounded-full bg-green-400"></span>
                            {{ $currentSubscription->plan->name }}
                        </span>
                        <p class="text-xs text-slate-500 mt-1">Exp. {{ $currentSubscription->ends_at->format('M j, Y') }}</p>
                        @else
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                            Free
                        </span>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-blue-50 rounded-lg">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hydration Entries</p>
                        <p class="text-2xl font-bold text-slate-900 mt-1">{{ $totalHydrationEntries }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-green-50 rounded-lg">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 14H9c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medications</p>
                        <p class="text-2xl font-bold text-slate-900 mt-1">{{ $totalMedicationEntries }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-purple-50 rounded-lg">
                        <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L16 7l-4 4-4-4z"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notifications</p>
                        <p class="text-2xl font-bold text-slate-900 mt-1">{{ $totalNotifications }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-amber-50 rounded-lg">
                        <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Activity</p>
                        <p class="text-2xl font-bold text-slate-900 mt-1">{{ $recentActivity }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <!-- Tab Navigation -->
            <div class="border-b border-slate-100">
                <div class="flex" role="tablist">
                    <button onclick="showTab('hydration')" id="hydration-tab" role="tab" aria-selected="true" class="tab-button flex-1 md:flex-none px-6 py-4 text-sm font-semibold text-slate-600 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors active-tab">
                        <span class="flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                            </svg>
                            Hydration
                        </span>
                    </button>
                    <button onclick="showTab('medication')" id="medication-tab" role="tab" aria-selected="false" class="tab-button flex-1 md:flex-none px-6 py-4 text-sm font-semibold text-slate-600 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors">
                        <span class="flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.228 6.228 2 10.228 2 15s4.228 8.772 10 8.772c5.772 0 10-3.928 10-8.772 0-4.772-4.228-8.747-10-8.747z"></path>
                            </svg>
                            Medications
                        </span>
                    </button>
                    <button onclick="showTab('notifications')" id="notifications-tab" role="tab" aria-selected="false" class="tab-button flex-1 md:flex-none px-6 py-4 text-sm font-semibold text-slate-600 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors">
                        <span class="flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L16 7l-4 4-4-4z"></path>
                            </svg>
                            Notifications
                        </span>
                    </button>
                </div>
            </div>

            <!-- Hydration Tab -->
            <div id="hydration-content" class="tab-content p-8">
                <h3 class="text-lg font-semibold text-slate-900 mb-6">Recent Hydration Entries</h3>
                @if($hydrationEntries->count() > 0)
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-slate-200">
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Goal</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Progress</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @foreach($hydrationEntries as $entry)
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ $entry->amount }}ml</td>
                                <td class="px-4 py-3 text-sm text-slate-600">{{ $entry->goal }}ml</td>
                                <td class="px-4 py-3 text-sm">
                                    @php
                                    $progress = $entry->goal > 0 ? round(($entry->amount / $entry->goal) * 100) : 0;
                                    $color = $progress >= 100 ? 'text-green-600' : ($progress >= 75 ? 'text-amber-600' : 'text-red-600');
                                    @endphp
                                    <span class="{{ $color }} font-semibold">{{ $progress }}%</span>
                                </td>
                                <td class="px-4 py-3 text-sm text-slate-600">{{ $entry->created_at->format('M j, Y g:i A') }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                @else
                <p class="text-center text-slate-500 py-8">No hydration entries found.</p>
                @endif
            </div>

            <!-- Medication Tab -->
            <div id="medication-content" class="tab-content hidden p-8">
                <h3 class="text-lg font-semibold text-slate-900 mb-6">Active Medications</h3>
                @if($medications->count() > 0)
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    @foreach($medications as $medication)
                    <div class="border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition">
                        <h4 class="font-semibold text-slate-900">{{ $medication->name }}</h4>
                        <div class="mt-3 space-y-2 text-sm text-slate-600">
                            <p><span class="font-medium">Dosage:</span> {{ $medication->dosage }}</p>
                            <p><span class="font-medium">Frequency:</span> {{ $medication->frequency }}</p>
                            <p><span class="font-medium">Start Date:</span> {{ $medication->start_date ? \Carbon\Carbon::parse($medication->start_date)->format('M j, Y') : 'N/A' }}</p>
                        </div>
                    </div>
                    @endforeach
                </div>
                @endif

                <h3 class="text-lg font-semibold text-slate-900 mb-6">Recent Medication History</h3>
                @if($medicationHistory->count() > 0)
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-slate-200">
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Medication</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Dosage</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Scheduled</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Taken</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @foreach($medicationHistory as $history)
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ $history->medication_name }}</td>
                                <td class="px-4 py-3 text-sm text-slate-600">{{ $history->dosage }}</td>
                                <td class="px-4 py-3 text-sm">
                                    @php
                                    $statusColor = $history->status === 'taken' ? 'text-green-600' :
                                    ($history->status === 'missed' ? 'text-red-600' : 'text-amber-600');
                                    @endphp
                                    <span class="{{ $statusColor }} font-semibold">{{ ucfirst($history->status) }}</span>
                                </td>
                                <td class="px-4 py-3 text-sm text-slate-600">{{ \Carbon\Carbon::parse($history->scheduled_time)->format('M j, Y g:i A') }}</td>
                                <td class="px-4 py-3 text-sm text-slate-600">{{ $history->taken_time ? \Carbon\Carbon::parse($history->taken_time)->format('M j, Y g:i A') : '-' }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                @else
                <p class="text-center text-slate-500 py-8">No medication history found.</p>
                @endif
            </div>

            <!-- Notifications Tab -->
            <div id="notifications-content" class="tab-content hidden p-8">
                <h3 class="text-lg font-semibold text-slate-900 mb-6">Recent Notifications</h3>
                @if($notifications->count() > 0)
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-slate-200">
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Scheduled</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Created</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @foreach($notifications as $notification)
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-4 py-3 text-sm text-slate-900 font-medium">{{ ucfirst($notification->type) }}</td>
                                <td class="px-4 py-3 text-sm text-slate-600">{{ $notification->title }}</td>
                                <td class="px-4 py-3 text-sm">
                                    @php
                                    $statusColor = $notification->status === 'delivered' ? 'text-green-600' :
                                    ($notification->status === 'missed' ? 'text-red-600' :
                                    ($notification->status === 'snoozed' ? 'text-amber-600' : 'text-blue-600'));
                                    @endphp
                                    <span class="{{ $statusColor }} font-semibold">{{ ucfirst($notification->status) }}</span>
                                </td>
                                <td class="px-4 py-3 text-sm text-slate-600">{{ $notification->scheduled_at ? \Carbon\Carbon::parse($notification->scheduled_at)->format('M j, Y g:i A') : '-' }}</td>
                                <td class="px-4 py-3 text-sm text-slate-600">{{ $notification->created_at->format('M j, Y g:i A') }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                @else
                <p class="text-center text-slate-500 py-8">No notifications found.</p>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    function showTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active-tab', 'border-blue-500', 'text-blue-600');
            button.classList.add('border-transparent', 'text-slate-600');
        });

        // Show selected tab content
        document.getElementById(tabName + '-content').classList.remove('hidden');

        // Add active class to selected tab button
        const activeButton = document.getElementById(tabName + '-tab');
        activeButton.classList.add('active-tab', 'border-blue-500', 'text-blue-600');
        activeButton.classList.remove('border-transparent', 'text-slate-600');
    }
</script>
@endpush