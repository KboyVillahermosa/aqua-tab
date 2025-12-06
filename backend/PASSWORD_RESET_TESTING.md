# Password Reset Testing Guide

## Quick Start Testing

### 1. Check Routes

```powershell
cd backend
php artisan route:list --name=password
```

Expected output:

```
admin.password.request  | GET|HEAD  | admin/forgot-password
admin.password.email    | POST      | admin/forgot-password
admin.password.reset    | GET|HEAD  | admin/reset-password/{token}
admin.password.update   | POST      | admin/reset-password
```

### 2. Create Test Admin User (if needed)

```powershell
php artisan tinker
```

Then run:

```php
$admin = new \App\Models\User();
$admin->name = 'Test Admin';
$admin->email = 'admin@aqua.com';
$admin->password = \Hash::make('password123');
$admin->role = 'admin';
$admin->save();
exit;
```

### 3. Start Development Server

```powershell
php artisan serve
```

### 4. Test Workflow

#### Step 1: Access Forgot Password Page

Open browser: `http://localhost:8000/admin/login`
Click "Forgot Password?" link

#### Step 2: Submit Email

Enter: `admin@aqua.com`
Click "Send Reset Link"

#### Step 3: Check Email in Logs

```powershell
# In a new terminal
Get-Content -Path storage\logs\laravel.log -Tail 100 -Wait
```

Look for:

```
Local: Password Reset Request
To: admin@aqua.com
Reset URL: http://localhost:8000/admin/reset-password/{TOKEN}?email=admin@aqua.com
```

#### Step 4: Extract and Visit Reset Link

Copy the reset URL from logs
Paste in browser

#### Step 5: Set New Password

-   Enter new password (min 8 chars): `newpassword123`
-   Confirm password: `newpassword123`
-   Click "Reset Password"

#### Step 6: Login

Should redirect to login page with success message
Login with:

-   Email: `admin@aqua.com`
-   Password: `newpassword123`

## Testing Security Features

### Test Rate Limiting

Run 4 times quickly:

```powershell
for ($i=1; $i -le 4; $i++) {
    Invoke-WebRequest -Uri "http://localhost:8000/admin/forgot-password" `
        -Method POST `
        -Body @{_token=(Invoke-WebRequest "http://localhost:8000/admin/forgot-password").Content -match 'csrf-token" content="([^"]+)"' | Out-Null; $Matches[1]; email='admin@aqua.com'} `
        -ContentType "application/x-www-form-urlencoded"
    Write-Host "Request $i completed"
    Start-Sleep -Seconds 1
}
```

4th request should show: "Too many password reset attempts"

### Test Token Expiration

```powershell
php artisan tinker
```

```php
// Create an expired token
DB::table('password_reset_tokens')->insert([
    'email' => 'admin@aqua.com',
    'token' => \Hash::make('expired-token-12345'),
    'created_at' => now()->subHours(2)
]);
exit;
```

Visit: `http://localhost:8000/admin/reset-password/expired-token-12345?email=admin@aqua.com`

Should show: "This password reset link has expired"

### Test Invalid Token

Visit: `http://localhost:8000/admin/reset-password/invalid-token-99999?email=admin@aqua.com`

Should show: "Invalid password reset token"

### Test Non-Admin Email

Try submitting forgot password with non-admin email:

```
user@example.com
```

Should still show success message (security: don't reveal if email exists)
But no email will be sent

## Database Inspection

### Check Token Storage

```powershell
php artisan tinker
```

```php
// View all reset tokens
DB::table('password_reset_tokens')->get();

// View specific token
DB::table('password_reset_tokens')->where('email', 'admin@aqua.com')->first();

// Count recent requests
DB::table('password_reset_tokens')
    ->where('email', 'admin@aqua.com')
    ->where('created_at', '>', now()->subHour())
    ->count();

exit;
```

### Clear All Tokens

```powershell
php artisan tinker
```

```php
DB::table('password_reset_tokens')->truncate();
exit;
```

## Troubleshooting

### Issue: "Route [admin.password.request] not defined"

**Solution:**

```powershell
php artisan route:clear
php artisan config:clear
php artisan cache:clear
```

### Issue: Emails not appearing in logs

**Solution:**

1. Check `.env`: `MAIL_MAILER=log`
2. Check log file exists: `storage/logs/laravel.log`
3. Check permissions:

```powershell
# If on Linux/Mac
chmod -R 775 storage
```

### Issue: "SQLSTATE[23000]: Integrity constraint violation"

**Solution:**

```powershell
php artisan tinker
```

```php
// Delete existing token
DB::table('password_reset_tokens')->where('email', 'admin@aqua.com')->delete();
exit;
```

### Issue: Page styles not loading

**Solution:**
Check if `layouts.auth` blade layout exists:

```powershell
Get-ChildItem -Path resources\views\layouts -Filter auth.blade.php -Recurse
```

If not, create it or adjust the `@extends('layouts.auth')` to your layout file.

## Performance Testing

### Load Test Reset Requests

```powershell
# Test 10 rapid requests (should trigger rate limiting)
1..10 | ForEach-Object {
    Start-Job -ScriptBlock {
        Invoke-WebRequest -Uri "http://localhost:8000/admin/forgot-password" `
            -Method GET
    }
}

Get-Job | Wait-Job | Receive-Job
```

### Check Database Performance

```powershell
php artisan tinker
```

```php
// Measure token creation time
$start = microtime(true);
DB::table('password_reset_tokens')->insert([
    'email' => 'test@example.com',
    'token' => \Hash::make(\Str::random(64)),
    'created_at' => now()
]);
$end = microtime(true);
echo "Token creation took: " . ($end - $start) . " seconds\n";

// Cleanup
DB::table('password_reset_tokens')->where('email', 'test@example.com')->delete();
exit;
```

## Production Testing Checklist

-   [ ] Test with real SMTP server
-   [ ] Verify email deliverability
-   [ ] Test on mobile devices
-   [ ] Test with different browsers
-   [ ] Verify SSL/HTTPS links in email
-   [ ] Test rate limiting under load
-   [ ] Monitor email send failures
-   [ ] Test token expiration timing
-   [ ] Verify admin role restriction
-   [ ] Test password strength validation
-   [ ] Check error message consistency
-   [ ] Verify session invalidation
-   [ ] Test "back to login" links
-   [ ] Verify loading states work
-   [ ] Test accessibility (screen readers)

## Automated Testing (Optional)

Create a test file `tests/Feature/AdminPasswordResetTest.php`:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdminPasswordResetTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function admin_can_view_forgot_password_page()
    {
        $response = $this->get(route('admin.password.request'));
        $response->assertStatus(200);
        $response->assertViewIs('admin.forgot-password');
    }

    /** @test */
    public function admin_receives_reset_link_email()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        Mail::fake();

        $this->post(route('admin.password.email'), [
            'email' => $admin->email
        ]);

        Mail::assertSent(AdminPasswordResetMail::class);
    }

    /** @test */
    public function non_admin_does_not_receive_reset_link()
    {
        $user = User::factory()->create(['role' => 'user']);

        Mail::fake();

        $this->post(route('admin.password.email'), [
            'email' => $user->email
        ]);

        Mail::assertNotSent(AdminPasswordResetMail::class);
    }

    /** @test */
    public function password_can_be_reset_with_valid_token()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email' => $admin->email,
            'token' => Hash::make($token),
            'created_at' => now()
        ]);

        $response = $this->post(route('admin.password.update'), [
            'token' => $token,
            'email' => $admin->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ]);

        $response->assertRedirect(route('admin.login'));
        $this->assertTrue(Hash::check('newpassword123', $admin->fresh()->password));
    }

    /** @test */
    public function expired_token_cannot_reset_password()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email' => $admin->email,
            'token' => Hash::make($token),
            'created_at' => now()->subHours(2)
        ]);

        $response = $this->post(route('admin.password.update'), [
            'token' => $token,
            'email' => $admin->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ]);

        $response->assertSessionHasErrors('email');
    }
}
```

Run tests:

```powershell
php artisan test --filter AdminPasswordResetTest
```

---

**Last Updated**: December 2025  
**Status**: Ready for Testing ✅
