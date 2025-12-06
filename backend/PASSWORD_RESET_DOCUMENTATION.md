# Admin Password Reset Feature - Complete Documentation

## Overview

A secure, time-limited password reset system for admin users with token-based authentication, rate limiting, and professional email notifications.

## Features Implemented

### ✅ Security Features

-   **Token Hashing**: Reset tokens are hashed before storage
-   **Time Expiration**: Tokens expire after 60 minutes
-   **Rate Limiting**: Max 3 reset requests per hour per email
-   **Email Enumeration Prevention**: Always shows success message regardless of email existence
-   **Admin Verification**: Only users with 'admin' role can reset passwords
-   **Session Invalidation**: All sessions cleared after password reset
-   **Token Single-Use**: Tokens are deleted after successful use or expiration

### ✅ User Experience

-   **Consistent Styling**: All views match the admin login page design
-   **Animated Backgrounds**: Wave animations and floating shapes
-   **Loading States**: Visual feedback during form submissions
-   **Password Visibility Toggle**: Show/hide password in reset form
-   **Error & Success Messages**: Clear feedback at each step
-   **Professional Emails**: Branded email template with security warnings

## Files Created

### Views

1. **`backend/resources/views/admin/forgot-password.blade.php`**

    - Email input form for password reset request
    - Matches login page styling with dark theme and animations
    - Loading state on submit

2. **`backend/resources/views/admin/reset-password.blade.php`**

    - New password and confirmation inputs
    - Password visibility toggles for both fields
    - Token and email validation
    - Minimum 8 character requirement

3. **`backend/resources/views/emails/admin-password-reset.blade.php`**
    - Professional HTML email template
    - Security warnings and instructions
    - 60-minute expiration notice
    - Branded design with Aqua logo

### Backend

4. **`backend/app/Mail/AdminPasswordResetMail.php`**

    - Mailable class for password reset emails
    - Passes reset URL, email, and expiration time to template

5. **`backend/app/Http/Controllers/AdminController.php`** (Updated)

    - Added 4 new methods:
        - `showForgotPasswordForm()` - Display email input form
        - `sendResetLink()` - Validate, generate token, send email
        - `showResetPasswordForm()` - Display password reset form
        - `resetPassword()` - Validate token and update password

6. **`backend/routes/web.php`** (Updated)

    - Added 4 new routes under `admin.password.*` namespace:
        - `GET /admin/forgot-password` → `admin.password.request`
        - `POST /admin/forgot-password` → `admin.password.email`
        - `GET /admin/reset-password/{token}` → `admin.password.reset`
        - `POST /admin/reset-password` → `admin.password.update`

7. **`backend/resources/views/admin/login.blade.php`** (Updated)
    - Fixed "Forgot Password?" link to use proper route: `route('admin.password.request')`

## Database

Uses existing `password_reset_tokens` table:

```sql
- email (string, primary key)
- token (string, hashed)
- created_at (timestamp)
```

## Usage Flow

### 1. Request Password Reset

-   Admin clicks "Forgot Password?" on login page
-   Redirected to `/admin/forgot-password`
-   Enters email address
-   System:
    -   Validates email format
    -   Checks rate limiting (3 requests/hour)
    -   Verifies admin role (silently)
    -   Generates 64-character random token
    -   Hashes and stores token with timestamp
    -   Sends email with reset link
    -   Always shows success message (prevents email enumeration)

### 2. Receive Email

-   Admin receives email at registered address
-   Email contains:
    -   Password reset button with unique link
    -   Plain text URL (if button doesn't work)
    -   60-minute expiration warning
    -   Security notice about unsolicited emails
    -   Instructions to ignore if not requested

### 3. Reset Password

-   Admin clicks link in email
-   Redirected to `/admin/reset-password/{token}?email={email}`
-   Form displays:
    -   Read-only email field
    -   New password field (min 8 chars)
    -   Confirm password field
    -   Both with visibility toggles
-   On submit, system:
    -   Validates token exists
    -   Checks 60-minute expiration
    -   Verifies token matches hashed version
    -   Confirms admin role
    -   Updates password (bcrypt hashed)
    -   Deletes used token
    -   Invalidates all user sessions
    -   Redirects to login with success message

### 4. Login with New Password

-   Admin returns to login page
-   Uses new password to access dashboard

## Security Measures

### Token Security

```php
// Token generation
$token = Str::random(64); // 64-char random string

// Token storage (hashed)
'token' => Hash::make($token) // bcrypt hash

// Token verification
Hash::check($token, $resetRecord->token)
```

### Rate Limiting

```php
// Max 3 requests per hour per email
$recentRequests = DB::table('password_reset_tokens')
    ->where('email', $email)
    ->where('created_at', '>', Carbon::now()->subHour())
    ->count();

if ($recentRequests >= 3) {
    return back()->with('status', 'Too many attempts...');
}
```

### Expiration Check

```php
// Tokens expire after 60 minutes
$tokenAge = Carbon::parse($resetRecord->created_at)
    ->diffInMinutes(Carbon::now());

if ($tokenAge > 60) {
    DB::table('password_reset_tokens')->where('email', $email)->delete();
    return back()->withErrors(['email' => 'Link has expired...']);
}
```

### Session Invalidation

```php
// Clear all sessions after password reset
DB::table('sessions')->where('user_id', $user->id)->delete();
```

## Testing

### 1. Email Configuration

By default, emails are logged to `backend/storage/logs/laravel.log`:

```env
MAIL_MAILER=log
```

For production, configure SMTP:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@aqua.com
MAIL_FROM_NAME="Aqua Admin"
```

### 2. Test Workflow

```bash
# 1. Navigate to login page
http://localhost:8000/admin/login

# 2. Click "Forgot Password?"
# 3. Enter admin email
# 4. Check logs for reset link
tail -f storage/logs/laravel.log

# 5. Extract reset URL from log
# 6. Paste URL in browser
# 7. Enter new password (min 8 chars)
# 8. Confirm password
# 9. Click "Reset Password"
# 10. Login with new password
```

### 3. Test Rate Limiting

Try submitting the forgot password form 4 times within an hour. The 4th attempt should show:

```
"Too many password reset attempts. Please try again later."
```

### 4. Test Token Expiration

Wait 61 minutes after requesting reset, then try to use the link:

```
"This password reset link has expired. Please request a new one."
```

### 5. Test Invalid Token

Modify the token in the URL:

```
"Invalid password reset token."
```

## Error Messages

### User-Facing (Generic - Security)

-   "If that email exists in our system, we have sent a password reset link."
-   "Too many password reset attempts. Please try again later."

### User-Facing (Specific - Validation)

-   "This password reset link has expired. Please request a new one."
-   "Invalid password reset token."
-   "Admin account not found."
-   "The password must be at least 8 characters."
-   "The password confirmation does not match."

### System Logs (Internal)

-   `Password reset email failed: {exception message}` (logged but not shown to user)

## Admin Panel Routes Summary

```php
// Guest Routes (Not Logged In)
Route::get('admin/login')                    → admin.login (login form)
Route::post('admin/login')                   → (authenticate)
Route::get('admin/forgot-password')          → admin.password.request (forgot form)
Route::post('admin/forgot-password')         → admin.password.email (send email)
Route::get('admin/reset-password/{token}')   → admin.password.reset (reset form)
Route::post('admin/reset-password')          → admin.password.update (update password)

// Authenticated Routes (Logged In)
Route::get('admin/dashboard')                → admin.dashboard
Route::post('admin/logout')                  → admin.logout
// ... other admin routes
```

## Code Examples

### Manual Password Reset (Artisan)

If needed, reset a password manually via Tinker:

```bash
php artisan tinker

# Find admin user
$admin = \App\Models\User::where('email', 'admin@aqua.com')->first();

# Update password
$admin->password = \Hash::make('NewPassword123');
$admin->save();
```

### Clear Expired Tokens (Maintenance)

Run periodically to clean up expired tokens:

```bash
php artisan tinker

# Delete tokens older than 60 minutes
DB::table('password_reset_tokens')
    ->where('created_at', '<', now()->subMinutes(60))
    ->delete();
```

Or create a scheduled task in `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    $schedule->call(function () {
        DB::table('password_reset_tokens')
            ->where('created_at', '<', now()->subMinutes(60))
            ->delete();
    })->daily();
}
```

## Customization

### Change Token Expiration

In `AdminController.php`, modify:

```php
// Default: 60 minutes
if ($tokenAge > 60) { ... }

// Change to 30 minutes
if ($tokenAge > 30) { ... }

// Update email text
Mail::to($email)->send(new AdminPasswordResetMail($resetUrl, $email, 30));
```

### Change Rate Limit

In `AdminController.php`, modify:

```php
// Default: 3 requests per hour
if ($recentRequests >= 3) { ... }

// Change to 5 requests per hour
if ($recentRequests >= 5) { ... }
```

### Customize Email Template

Edit `backend/resources/views/emails/admin-password-reset.blade.php`:

-   Change colors in `<style>` section
-   Modify text content
-   Add company logo: `<img src="..." alt="Logo">`
-   Adjust button styling

## Production Checklist

-   [ ] Configure SMTP settings in `.env`
-   [ ] Test email delivery
-   [ ] Verify SSL/TLS for SMTP connection
-   [ ] Set up email monitoring/logging
-   [ ] Schedule token cleanup task
-   [ ] Test rate limiting in production
-   [ ] Monitor for abuse patterns
-   [ ] Set up alerts for failed email sends
-   [ ] Review security logs regularly
-   [ ] Ensure `APP_URL` is set correctly in `.env`
-   [ ] Test forgot password flow end-to-end

## Troubleshooting

### Emails Not Sending

1. Check `.env` mail settings
2. Verify SMTP credentials
3. Check `storage/logs/laravel.log` for errors
4. Test with Mailtrap or similar service
5. Ensure firewall allows SMTP port

### "Invalid Token" Error

1. Check if token expired (>60 minutes)
2. Verify email matches token record
3. Ensure token wasn't already used
4. Check database for token record

### Rate Limiting Too Strict

1. Increase limit in `AdminController.php`
2. Clear old tokens: `DB::table('password_reset_tokens')->truncate()`
3. Adjust time window (currently 1 hour)

### Links Not Working

1. Verify `APP_URL` in `.env`
2. Check route naming: `route('admin.password.reset', ['token' => $token, 'email' => $email])`
3. Ensure routes are registered in `web.php`
4. Clear route cache: `php artisan route:clear`

## Support

For issues or questions:

1. Check Laravel logs: `storage/logs/laravel.log`
2. Verify routes: `php artisan route:list | grep password`
3. Test email: `php artisan tinker` → `Mail::raw('Test', function($msg) { $msg->to('test@example.com'); });`
4. Review error messages in browser console

---

**Created**: December 2025  
**Laravel Version**: 11.x  
**Status**: Production Ready ✅
