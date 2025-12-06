<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }

        .content {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
        }

        .message {
            margin: 20px 0;
            line-height: 1.8;
            color: #555;
        }

        .button-container {
            text-align: center;
            margin: 40px 0;
        }

        .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: opacity 0.3s;
        }

        .button:hover {
            opacity: 0.9;
        }

        .link-fallback {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9fafb;
            border-radius: 6px;
            word-break: break-all;
        }

        .link-fallback a {
            color: #0ea5e9;
            text-decoration: none;
        }

        .warning {
            margin: 20px 0;
            padding: 15px;
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 4px;
            font-size: 14px;
            color: #92400e;
        }

        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #e5e7eb;
        }

        .footer p {
            margin: 5px 0;
        }

        .expiry-notice {
            margin: 15px 0;
            padding: 12px;
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 4px;
            font-size: 13px;
            color: #92400e;
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🌊 AQUA</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Health Management System</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                <p>Hi {{ $userName }},</p>
            </div>

            <div class="message">
                <p>We received a request to reset your AQUA password. Click the button below to create a new password:</p>
            </div>

            <!-- Reset Button -->
            <div class="button-container">
                <a href="{{ $resetUrl }}" class="button">Reset Your Password</a>
            </div>

            <!-- Fallback Link -->
            <div class="link-fallback">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Or copy this link:</p>
                <a href="{{ $resetUrl }}">{{ $resetUrl }}</a>
            </div>

            <!-- Expiry Notice -->
            <div class="expiry-notice">
                ⏱️ <strong>This link expires in {{ $expiresInMinutes }} minutes.</strong> If you didn't request this, please ignore this email.
            </div>

            <!-- Security Warning -->
            <div class="warning">
                <strong>For your security:</strong>
                <ul style="margin: 8px 0; padding-left: 20px;">
                    <li>Never share this link with anyone</li>
                    <li>AQUA staff will never ask for your password</li>
                    <li>Check that the URL starts with {{ url('/') }}</li>
                </ul>
            </div>

            <div class="message" style="margin-top: 30px; font-size: 14px; color: #999;">
                <p>If you have any questions or need assistance, please contact our support team.</p>
                <p style="margin-top: 15px;"><strong>Best regards,</strong><br>The AQUA Team</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>© {{ date('Y') }} AQUA Health Management System. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>

</html>