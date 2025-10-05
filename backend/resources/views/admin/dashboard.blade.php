<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aqua Admin Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #F8F9FA;
            color: #1F2937;
            line-height: 1.6;
        }

        .header {
            background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
            color: white;
            padding: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
        }

        .logo h1 {
            font-size: 24px;
            font-weight: 700;
        }

        .logo p {
            font-size: 14px;
            opacity: 0.9;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 16px;
        }

        .btn-logout {
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }

        .btn-logout:hover {
            background: rgba(255,255,255,0.3);
        }

        .main-content {
            max-width: 1200px;
            margin: 32px auto;
            padding: 0 20px;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
        }

        .page-title {
            font-size: 28px;
            font-weight: 700;
            color: #1F2937;
        }

        .btn-primary {
            background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 24px;
            margin-bottom: 32px;
        }

        .stat-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border: 1px solid #E5E7EB;
        }

        .stat-card h3 {
            font-size: 14px;
            font-weight: 600;
            color: #6B7280;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-card .value {
            font-size: 32px;
            font-weight: 700;
            color: #1E3A8A;
        }

        .content-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border: 1px solid #E5E7EB;
            overflow: hidden;
        }

        .card-header {
            padding: 20px 24px;
            border-bottom: 1px solid #E5E7EB;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .card-title {
            font-size: 18px;
            font-weight: 600;
            color: #1F2937;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
        }

        .table th,
        .table td {
            padding: 16px 24px;
            text-align: left;
            border-bottom: 1px solid #E5E7EB;
        }

        .table th {
            background: #F9FAFB;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
        }

        .table td {
            color: #6B7280;
        }

        .table tbody tr:hover {
            background: #F9FAFB;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-admin {
            background: #FEF3C7;
            color: #D97706;
        }

        .badge-user {
            background: #DBEAFE;
            color: #1D4ED8;
        }

        .action-buttons {
            display: flex;
            gap: 8px;
        }

        .btn-sm {
            padding: 6px 12px;
            font-size: 12px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            cursor: pointer;
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .btn-edit {
            background: #EBF8FF;
            color: #1E40AF;
        }

        .btn-edit:hover {
            background: #DBEAFE;
        }

        .btn-delete {
            background: #FEF2F2;
            color: #DC2626;
        }

        .btn-delete:hover {
            background: #FEE2E2;
        }

        .alert {
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 24px;
            font-size: 14px;
        }

        .alert-success {
            background: #F0FDF4;
            color: #16A34A;
            border: 1px solid #BBF7D0;
        }

        .alert-error {
            background: #FEF2F2;
            color: #DC2626;
            border: 1px solid #FECACA;
        }

        .pagination {
            display: flex;
            justify-content: center;
            padding: 24px;
            gap: 8px;
        }

        .pagination a,
        .pagination span {
            padding: 8px 12px;
            border-radius: 6px;
            text-decoration: none;
            color: #6B7280;
            font-size: 14px;
        }

        .pagination a:hover {
            background: #F3F4F6;
        }

        .pagination .current {
            background: #1E3A8A;
            color: white;
        }

        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 16px;
                text-align: center;
            }

            .page-header {
                flex-direction: column;
                gap: 16px;
                align-items: stretch;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            .table {
                font-size: 14px;
            }

            .table th,
            .table td {
                padding: 12px 16px;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-content">
            <div class="logo">
                <h1>Aqua Admin</h1>
                <p>Health Management System</p>
            </div>
            <div class="header-actions">
                <div class="user-info">
                    <div class="user-avatar">
                        {{ substr(auth()->user()->name, 0, 1) }}
                    </div>
                    <div>
                        <div style="font-weight: 600;">{{ auth()->user()->name }}</div>
                        <div style="font-size: 12px; opacity: 0.8;">Administrator</div>
                    </div>
                </div>
                <form method="POST" action="{{ route('admin.logout') }}" style="display: inline;">
                    @csrf
                    <button type="submit" class="btn-logout">Logout</button>
                </form>
            </div>
        </div>
    </header>

    <main class="main-content">
        <div class="page-header">
            <h1 class="page-title">Dashboard</h1>
            <a href="{{ route('admin.users.create') }}" class="btn-primary">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
                Add New User
            </a>
        </div>

        @if (session('success'))
            <div class="alert alert-success">
                {{ session('success') }}
            </div>
        @endif

        @if (session('error'))
            <div class="alert alert-error">
                {{ session('error') }}
            </div>
        @endif

        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Users</h3>
                <div class="value">{{ $users->total() }}</div>
            </div>
            <div class="stat-card">
                <h3>Admin Users</h3>
                <div class="value">{{ $users->where('role', 'admin')->count() }}</div>
            </div>
            <div class="stat-card">
                <h3>Regular Users</h3>
                <div class="value">{{ $users->where('role', 'user')->count() }}</div>
            </div>
            <div class="stat-card">
                <h3>Active Today</h3>
                <div class="value">{{ $users->where('updated_at', '>=', now()->startOfDay())->count() }}</div>
            </div>
        </div>

        <div class="content-card">
            <div class="card-header">
                <h2 class="card-title">User Management</h2>
            </div>
            
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($users as $user)
                        <tr>
                            <td style="font-weight: 600; color: #1F2937;">{{ $user->name }}</td>
                            <td>{{ $user->email }}</td>
                            <td>
                                <span class="badge {{ $user->role === 'admin' ? 'badge-admin' : 'badge-user' }}">
                                    {{ $user->role }}
                                </span>
                            </td>
                            <td>{{ $user->created_at->format('M j, Y') }}</td>
                            <td>
                                <div class="action-buttons">
                                    <a href="{{ route('admin.users.edit', $user) }}" class="btn-sm btn-edit">
                                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L8.5 11.207l-3 1a.5.5 0 0 1-.65-.65l1-3L13.207.5a.5.5 0 0 1 .293-.207zM13 2.5L2.5 13H1v-1.5L11.5 1 13 2.5z"/>
                                        </svg>
                                        Edit
                                    </a>
                                    @if ($user->id !== auth()->id())
                                        <form method="POST" action="{{ route('admin.users.destroy', $user) }}" style="display: inline;" onsubmit="return confirm('Are you sure you want to delete this user?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn-sm btn-delete">
                                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5zM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84L14.962 3.5H15.5a.5.5 0 0 0 0-1h-1.004a.58.58 0 0 0-.01 0H11z"/>
                                                </svg>
                                                Delete
                                            </button>
                                        </form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 40px; color: #9CA3AF;">
                                No users found.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>

            @if ($users->hasPages())
                <div class="pagination">
                    {{ $users->links() }}
                </div>
            @endif
        </div>
    </main>
</body>
</html>