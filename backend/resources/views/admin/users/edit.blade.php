<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit User - Aqua Admin</title>
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

        .back-link {
            color: white;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 6px;
            transition: all 0.2s;
        }

        .back-link:hover {
            background: rgba(255,255,255,0.3);
        }

        .main-content {
            max-width: 800px;
            margin: 32px auto;
            padding: 0 20px;
        }

        .page-header {
            margin-bottom: 32px;
        }

        .page-title {
            font-size: 28px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 8px;
        }

        .page-subtitle {
            color: #6B7280;
            font-size: 16px;
        }

        .form-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border: 1px solid #E5E7EB;
            padding: 32px;
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-group label {
            display: block;
            color: #374151;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }

        .form-group input,
        .form-group select {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #D1D5DB;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.2s;
            background: #F9FAFB;
        }

        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #1E3A8A;
            background: white;
            box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
        }

        .btn-secondary {
            background: #6B7280;
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-right: 12px;
        }

        .btn-secondary:hover {
            background: #4B5563;
        }

        .alert {
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 24px;
            font-size: 14px;
        }

        .alert-error {
            background: #FEF2F2;
            color: #DC2626;
            border: 1px solid #FECACA;
        }

        .error-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .error-list li {
            margin-bottom: 4px;
        }

        .required {
            color: #DC2626;
        }

        .help-text {
            font-size: 14px;
            color: #6B7280;
            margin-top: 4px;
        }

        .user-info {
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
        }

        .user-info h3 {
            color: #1F2937;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .user-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            font-size: 14px;
        }

        .user-meta div {
            color: #6B7280;
        }

        .user-meta strong {
            color: #1F2937;
        }

        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 16px;
                text-align: center;
            }

            .form-row {
                grid-template-columns: 1fr;
            }

            .form-card {
                padding: 24px;
            }

            .user-meta {
                grid-template-columns: 1fr;
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
            <a href="{{ route('admin.dashboard') }}" class="back-link">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                </svg>
                Back to Dashboard
            </a>
        </div>
    </header>

    <main class="main-content">
        <div class="page-header">
            <h1 class="page-title">Edit User</h1>
            <p class="page-subtitle">Update user information and permissions</p>
        </div>

        @if ($errors->any())
            <div class="alert alert-error">
                <strong>Please fix the following errors:</strong>
                <ul class="error-list">
                    @foreach ($errors->all() as $error)
                        <li>• {{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="user-info">
            <h3>User Information</h3>
            <div class="user-meta">
                <div><strong>User ID:</strong> {{ $user->id }}</div>
                <div><strong>Created:</strong> {{ $user->created_at->format('M j, Y g:i A') }}</div>
                <div><strong>Last Updated:</strong> {{ $user->updated_at->format('M j, Y g:i A') }}</div>
                <div><strong>Current Role:</strong> {{ ucfirst($user->role) }}</div>
            </div>
        </div>

        <div class="form-card">
            <form method="POST" action="{{ route('admin.users.update', $user) }}">
                @csrf
                @method('PUT')
                
                <div class="form-group">
                    <label for="name">Full Name <span class="required">*</span></label>
                    <input type="text" id="name" name="name" value="{{ old('name', $user->name) }}" required autofocus>
                </div>

                <div class="form-group">
                    <label for="email">Email Address <span class="required">*</span></label>
                    <input type="email" id="email" name="email" value="{{ old('email', $user->email) }}" required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="password">New Password</label>
                        <input type="password" id="password" name="password">
                        <div class="help-text">Leave blank to keep current password</div>
                    </div>

                    <div class="form-group">
                        <label for="password_confirmation">Confirm New Password</label>
                        <input type="password" id="password_confirmation" name="password_confirmation">
                        <div class="help-text">Required if changing password</div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="role">User Role <span class="required">*</span></label>
                    <select id="role" name="role" required>
                        <option value="user" {{ old('role', $user->role) === 'user' ? 'selected' : '' }}>Regular User</option>
                        <option value="admin" {{ old('role', $user->role) === 'admin' ? 'selected' : '' }}>Administrator</option>
                    </select>
                    @if ($user->id === auth()->id())
                        <div class="help-text" style="color: #DC2626;">Warning: You are editing your own account. Be careful not to remove your admin privileges.</div>
                    @endif
                </div>

                <div style="margin-top: 32px;">
                    <a href="{{ route('admin.dashboard') }}" class="btn-secondary">Cancel</a>
                    <button type="submit" class="btn-primary">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                        </svg>
                        Update User
                    </button>
                </div>
            </form>
        </div>
    </main>
</body>
</html>