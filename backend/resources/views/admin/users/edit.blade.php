@extends('layouts.app')

@section('title', 'Edit User')

@section('content')
<div class="min-h-screen bg-slate-50 py-4">
    <div class="max-w-2xl mx-auto px-6">
        <!-- Page Header -->
        <div class="mb-6">
            <div class="flex items-center gap-3 mb-4">
                <a href="{{ route('admin.users.index') }}" class="text-slate-500 hover:text-slate-700 font-medium">Users</a>
                <span class="text-slate-400">/</span>
                <span class="text-slate-900 font-medium">Edit</span>
            </div>
            <h1 class="text-3xl font-bold text-slate-900">Edit User</h1>
            <p class="text-slate-500 mt-2">Update user information and permissions</p>
        </div>

        <!-- Error Alert -->
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
                        <li class="text-sm text-red-700">{{ $error }}</li>\n @endforeach
                    </ul>
                </div>
            </div>
        </div>
        @endif

        <!-- User Info Card -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div class="px-8 py-8 border-b border-slate-100">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">User ID</p>
                        <p class="text-lg font-semibold text-slate-900 mt-1">{{ $user->id }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</p>
                        <p class="text-lg font-semibold text-slate-900 mt-1 capitalize">{{ $user->role }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</p>
                        <p class="text-sm text-slate-600 mt-1">{{ $user->created_at->format('M j, Y') }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Updated</p>
                        <p class="text-sm text-slate-600 mt-1">{{ $user->updated_at->format('M j, Y') }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Form Card -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="px-8 py-8">
                <form method="POST" action="{{ route('admin.users.update', $user) }}" class="space-y-6">
                    @csrf
                    @method('PUT')

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
                            autofocus
                            placeholder="John Doe"
                            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
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
                            placeholder="john@example.com"
                            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        @error('email')
                        <p class="mt-1.5 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Grid: Password Fields -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- New Password -->
                        <div>
                            <label for="password" class="block text-sm font-semibold text-slate-900 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                            <p class="text-xs text-slate-500 mt-1.5">Leave blank to keep current password</p>
                            @error('password')
                            <p class="mt-1.5 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Confirm New Password -->
                        <div>
                            <label for="password_confirmation" class="block text-sm font-semibold text-slate-900 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                id="password_confirmation"
                                name="password_confirmation"
                                placeholder="••••••••"
                                class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                            <p class="text-xs text-slate-500 mt-1.5">Required if changing password</p>
                        </div>
                    </div>

                    <!-- User Role -->
                    <div>
                        <label for="role" class="block text-sm font-semibold text-slate-900 mb-2">
                            User Role <span class="text-red-600">*</span>
                        </label>
                        <select
                            id="role"
                            name="role"
                            required
                            class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                            <option value="user" {{ old('role', $user->role) === 'user' ? 'selected' : '' }}>User</option>
                            <option value="admin" {{ old('role', $user->role) === 'admin' ? 'selected' : '' }}>Administrator</option>
                        </select>
                        @if ($user->id === auth()->id())
                        <p class="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 4v2M7.08 6.24a9 9 0 110 17.52M6.24 7.08a9 9 0 010 17.52"></path>
                            </svg>
                            Warning: You are editing your own account. Be careful with role changes.
                        </p>
                        @endif
                    </div>

                    <!-- Subscription Management -->
                    <div class="border-t border-slate-100 pt-6">
                        <h3 class="text-lg font-semibold text-slate-900 mb-4">Subscription Management</h3>

                        @if($currentSubscription && $currentSubscription->isActive())
                        <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div class="flex gap-3">
                                <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                                <div>
                                    <h4 class="font-semibold text-green-900">Active Subscription</h4>
                                    <p class="text-sm text-green-700 mt-1">
                                        <strong>{{ $currentSubscription->plan->name }}</strong> - Expires {{ $currentSubscription->ends_at->diffForHumans() }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        @else
                        <div class="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <p class="text-sm text-slate-600">This user currently has no active subscription (Free tier).</p>
                        </div>
                        @endif

                        <!-- Grant Subscription -->
                        <div class="mb-4">
                            <label for="subscription_plan_id" class="block text-sm font-semibold text-slate-900 mb-2">
                                Grant Subscription
                            </label>
                            <select
                                id="subscription_plan_id"
                                name="subscription_plan_id"
                                class="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                <option value="">No change (keep current)</option>
                                @foreach($subscriptionPlans as $plan)
                                <option value="{{ $plan->id }}">
                                    {{ $plan->name }} - ₱{{ number_format($plan->price, 2) }}/{{ $plan->billing_period }}
                                </option>
                                @endforeach
                            </select>
                            <p class="text-xs text-slate-500 mt-1.5">Select a plan to grant this user a subscription</p>
                        </div>

                        <!-- Subscription Duration -->
                        <div class="mb-4">
                            <label for="subscription_duration" class="block text-sm font-semibold text-slate-900 mb-2">
                                Subscription Duration (days)
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

                        <!-- Remove Subscription Option -->
                        @if($currentSubscription && $currentSubscription->isActive())
                        <div>
                            <label class="flex items-center p-3 rounded-lg border border-red-200 bg-red-50">
                                <input type="checkbox" name="remove_subscription" value="1" class="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500">
                                <span class="ml-2 text-sm font-semibold text-red-600">Remove current subscription</span>
                            </label>
                            <p class="text-xs text-slate-500 mt-1.5 ml-3">Check this to cancel the user's subscription</p>
                        </div>
                        @endif
                    </div>

                    <!-- Form Actions -->
                    <div class="flex items-center gap-3 pt-6 border-t border-slate-100">
                        <a href="{{ route('admin.users.index') }}" class="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                            Cancel
                        </a>
                        <button type="submit" class="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors shadow-sm">
                            Update User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection