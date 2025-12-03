@extends('layouts.app')

@section('title', 'Edit User')

@section('content')
<div class="max-w-3xl">
    <div class="mb-6">
        <h1 class="text-2xl font-bold">Edit User</h1>
        <p class="text-gray-500">Update user information and permissions</p>
    </div>

    @if ($errors->any())
    <div class="mb-4 p-4 rounded-md bg-red-50 text-red-700">Please fix the following errors:
        <ul class="mt-2 list-disc list-inside">
            @foreach ($errors->all() as $error)
            <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
    @endif

    <div class="card p-4 mb-6">
        <h3 class="font-semibold">User Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mt-3">
            <div><strong>User ID:</strong> {{ $user->id }}</div>
            <div><strong>Created:</strong> {{ $user->created_at->format('M j, Y g:i A') }}</div>
            <div><strong>Last Updated:</strong> {{ $user->updated_at->format('M j, Y g:i A') }}</div>
            <div><strong>Current Role:</strong> {{ ucfirst($user->role) }}</div>
        </div>
    </div>

    <div class="card p-6">
        <form method="POST" action="{{ route('admin.users.update', $user) }}">
            @csrf
            @method('PUT')

            <div class="mb-4">
                <label class="block font-semibold mb-2">Full Name <span class="text-red-600">*</span></label>
                <input type="text" name="name" value="{{ old('name', $user->name) }}" required class="w-full px-4 py-2 border rounded-md bg-gray-50" autofocus>
            </div>

            <div class="mb-4">
                <label class="block font-semibold mb-2">Email Address <span class="text-red-600">*</span></label>
                <input type="email" name="email" value="{{ old('email', $user->email) }}" required class="w-full px-4 py-2 border rounded-md bg-gray-50">
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="mb-4">
                    <label class="block font-semibold mb-2">New Password</label>
                    <input type="password" name="password" class="w-full px-4 py-2 border rounded-md bg-gray-50">
                    <div class="text-sm text-gray-500 mt-2">Leave blank to keep current password</div>
                </div>
                <div class="mb-4">
                    <label class="block font-semibold mb-2">Confirm New Password</label>
                    <input type="password" name="password_confirmation" class="w-full px-4 py-2 border rounded-md bg-gray-50">
                    <div class="text-sm text-gray-500 mt-2">Required if changing password</div>
                </div>
            </div>

            <div class="mb-4">
                <label class="block font-semibold mb-2">User Role <span class="text-red-600">*</span></label>
                <select name="role" required class="w-full px-4 py-2 border rounded-md bg-gray-50">
                    <option value="user" {{ old('role', $user->role) === 'user' ? 'selected' : '' }}>Regular User</option>
                    <option value="admin" {{ old('role', $user->role) === 'admin' ? 'selected' : '' }}>Administrator</option>
                </select>
                @if ($user->id === auth()->id())
                <div class="text-sm text-red-600 mt-2">Warning: You are editing your own account. Be careful not to remove your admin privileges.</div>
                @endif
            </div>

            <!-- Subscription Management Section -->
            <div class="border-t border-gray-200 pt-6 mt-6">
                <h3 class="text-lg font-semibold mb-4">Subscription Management</h3>

                @if($currentSubscription && $currentSubscription->isActive())
                <div class="mb-4 p-4 rounded-md bg-green-50 border border-green-200">
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        <div class="ml-3">
                            <h4 class="text-sm font-semibold text-green-900">Active Subscription</h4>
                            <p class="text-sm text-green-700 mt-1">
                                <strong>{{ $currentSubscription->plan->name }}</strong> -
                                Expires on {{ $currentSubscription->ends_at->format('F j, Y') }}
                                ({{ $currentSubscription->ends_at->diffForHumans() }})
                            </p>
                            @if($currentSubscription->payment_method === 'admin_grant')
                            <p class="text-xs text-green-600 mt-1">{{ $currentSubscription->payment_reference }}</p>
                            @endif
                        </div>
                    </div>
                </div>
                @else
                <div class="mb-4 p-4 rounded-md bg-gray-50 border border-gray-200">
                    <p class="text-sm text-gray-600">This user currently has no active subscription (Free tier).</p>
                </div>
                @endif

                <div class="mb-4">
                    <label class="block font-semibold mb-2">Grant Subscription</label>
                    <select name="subscription_plan_id" class="w-full px-4 py-2 border rounded-md bg-gray-50">
                        <option value="">No change (keep current)</option>
                        @foreach($subscriptionPlans as $plan)
                        <option value="{{ $plan->id }}">
                            {{ $plan->name }} - ₱{{ number_format($plan->price, 2) }}/{{ $plan->billing_period }}
                        </option>
                        @endforeach
                    </select>
                    <div class="text-sm text-gray-500 mt-2">Select a subscription plan to grant to this user</div>
                </div>

                <div class="mb-4">
                    <label class="block font-semibold mb-2">Subscription Duration (days)</label>
                    <input type="number" name="subscription_duration" value="30" min="1" max="365" class="w-full px-4 py-2 border rounded-md bg-gray-50">
                    <div class="text-sm text-gray-500 mt-2">Number of days the subscription will be active (default: 30 days)</div>
                </div>

                @if($currentSubscription && $currentSubscription->isActive())
                <div class="mb-4">
                    <label class="flex items-center">
                        <input type="checkbox" name="remove_subscription" value="1" class="mr-2">
                        <span class="text-sm font-semibold text-red-600">Remove current subscription</span>
                    </label>
                    <div class="text-sm text-gray-500 mt-1 ml-6">Check this to cancel the user's current subscription</div>
                </div>
                @endif
            </div>

            <div class="mt-6 flex items-center gap-3">
                <a href="{{ route('admin.dashboard') }}" class="px-4 py-2 rounded-md bg-gray-600 text-white">Cancel</a>
                <button type="submit" class="px-4 py-2 rounded-md bg-aqua text-white">Update User</button>
            </div>
        </form>
    </div>
</div>
@endsection