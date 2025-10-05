@extends('layouts.auth')

@section('title', 'Admin Login')

@section('content')
    <div class="card p-8">
        <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-aqua">Aqua Admin</h1>
            <p class="text-sm text-gray-500">Health Management System</p>
        </div>

        @if ($errors->any())
            <div class="mb-4 p-3 rounded-md bg-red-50 text-red-700">{{ $errors->first() }}</div>
        @endif

        @if (session('status'))
            <div class="mb-4 p-3 rounded-md bg-green-50 text-green-700">{{ session('status') }}</div>
        @endif

        @if (session('error'))
            <div class="mb-4 p-3 rounded-md bg-red-50 text-red-700">{{ session('error') }}</div>
        @endif

        <form method="POST" action="{{ route('admin.login') }}">
            @csrf

            <div class="mb-4">
                <label class="block text-sm font-semibold mb-2">Email</label>
                <input type="email" name="email" value="{{ old('email') }}" required autofocus class="w-full px-4 py-2 border rounded-md bg-gray-50 focus:bg-white focus:border-aqua">
            </div>

            <div class="mb-4">
                <label class="block text-sm font-semibold mb-2">Password</label>
                <input type="password" name="password" required class="w-full px-4 py-2 border rounded-md bg-gray-50 focus:bg-white focus:border-aqua">
            </div>

            <button type="submit" class="w-full py-3 rounded-md bg-aqua text-white font-semibold">Sign in</button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">Default admin: <strong>admin@aqua.com</strong> / <strong>admin123</strong></p>
    </div>
@endsection