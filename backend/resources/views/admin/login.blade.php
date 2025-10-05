<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aqua Admin - Login</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .login-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            width: 100%;
            max-width: 400px;
            padding: 40px;
        }

        .logo {
            text-align: center;
            margin-bottom: 32px;
        }

        .logo h1 {
            color: #1E3A8A;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .logo p {
            color: #6B7280;
            font-size: 16px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            color: #374151;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }

        .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #D1D5DB;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.2s;
            background: #F9FAFB;
        }

        .form-group input:focus {
            outline: none;
            border-color: #1E3A8A;
            background: white;
            box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
        }

        .btn-primary {
            width: 100%;
            background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
            color: white;
            border: none;
            padding: 14px 16px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 8px;
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 20px rgba(30, 58, 138, 0.2);
        }

        .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }

        .alert-error {
            background: #FEF2F2;
            color: #DC2626;
            border: 1px solid #FECACA;
        }

        .alert-success {
            background: #F0FDF4;
            color: #16A34A;
            border: 1px solid #BBF7D0;
        }

        .admin-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #EBF8FF;
            color: #1E3A8A;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 0 auto 24px auto;
            width: fit-content;
        }

        .admin-badge svg {
            width: 16px;
            height: 16px;
        }

        .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #E5E7EB;
        }

        .footer p {
            color: #6B7280;
            font-size: 14px;
        }

        @media (max-width: 480px) {
            .login-container {
                padding: 24px;
            }
            
            .logo h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1>Aqua Admin</h1>
            <p>Health Management System</p>
        </div>

        <div class="admin-badge">
            <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-.257-.257A6 6 0 0118 8zM2 8a6 6 0 1110.743 5.743L12 14l-.743-.257A6 6 0 012 8zm8-2a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd"/>
            </svg>
            Administrator Access
        </div>

        @if ($errors->any())
            <div class="alert alert-error">
                {{ $errors->first() }}
            </div>
        @endif

        @if (session('status'))
            <div class="alert alert-success">
                {{ session('status') }}
            </div>
        @endif

        @if (session('error'))
            <div class="alert alert-error">
                {{ session('error') }}
            </div>
        @endif

        <form method="POST" action="{{ route('admin.login') }}">
            @csrf
            
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" value="{{ old('email') }}" required autofocus>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>

            <button type="submit" class="btn-primary">
                Sign In to Admin Panel
            </button>
        </form>

        <div class="footer">
            <p>Default admin: <strong>admin@aqua.com</strong> / <strong>admin123</strong></p>
        </div>
    </div>
</body>
</html>