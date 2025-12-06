@extends('layouts.app')

@section('title', 'Edit User - ' . $user->name)

@section('content')
<div class="min-h-screen bg-slate-50 py-4">
    <div class="max-w-6xl mx-auto px-6">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
                <div class="flex items-center gap-3 mb-4">
                    <a href="{{ route('admin.users.index') }}" class="text-slate-500 hover:text-slate-700 font-medium">Users</a>
                    <span class="text-slate-400">/</span>
                    <span class="text-slate-900 font-medium">{{ $user->name }}</span>
                </div>
                <h1 class="text-3xl font-bold text-slate-900">Edit User: {{ $user->name }}</h1>
                <p class="text-slate-500 mt-1">{{ $user->email }}</p>
            </div>
            <div class="flex items-center gap-3 mt-6 md:mt-0">
                <a href="{{ route('admin.users.index') }}" class="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back
                </a>
            </div>
        </div>

        <!-- Success Alert -->
        @if (session('success'))
        <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div>
                <h3 class="font-semibold text-green-800">Success</h3>
                <p class="text-sm text-green-700">{{ session('success') }}</p>
            </div>
        </div>
        @endif

        <!-- User Info Card with Status -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div class="px-8 py-8 border-b border-slate-100">
                <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">User ID</p>
                        <p class="text-lg font-semibold text-slate-900 mt-2">{{ $user->id }}</p>
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
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</p>
                        <div class="mt-2">
                            @php
                            $bgColorClass = match($user->status) {
                            'active' => 'bg-green-50 text-green-700',
                            'suspended' => 'bg-yellow-50 text-yellow-700',
                            'banned' => 'bg-red-50 text-red-700',
                            'unverified' => 'bg-gray-50 text-gray-700',
                            default => 'bg-slate-50 text-slate-700'
                            };
                            $dotColor = match($user->status) {
                            'active' => 'bg-green-400',
                            'suspended' => 'bg-yellow-400',
                            'banned' => 'bg-red-400',
                            'unverified' => 'bg-gray-400',
                            default => 'bg-slate-400'
                            };
                            @endphp
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold {{ $bgColorClass }}">
                                <span class="w-2 h-2 rounded-full {{ $dotColor }}"></span>
                                {{ ucfirst($user->status) }}
                            </span>
                        </div>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Member Since</p>
                        <p class="text-sm font-medium text-slate-600 mt-2">{{ $user->created_at->format('M j, Y') }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Updated</p>
                        <p class="text-sm font-medium text-slate-600 mt-2">{{ $user->updated_at->format('M j, Y') }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Validation Errors Alert -->
        @if ($errors->any())
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex gap-3">
                <svg class="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <h3 class="font-semibold text-red-800 mb-2">Please fix the following errors:</h3>
                    <ul class="space-y-1">
                        @foreach ($errors->all() as $error)
                        <li class="text-sm text-red-700">{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
        @endif

        <!-- Tabbed Interface -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <!-- Tab Navigation -->
            <div class="border-b border-slate-100 overflow-x-auto">
                <div class="flex flex-wrap md:flex-nowrap" role="tablist">
                    <button onclick="showTab(event, 'account')" id="account-tab" role="tab" aria-selected="true" class="tab-button px-6 py-4 text-sm font-semibold text-blue-600 border-b-2 border-blue-500 hover:text-slate-900 transition-colors whitespace-nowrap">
                        <span class="flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Account Info
                        </span>
                    </button>
                    <button onclick="showTab(event, 'health')" id="health-tab" role="tab" aria-selected="false" class="tab-button px-6 py-4 text-sm font-semibold text-slate-600 border-b-2 border-transparent hover:border-slate-300 hover:text-slate-900 transition-colors whitespace-nowrap">
                        <span class="flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                            Health
                        </span>
                    </button>
                    <button onclick="showTab(event, 'subscription')" id="subscription-tab" role="tab" aria-selected="false" class="tab-button px-6 py-4 text-sm font-semibold text-slate-600 border-b-2 border-transparent hover:border-slate-300 hover:text-slate-900 transition-colors whitespace-nowrap">
                        <span class="flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V7a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                            Subscription
                        </span>
                    </button>
                    <button onclick="showTab(event, 'activity')" id="activity-tab" role="tab" aria-selected="false" class="tab-button px-6 py-4 text-sm font-semibold text-slate-600 border-b-2 border-transparent hover:border-slate-300 hover:text-slate-900 transition-colors whitespace-nowrap">
                        <span class="flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Activity
                        </span>
                    </button>
                </div>
            </div>

            <!-- Account Info Tab -->
            <div id="account-tab-content" class="tab-content p-8">
                <form method="POST" action="{{ route('admin.users.update', $user) }}" class="space-y-6">
                    @csrf
                    @method('PUT')

                    <!-- Account Status Section -->
                    <div class="border-b border-slate-100 pb-6">
                        <h3 class="text-lg font-semibold text-slate-900 mb-4">Account Status</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="status" class="block text-sm font-semibold text-slate-900 mb-2">
                                    User Status <span class="text-red-600">*</span>
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                    <option value="active" {{ $user->status === 'active' ? 'selected' : '' }}>Active</option>
                                    <option value="suspended" {{ $user->status === 'suspended' ? 'selected' : '' }}>Suspended</option>
                                    <option value="banned" {{ $user->status === 'banned' ? 'selected' : '' }}>Banned</option>
                                    <option value="unverified" {{ $user->status === 'unverified' ? 'selected' : '' }}>Unverified</option>
                                </select>
                                @error('status')
                                <p class="mt-1.5 text-sm text-red-600">{{ $message }}</p>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <!-- Personal Information -->
                    <div class="border-b border-slate-100 pb-6">
                        <h3 class="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Full Name -->
                            <div>
                                <label for="name" class="block text-sm font-semibold text-slate-900 mb-2">
                                    Full Name <span class="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value="{{ old('name', $user->name) }}"
                                    required
                                    class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                @error('name')
                                <p class="mt-1.5 text-sm text-red-600">{{ $message }}</p>
                                @enderror
                            </div>

                            <!-- Email Address -->
                            <div>
                                <label for="email" class="block text-sm font-semibold text-slate-900 mb-2">
                                    Email Address <span class="text-red-600">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value="{{ old('email', $user->email) }}"
                                    required
                                    class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                @error('email')
                                <p class="mt-1.5 text-sm text-red-600">{{ $message }}</p>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <!-- Permissions -->
                    <div class="border-b border-slate-100 pb-6">
                        <h3 class="text-lg font-semibold text-slate-900 mb-4">Permissions</h3>
                        <div>
                            <label for="role" class="block text-sm font-semibold text-slate-900 mb-2">
                                User Role <span class="text-red-600">*</span>
                            </label>
                            <select
                                id="role"
                                name="role"
                                required
                                class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                <option value="user" {{ $user->role === 'user' ? 'selected' : '' }}>User</option>
                                <option value="admin" {{ $user->role === 'admin' ? 'selected' : '' }}>Administrator</option>
                            </select>
                            @if ($user->id === auth()->id())
                            <p class="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 4v2M7.08 6.24a9 9 0 110 17.52M6.24 7.08a9 9 0 010 17.52"></path>
                                </svg>
                                Warning: You are editing your own account. Be careful with role changes.
                            </p>
                            @endif
                            @error('role')
                            <p class="mt-1.5 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <!-- Password Reset -->
                    <div class="border-b border-slate-100 pb-6">
                        <h3 class="text-lg font-semibold text-slate-900 mb-4">Password Management</h3>
                        <p class="text-sm text-slate-600 mb-4">Instead of setting a password manually, send the user a password reset email. They can click the link to create their own secure password.</p>
                        <form method="POST" action="{{ route('admin.users.send-password-reset', $user) }}" class="inline">
                            @csrf
                            <button type="submit" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors shadow-sm">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                Send Password Reset Email
                            </button>
                        </form>
                    </div>

                    <!-- Medical History -->
                    <div class="pb-6">
                        <h3 class="text-lg font-semibold text-slate-900 mb-4">Medical History</h3>
                        <label for="medical_history" class="block text-sm font-semibold text-slate-900 mb-2">
                            Medical History Notes
                        </label>
                        <textarea
                            id="medical_history"
                            name="medical_history"
                            rows="4"
                            placeholder="Enter any relevant medical history for this user..."
                            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">{{ old('medical_history', $user->medical_history) }}</textarea>
                        @error('medical_history')
                        <p class="mt-1.5 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Form Actions -->
                    <div class="flex items-center gap-3 pt-6 border-t border-slate-100">
                        <a href="{{ route('admin.users.index') }}" class="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                            Cancel
                        </a>
                        <button type="submit" class="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors shadow-sm">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            <!-- Health Profile Tab -->
            <div id="health-tab-content" class="tab-content hidden p-8">
                <div class="space-y-6">
                    <h3 class="text-lg font-semibold text-slate-900">Health Profile (Read-Only)</h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Weight & Height -->
                        <div class="bg-slate-50 rounded-lg p-6">
                            <h4 class="font-semibold text-slate-900 mb-4">Physical Measurements</h4>
                            <div class="space-y-3">
                                <div>
                                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight</p>
                                    <p class="text-lg font-semibold text-slate-900 mt-1">
                                        {{ $user->weight ? $user->weight . ' ' . ($user->weight_unit ?? 'kg') : 'Not provided' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Age</p>
                                    <p class="text-lg font-semibold text-slate-900 mt-1">
                                        {{ $user->age ?? 'Not provided' }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Exercise Frequency -->
                        <div class="bg-slate-50 rounded-lg p-6">
                            <h4 class="font-semibold text-slate-900 mb-4">Lifestyle</h4>
                            <div class="space-y-3">
                                <div>
                                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exercise Frequency</p>
                                    <p class="text-lg font-semibold text-slate-900 mt-1">
                                        {{ $user->exercise_frequency ? ucfirst($user->exercise_frequency) : 'Not provided' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Climate Setting</p>
                                    <p class="text-lg font-semibold text-slate-900 mt-1">
                                        {{ $user->climate ? ucfirst($user->climate) : 'Not provided' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Emergency Contact -->
                        <div class="bg-slate-50 rounded-lg p-6">
                            <h4 class="font-semibold text-slate-900 mb-4">Emergency Contact</h4>
                            <div class="space-y-3">
                                <div>
                                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</p>
                                    <p class="text-lg font-semibold text-slate-900 mt-1">
                                        {{ $user->emergency_contact_name ?? 'Not provided' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</p>
                                    <p class="text-lg font-semibold text-slate-900 mt-1">
                                        {{ $user->emergency_contact_phone ?? 'Not provided' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Relationship</p>
                                    <p class="text-lg font-semibold text-slate-900 mt-1">
                                        {{ $user->emergency_contact ?? 'Not provided' }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Hydration Goal -->
                        <div class="bg-slate-50 rounded-lg p-6">
                            <h4 class="font-semibold text-slate-900 mb-4">Health Goals</h4>
                            <div class="space-y-3">
                                <div>
                                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Hydration Goal</p>
                                    <p class="text-lg font-semibold text-slate-900 mt-1">
                                        {{ $user->hydration_goal ? $user->hydration_goal . ' ml' : 'Not set' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Medical History -->
                    @if($user->medical_history)
                    <div class="bg-blue-50 rounded-lg p-6">
                        <h4 class="font-semibold text-slate-900 mb-2">Medical History</h4>
                        <p class="text-slate-700 text-sm leading-relaxed">{{ $user->medical_history }}</p>
                    </div>
                    @else
                    <div class="bg-slate-50 rounded-lg p-6 text-center">
                        <p class="text-slate-500 text-sm">No medical history has been recorded yet.</p>
                    </div>
                    @endif
                </div>
            </div>

            <!-- Subscription Tab -->
            <div id="subscription-tab-content" class="tab-content hidden p-8">
                <div class="space-y-6">
                    <h3 class="text-lg font-semibold text-slate-900 mb-6">Subscription Management</h3>

                    <!-- Current Subscription -->
                    @if($currentSubscription && $currentSubscription->isActive())
                    <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div class="flex gap-3">
                            <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                            <div>
                                <h4 class="font-semibold text-green-900">Active Subscription</h4>
                                <p class="text-sm text-green-700 mt-1">
                                    <strong>{{ $currentSubscription->plan->name }}</strong> - Expires {{ $currentSubscription->ends_at->format('M j, Y') }} ({{ $currentSubscription->ends_at->diffForHumans() }})
                                </p>
                                <p class="text-xs text-green-600 mt-1">Auto-renewal: {{ $currentSubscription->auto_renewal ? 'Enabled' : 'Disabled' }}</p>
                            </div>
                        </div>
                    </div>
                    @else
                    <div class="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p class="text-sm text-slate-600">This user currently has no active subscription (Free tier).</p>
                    </div>
                    @endif

                    <!-- Grant Subscription Form -->
                    <form method="POST" action="{{ route('admin.users.update', $user) }}" class="bg-slate-50 rounded-lg p-6">
                        @csrf
                        @method('PUT')

                        <h4 class="font-semibold text-slate-900 mb-4">Grant Subscription</h4>
                        <div class="space-y-4">
                            <div>
                                <label for="subscription_plan_id" class="block text-sm font-semibold text-slate-900 mb-2">
                                    Subscription Plan
                                </label>
                                <select
                                    id="subscription_plan_id"
                                    name="subscription_plan_id"
                                    class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                    <option value="">Select a plan to grant</option>
                                    @foreach($subscriptionPlans as $plan)
                                    <option value="{{ $plan->id }}">
                                        {{ $plan->name }} - ₱{{ number_format($plan->price, 2) }}/{{ $plan->billing_period }}
                                    </option>
                                    @endforeach
                                </select>
                            </div>

                            <div>
                                <label for="subscription_duration" class="block text-sm font-semibold text-slate-900 mb-2">
                                    Duration (days)
                                </label>
                                <input
                                    type="number"
                                    id="subscription_duration"
                                    name="subscription_duration"
                                    value="30"
                                    min="1"
                                    max="365"
                                    class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                <p class="text-xs text-slate-500 mt-1.5">Default: 30 days</p>
                            </div>

                            <button type="submit" class="w-full px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors shadow-sm">
                                Grant Subscription
                            </button>
                        </div>
                    </form>

                    <!-- Transaction History -->
                    @if($transactionHistory->count() > 0)
                    <div>
                        <h4 class="font-semibold text-slate-900 mb-4">Transaction History</h4>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Transaction ID</th>
                                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Plan</th>
                                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Method</th>
                                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    @foreach($transactionHistory as $transaction)
                                    <tr class="hover:bg-slate-50 transition-colors">
                                        <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ $transaction->transaction_id }}</td>
                                        <td class="px-4 py-3 text-sm text-slate-600">{{ $transaction->subscription?->plan?->name ?? 'N/A' }}</td>
                                        <td class="px-4 py-3 text-sm font-medium text-slate-900">₱{{ number_format($transaction->amount, 2) }}</td>
                                        <td class="px-4 py-3 text-sm text-slate-600">{{ ucfirst(str_replace('_', ' ', $transaction->payment_method)) }}</td>
                                        <td class="px-4 py-3 text-sm">
                                            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold {{ $transaction->status === 'completed' ? 'bg-green-50 text-green-700' : ($transaction->status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700') }}">
                                                {{ ucfirst($transaction->status) }}
                                            </span>
                                        </td>
                                        <td class="px-4 py-3 text-sm text-slate-600">{{ $transaction->created_at->format('M j, Y') }}</td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                    @else
                    <div class="bg-slate-50 rounded-lg p-6 text-center">
                        <p class="text-slate-500 text-sm">No transaction history yet.</p>
                    </div>
                    @endif

                    <!-- Remove Subscription -->
                    @if($currentSubscription && $currentSubscription->isActive())
                    <form method="POST" action="{{ route('admin.users.update', $user) }}" class="bg-red-50 rounded-lg p-6 border border-red-200">
                        @csrf
                        @method('PUT')

                        <div class="flex items-start justify-between">
                            <div>
                                <h4 class="font-semibold text-red-900">Remove Current Subscription</h4>
                                <p class="text-sm text-red-700 mt-1">This will immediately cancel the active subscription.</p>
                            </div>
                            <div class="flex gap-3">
                                <input type="hidden" name="remove_subscription" value="1">
                                <button type="submit" class="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium transition-colors text-sm">
                                    Remove Subscription
                                </button>
                            </div>
                        </div>
                    </form>
                    @endif
                </div>
            </div>

            <!-- Activity Log Tab -->
            <div id="activity-tab-content" class="tab-content hidden p-8">
                <div class="space-y-6">
                    <h3 class="text-lg font-semibold text-slate-900 mb-6">Activity Log</h3>

                    <!-- Last Login Info -->
                    @if($lastLogin)
                    <div class="bg-blue-50 rounded-lg p-6 border border-blue-200">
                        <h4 class="font-semibold text-slate-900 mb-3">Last Login</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</p>
                                <p class="text-sm font-medium text-slate-900 mt-1">{{ $lastLogin->created_at->format('M j, Y H:i:s') }}</p>
                                <p class="text-xs text-slate-600 mt-0.5">{{ $lastLogin->created_at->diffForHumans() }}</p>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Address</p>
                                <p class="text-sm font-medium text-slate-900 mt-1">{{ $lastLogin->ip_address ?? 'Not recorded' }}</p>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">App Version</p>
                                <p class="text-sm font-medium text-slate-900 mt-1">{{ $lastLogin->app_version ?? 'Not recorded' }}</p>
                            </div>
                        </div>
                    </div>
                    @else
                    <div class="bg-slate-50 rounded-lg p-6 text-center">
                        <p class="text-slate-500 text-sm">User has never logged in.</p>
                    </div>
                    @endif

                    <!-- Last Sync Info -->
                    <div class="bg-slate-50 rounded-lg p-6">
                        <h4 class="font-semibold text-slate-900 mb-3">Recent Activity</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Sync</p>
                                <p class="text-sm font-medium text-slate-900 mt-1">{{ $user->last_sync_at ? $user->last_sync_at->format('M j, Y H:i:s') : 'Never' }}</p>
                                @if($user->last_sync_at)
                                <p class="text-xs text-slate-600 mt-0.5">{{ $user->last_sync_at->diffForHumans() }}</p>
                                @endif
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest App Version</p>
                                <p class="text-sm font-medium text-slate-900 mt-1">{{ $user->last_app_version ?? 'Not recorded' }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Activity List -->
                    @if($activityLogs->count() > 0)
                    <div>
                        <h4 class="font-semibold text-slate-900 mb-4">Recent Events</h4>
                        <div class="space-y-3">
                            @foreach($activityLogs as $log)
                            <div class="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-medium text-slate-900">{{ ucfirst(str_replace('_', ' ', $log->activity_type)) }}</p>
                                        @if($log->details)
                                        <p class="text-sm text-slate-600 mt-1">{{ $log->details }}</p>
                                        @endif
                                        <div class="flex gap-4 mt-2 text-xs text-slate-500">
                                            @if($log->ip_address)
                                            <span>IP: {{ $log->ip_address }}</span>
                                            @endif
                                            @if($log->app_version)
                                            <span>Version: {{ $log->app_version }}</span>
                                            @endif
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm text-slate-600">{{ $log->created_at->format('M j') }}</p>
                                        <p class="text-xs text-slate-500">{{ $log->created_at->format('H:i') }}</p>
                                    </div>
                                </div>
                            </div>
                            @endforeach
                        </div>
                    </div>
                    @else
                    <div class="bg-slate-50 rounded-lg p-6 text-center">
                        <p class="text-slate-500 text-sm">No activity recorded yet.</p>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-red-50 rounded-2xl border border-red-200 shadow-sm overflow-hidden mt-6">
            <div class="px-8 py-8">
                <h3 class="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
                <p class="text-sm text-red-700 mb-6">Permanent actions that cannot be undone</p>

                <!-- Delete Account Button -->
                <form method="POST" action="{{ route('admin.users.destroy', $user) }}" onsubmit="return confirmDelete()">
                    @csrf
                    @method('DELETE')

                    @if ($user->id === auth()->id())
                    <div class="p-4 bg-red-100 rounded-lg border border-red-300 text-red-900 text-sm">
                        You cannot delete your own account.
                    </div>
                    @else
                    <button type="submit" class="px-6 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium transition-colors shadow-sm inline-flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete Account
                    </button>
                    @endif
                </form>
            </div>
        </div>
    </div>
</div>

<script>
    function showTab(event, tabName) {
        // Prevent default link behavior
        event.preventDefault();

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Remove active styles from all tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('border-blue-500', 'text-blue-600');
            button.classList.add('border-transparent', 'text-slate-600');
        });

        // Show selected tab content
        const contentId = tabName + '-tab-content';
        document.getElementById(contentId).classList.remove('hidden');

        // Add active styles to clicked button
        event.target.closest('.tab-button').classList.remove('border-transparent', 'text-slate-600');
        event.target.closest('.tab-button').classList.add('border-blue-500', 'text-blue-600');
    }

    function confirmDelete() {
        return confirm('Are you absolutely sure you want to delete this user account? This action is irreversible and all associated data will be permanently deleted.');
    }
</script>
@endsection