<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            padding: 40px 30px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 28px;
            font-weight: 600;
        }

        .content {
            padding: 40px 30px;
        }

        .content h2 {
            color: #1e293b;
            font-size: 22px;
            margin-top: 0;
            margin-bottom: 20px;
        }

        .content p {
            color: #475569;
            font-size: 16px;
            margin-bottom: 20px;
        }

        .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
        }

        .button:hover {
            transform: translateY(-2px);
        }

        .info-box {
            background: #f1f5f9;
            border-left: 4px solid #3b82f6;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
        }

        .info-box p {
            margin: 0;
            color: #475569;
            font-size: 14px;
        }

        .warning-box {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
        }

        .warning-box p {
            margin: 0;
            color: #991b1b;
            font-size: 14px;
        }

        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer p {
            color: #64748b;
            font-size: 14px;
            margin: 5px 0;
        }

        .link-text {
            color: #3b82f6;
            word-break: break-all;
            font-size: 12px;
            display: block;
            margin-top: 20px;
            padding: 12px;
            background: #f8fafc;
            border-radius: 4px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Aqua Admin Panel</h1>
        </div>

        <div class="content">
            <h2>Password Reset Request</h2>

            <p>Hello,</p>

            <p>We received a request to reset the password for your admin account associated with <strong>{{ $email }}</strong>.</p>

            <p>Click the button below to reset your password:</p>

            <div style="text-align: center;">
                <a href="{{ $resetUrl }}" class="button">Reset Password</a>
            </div>

            <div class="info-box">
                <p><strong>⏰ This link will expire in {{ $expiresInMinutes }} minutes</strong></p>
                <p>For your security, this password reset link is only valid for a limited time.</p>
            </div>

            <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
            <span class="link-text">{{ $resetUrl }}</span>

            <div class="warning-box">
                <p><strong>⚠️ Security Notice</strong></p>
                <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged. No further action is required.</p>
            </div>

            <p>For security reasons:</p>
            <ul style="color: #475569; font-size: 14px;">
                <li>Never share this link with anyone</li>
                <li>We will never ask for your password via email</li>
                <li>Make sure you're on the official Aqua admin domain</li>
            </ul>
        </div>

        <div class="footer">
            <p><strong>Aqua Admin Panel</strong></p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; {{ date('Y') }} Aqua. All rights reserved.</p>
        </div>
    </div>
</body>

</html>