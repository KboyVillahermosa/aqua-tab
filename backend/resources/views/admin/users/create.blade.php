@extends('layouts.app')

@section('title', 'Create User')

@section('content')
    <div class="max-w-3xl">
        <div class="mb-6">
            <h1 class="text-2xl font-bold">Create New User</h1>
            <p class="text-gray-500">Add a new user to the Aqua health management system</p>
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

        <div class="card p-6">
            <form method="POST" action="{{ route('admin.users.store') }}">
                @csrf
                
                <div class="mb-4">
                    <label class="block font-semibold mb-2">Full Name <span class="text-red-600">*</span></label>
                    <input type="text" name="name" value="{{ old('name') }}" required class="w-full px-4 py-2 border rounded-md bg-gray-50" autofocus>
                </div>

                <div class="mb-4">
                    <label class="block font-semibold mb-2">Email Address <span class="text-red-600">*</span></label>
                    <input type="email" name="email" value="{{ old('email') }}" required class="w-full px-4 py-2 border rounded-md bg-gray-50">
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="mb-4">
                        <label class="block font-semibold mb-2">Password <span class="text-red-600">*</span></label>
                        <input type="password" name="password" required class="w-full px-4 py-2 border rounded-md bg-gray-50">
                    </div>
                    <div class="mb-4">
                        <label class="block font-semibold mb-2">Confirm Password <span class="text-red-600">*</span></label>
                        <input type="password" name="password_confirmation" required class="w-full px-4 py-2 border rounded-md bg-gray-50">
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block font-semibold mb-2">User Role <span class="text-red-600">*</span></label>
                    <select name="role" required class="w-full px-4 py-2 border rounded-md bg-gray-50">
                        <option value="">Select a role</option>
                        <option value="user" {{ old('role') === 'user' ? 'selected' : '' }}>Regular User</option>
                        <option value="admin" {{ old('role') === 'admin' ? 'selected' : '' }}>Administrator</option>
                    </select>
                </div>

                <div class="mt-6 flex items-center gap-3">
                    <a href="{{ route('admin.dashboard') }}" class="px-4 py-2 rounded-md bg-gray-600 text-white">Cancel</a>
                    <button type="submit" class="px-4 py-2 rounded-md bg-aqua text-white">Create User</button>
                </div>
            </form>
        </div>
    </div>
@endsection