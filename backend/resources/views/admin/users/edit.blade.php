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

                <div class="mt-6 flex items-center gap-3">
                    <a href="{{ route('admin.dashboard') }}" class="px-4 py-2 rounded-md bg-gray-600 text-white">Cancel</a>
                    <button type="submit" class="px-4 py-2 rounded-md bg-aqua text-white">Update User</button>
                </div>
            </form>
        </div>
    </div>
@endsection