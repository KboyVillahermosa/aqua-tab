@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <a href="{{ route('admin.users.create') }}" class="inline-flex items-center gap-2 bg-aqua text-white px-4 py-2 rounded-md">Add New User</a>
    </div>

    <div class="p-4 bg-white rounded shadow">
        <table class="min-w-full">
            <thead>
                <tr class="text-left text-sm text-gray-500">
                    <th class="py-2">Name</th>
                    <th class="py-2">Email</th>
                    <th class="py-2">Role</th>
                    <th class="py-2">Created</th>
                    <th class="py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($users as $user)
                    <tr class="border-t">
                        <td class="py-3 font-semibold text-gray-800">{{ $user->name }}</td>
                        <td class="py-3 text-gray-600">{{ $user->email }}</td>
                        <td class="py-3">
                            <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold {{ $user->role === 'admin' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700' }}">{{ $user->role }}</span>
                        </td>
                        <td class="py-3 text-gray-600">{{ $user->created_at->format('M j, Y') }}</td>
                        <td class="py-3">
                            <div class="flex gap-2">
                                <a href="{{ route('admin.users.edit', $user) }}" class="px-3 py-1 rounded bg-blue-50 text-blue-700 text-sm">Edit</a>
                                @if ($user->id !== auth()->id())
                                    <form method="POST" action="{{ route('admin.users.destroy', $user) }}" style="display: inline;" onsubmit="return confirm('Are you sure you want to delete this user?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="px-3 py-1 rounded bg-red-50 text-red-700 text-sm">Delete</button>
                                    </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="py-8 text-center text-gray-400">No users found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="mt-4">
            @if ($users->hasPages())
                {{ $users->links() }}
            @endif
        </div>
    </div>
@endsection