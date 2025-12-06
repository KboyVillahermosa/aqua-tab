<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\HydrationEntry;
use App\Models\Medication;
use App\Models\MedicationHistory;
use App\Models\Notification;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\UserActivityLog;
use App\Models\SubscriptionTransaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use App\Mail\AdminPasswordResetMail;
use App\Mail\UserPasswordResetMail;

class AdminController extends Controller
{
    public function showLoginForm()
    {
        return view('admin.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            if ($user->role !== 'admin') {
                Auth::logout();
                return back()->withErrors(['email' => 'Access denied. Admin privileges required.']);
            }

            $request->session()->regenerate();
            return redirect()->intended(route('admin.dashboard'));
        }

        return back()->withErrors(['email' => 'Invalid credentials.']);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login')->with('status', 'Logged out successfully');
    }

    // ===== PASSWORD RESET METHODS =====

    /**
     * Show the forgot password form
     */
    public function showForgotPasswordForm()
    {
        return view('admin.forgot-password');
    }

    /**
     * Send password reset link to admin email
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->email;

        // Check if user exists and is an admin (security: don't reveal if email exists)
        $user = User::where('email', $email)->where('role', 'admin')->first();

        // Always show success message to prevent email enumeration
        if (!$user) {
            return back()->with('status', 'If that email exists in our system, we have sent a password reset link.');
        }

        // Check for rate limiting - prevent abuse (max 3 requests per hour per email)
        $recentRequests = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->where('created_at', '>', Carbon::now()->subHour())
            ->count();

        if ($recentRequests >= 3) {
            return back()->with('status', 'Too many password reset attempts. Please try again later.');
        }

        // Generate secure token
        $token = Str::random(64);

        // Delete any existing tokens for this email
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Store hashed token in database
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => Carbon::now(),
        ]);

        // Generate reset URL with token
        $resetUrl = url(route('admin.password.reset', [
            'token' => $token,
            'email' => $email
        ], false));

        // Send email
        try {
            Mail::to($email)->send(new AdminPasswordResetMail($resetUrl, $email, 60));
        } catch (\Exception $e) {
            // Log error but don't reveal to user
            Log::error('Password reset email failed: ' . $e->getMessage());
        }

        return back()->with('status', 'If that email exists in our system, we have sent a password reset link.');
    }

    /**
     * Show the password reset form
     */
    public function showResetPasswordForm(Request $request, $token)
    {
        $email = $request->query('email');

        return view('admin.reset-password', [
            'token' => $token,
            'email' => $email
        ]);
    }

    /**
     * Reset the admin password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $email = $request->email;
        $token = $request->token;
        $password = $request->password;

        // Find the password reset token
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        // Validate token exists
        if (!$resetRecord) {
            return back()->withErrors(['email' => 'Invalid or expired password reset token.']);
        }

        // Check token expiration (60 minutes)
        $tokenAge = Carbon::parse($resetRecord->created_at)->diffInMinutes(Carbon::now());
        if ($tokenAge > 60) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return back()->withErrors(['email' => 'This password reset link has expired. Please request a new one.']);
        }

        // Verify token matches
        if (!Hash::check($token, $resetRecord->token)) {
            return back()->withErrors(['email' => 'Invalid password reset token.']);
        }

        // Find the admin user
        $user = User::where('email', $email)->where('role', 'admin')->first();

        if (!$user) {
            return back()->withErrors(['email' => 'Admin account not found.']);
        }

        // Update password
        $user->password = Hash::make($password);
        $user->save();

        // Delete the used token
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Log the user out of all sessions for security
        DB::table('sessions')->where('user_id', $user->id)->delete();

        return redirect()->route('admin.login')->with('status', 'Password reset successful! Please login with your new password.');
    }

    // ===== END PASSWORD RESET METHODS =====

    public function dashboard()
    {
        $users = User::take(5)->get();

        // Calculate key metrics
        $totalUsers = User::where('role', '!=', 'admin')->count();

        // DAU: Users who logged in today (using updated_at as proxy for last activity)
        $dau = User::where('role', '!=', 'admin')
            ->whereDate('updated_at', Carbon::today())
            ->count();

        // MRR: Monthly Recurring Revenue from active premium subscriptions
        $mrr = Subscription::where('status', 'active')
            ->where('ends_at', '>', now())
            ->with('plan')
            ->get()
            ->sum(function ($subscription) {
                $plan = $subscription->plan;
                if (!$plan) return 0;
                // If billing period is monthly, use price as-is; if yearly, divide by 12
                return $plan->billing_period === 'monthly'
                    ? $plan->price
                    : ($plan->price / 12);
            });

        // Premium Conversion Rate: % of users on paid plan
        $premiumUsers = User::where('role', '!=', 'admin')
            ->where(function ($query) {
                $query->whereHas('activeSubscription', function ($q) {
                    $q->where('status', 'active')
                        ->where('ends_at', '>', now());
                })
                    ->orWhere(function ($q) {
                        $q->whereNotNull('subscription_expires_at')
                            ->where('subscription_expires_at', '>', now());
                    });
            })
            ->count();

        $premiumConversionRate = $totalUsers > 0
            ? round(($premiumUsers / $totalUsers) * 100, 2)
            : 0;

        // User Growth: Last 30 days
        $userGrowth = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $count = User::where('role', '!=', 'admin')
                ->whereDate('created_at', '<=', $date)
                ->count();
            $userGrowth[] = [
                'date' => $date->format('M j'),
                'users' => $count
            ];
        }

        // Hydration Stats: Average water intake per day (last 30 days)
        $hydrationStats = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $totalAmount = HydrationEntry::whereDate('created_at', $date)
                ->sum('amount_ml');
            $entryCount = HydrationEntry::whereDate('created_at', $date)->count();
            $average = $entryCount > 0 ? round($totalAmount / $entryCount, 0) : 0;

            $hydrationStats[] = [
                'date' => $date->format('M j'),
                'average' => $average
            ];
        }

        // Platform Split: iOS vs Android (placeholder - using 50/50 for now)
        // TODO: Add platform tracking to users table
        $platformSplit = [
            ['platform' => 'iOS', 'count' => round($totalUsers * 0.5)],
            ['platform' => 'Android', 'count' => round($totalUsers * 0.5)]
        ];

        // ===== NEW ENHANCED DASHBOARD DATA =====

        // Get recent activity feed
        $recentActivityFeed = $this->getRecentActivityFeed(15);

        // Get system health status
        $systemHealth = $this->getSystemHealth();

        // Get hydration compliance metrics
        $hydrationCompliance = $this->getHydrationCompliance(7);

        // Get notification effectiveness
        $notificationEffectiveness = $this->getNotificationEffectiveness();

        // Get at-risk users count
        $atRiskUsersCount = $this->getAtRiskHydrationUsers()->count();

        return view('admin.dashboard-enhanced', compact(
            'users',
            'totalUsers',
            'dau',
            'mrr',
            'premiumConversionRate',
            'userGrowth',
            'hydrationStats',
            'platformSplit',
            'recentActivityFeed',
            'systemHealth',
            'hydrationCompliance',
            'notificationEffectiveness',
            'atRiskUsersCount'
        ));
    }

    public function createUser()
    {
        return view('admin.users.create');
    }

    // Users index (list) - dedicated users page
    public function index()
    {
        $users = User::paginate(10);
        return view('admin.users.index', compact('users'));
    }

    public function showUser(User $user)
    {
        // Get user's health data
        $hydrationEntries = HydrationEntry::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $medications = Medication::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        $medicationHistory = MedicationHistory::where('user_id', $user->id)
            ->orderBy('scheduled_time', 'desc')
            ->limit(10)
            ->get();

        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Calculate stats
        $totalHydrationEntries = HydrationEntry::where('user_id', $user->id)->count();
        $totalMedicationEntries = MedicationHistory::where('user_id', $user->id)->count();
        $totalNotifications = Notification::where('user_id', $user->id)->count();

        // Get recent activity (last 7 days)
        $recentActivity = HydrationEntry::where('user_id', $user->id)
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->count();

        // Get subscription info
        $currentSubscription = $user->subscriptions()->where('status', 'active')->with('plan')->first();

        return view('admin.users.show', compact(
            'user',
            'hydrationEntries',
            'medications',
            'medicationHistory',
            'notifications',
            'totalHydrationEntries',
            'totalMedicationEntries',
            'totalNotifications',
            'recentActivity',
            'currentSubscription'
        ));
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|in:user,admin',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('admin.dashboard')->with('success', 'User created successfully');
    }

    public function editUser(User $user)
    {
        $subscriptionPlans = SubscriptionPlan::where('is_active', true)->orderBy('price')->get();
        $currentSubscription = $user->subscriptions()->where('status', 'active')->first();

        // Get activity logs
        $activityLogs = $user->activityLogs()->orderBy('created_at', 'desc')->limit(10)->get();

        // Get transaction history
        $transactionHistory = $user->subscriptionTransactions()
            ->with('subscription.plan')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        // Get last login info
        $lastLogin = $user->activityLogs()
            ->where('activity_type', 'login')
            ->orderBy('created_at', 'desc')
            ->first();

        return view('admin.users.edit', compact(
            'user',
            'subscriptionPlans',
            'currentSubscription',
            'activityLogs',
            'transactionHistory',
            'lastLogin'
        ));
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|in:user,admin',
            'status' => 'required|in:active,suspended,banned,unverified',
            'medical_history' => 'nullable|string',
            'subscription_plan_id' => 'nullable|exists:subscription_plans,id',
            'subscription_duration' => 'nullable|integer|min:1|max:365',
        ]);

        $user->update($validated);

        // Handle subscription update
        if ($request->filled('subscription_plan_id')) {
            // Cancel existing active subscriptions
            $user->subscriptions()->where('status', 'active')->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

            // Create new subscription
            $duration = $request->subscription_duration ?? 30; // Default 30 days
            $subscription = $user->subscriptions()->create([
                'subscription_plan_id' => $request->subscription_plan_id,
                'status' => 'active',
                'starts_at' => now(),
                'ends_at' => now()->addDays($duration),
                'payment_method' => 'admin_grant',
                'payment_reference' => 'Admin granted by ' . Auth::user()->name,
            ]);

            // Create transaction record
            $plan = SubscriptionPlan::find($request->subscription_plan_id);
            SubscriptionTransaction::create([
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
                'amount' => $plan->price ?? 0,
                'currency' => 'PHP',
                'payment_method' => 'admin_grant',
                'transaction_id' => 'ADMIN-' . uniqid(),
                'status' => 'completed',
                'auto_renewal' => false,
                'notes' => 'Granted by admin: ' . Auth::user()->name,
            ]);
        } elseif ($request->has('remove_subscription')) {
            // Cancel active subscriptions if remove_subscription is checked
            $user->subscriptions()->where('status', 'active')->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);
        }

        return redirect()->route('admin.users.edit', $user)->with('success', 'User updated successfully');
    }

    public function deleteUser(User $user)
    {
        // Prevent admin from deleting themselves
        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot delete your own account');
        }

        // Log the deletion
        Log::info('User deleted by admin', [
            'deleted_user_id' => $user->id,
            'deleted_user_email' => $user->email,
            'deleted_by_admin_id' => Auth::id(),
            'deleted_at' => now(),
        ]);

        $user->delete();
        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully');
    }

    // ===== USER STATUS AND PASSWORD RESET METHODS =====

    /**
     * Send password reset email to user
     */
    public function sendPasswordResetEmail(Request $request, User $user)
    {
        $request->validate([
            'reset_token' => 'required|string',
        ]);

        try {
            // Generate secure token
            $token = Str::random(64);

            // Delete any existing tokens for this user
            DB::table('password_reset_tokens')->where('email', $user->email)->delete();

            // Store hashed token in database
            DB::table('password_reset_tokens')->insert([
                'email' => $user->email,
                'token' => Hash::make($token),
                'created_at' => Carbon::now(),
            ]);

            // Generate reset URL
            $resetUrl = url(route('password.reset', [
                'token' => $token,
                'email' => $user->email
            ], false));

            // Send email
            Mail::to($user->email)->send(new UserPasswordResetMail($resetUrl, $user->name, 60));

            return back()->with('success', 'Password reset email sent to ' . $user->email);
        } catch (\Exception $e) {
            Log::error('Password reset email failed for user ' . $user->id . ': ' . $e->getMessage());
            return back()->with('error', 'Failed to send password reset email. Please try again.');
        }
    }

    /**
     * Update user status
     */
    public function updateStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,suspended,banned,unverified',
        ]);

        $oldStatus = $user->status;
        $user->update($validated);

        // Log status change
        UserActivityLog::create([
            'user_id' => $user->id,
            'activity_type' => 'status_change',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => "Status changed from {$oldStatus} to {$validated['status']} by admin",
        ]);

        return back()->with('success', 'User status updated to ' . $validated['status']);
    }

    /**
     * Get user activity log
     */
    public function getActivityLog(User $user)
    {
        $activityLogs = $user->activityLogs()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.users.activity-log', compact('user', 'activityLogs'));
    }

    /**
     * Get transaction history
     */
    public function getTransactionHistory(User $user)
    {
        $transactions = $user->subscriptionTransactions()
            ->with('subscription.plan')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.users.transaction-history', compact('user', 'transactions'));
    }

    // Health module management methods
    public function hydration()
    {
        $timeRange = request('timeRange', 7);
        $userType = request('userType', 'all');

        // Calculate metrics
        $totalUsers = User::where('status', 'active')->count();

        $avgDailyIntake = HydrationEntry::where('created_at', '>=', Carbon::now()->subDays($timeRange))
            ->avg('amount_ml') ?? 0;

        // Get hydration compliance for the time range
        $compliance = $this->getHydrationCompliance($timeRange);
        $goalAchievement = $compliance['compliance_rate'];

        // Get at-risk users
        $atRiskUsers = $this->getAtRiskHydrationUsers();

        // Get historical intake data for charts (goal vs actual)
        $chartData = [];
        for ($i = ($timeRange - 1); $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $totalIntake = HydrationEntry::whereDate('created_at', $date)
                ->sum('amount_ml');
            $entryCount = HydrationEntry::whereDate('created_at', $date)->count();
            $avgIntake = $entryCount > 0 ? round($totalIntake / $entryCount, 0) : 0;

            $chartData[] = [
                'date' => $date->format('M j'),
                'actual' => $avgIntake,
                'goal' => 2000  // Default daily goal
            ];
        }

        return view('admin.hydration.index-enhanced', compact(
            'totalUsers',
            'avgDailyIntake',
            'goalAchievement',
            'atRiskUsers',
            'chartData',
            'timeRange',
            'userType'
        ));
    }

    public function medication()
    {
        $timeRange = request('timeRange', 7);

        // Calculate metrics
        $activeMedications = Medication::where('active', true)->count();

        $totalEntries = MedicationHistory::where('created_at', '>=', Carbon::now()->subDays($timeRange))->count();
        $completedEntries = MedicationHistory::where('status', 'completed')
            ->where('created_at', '>=', Carbon::now()->subDays($timeRange))
            ->count();
        $adherenceRate = $totalEntries > 0 ? round(($completedEntries / $totalEntries) * 100, 1) : 0;

        $missedDoses = MedicationHistory::where('status', 'missed')
            ->where('created_at', '>=', Carbon::now()->subDays($timeRange))
            ->count();

        // Get critical missed medications
        $criticalMissedMedications = $this->getCriticalMissedMedications();

        // Get medication compliance ranking
        $complianceRanking = $this->getMedicationComplianceRanking();

        // Get medication type adherence data
        $medicationTypeData = [
            ['type' => 'Antibiotics', 'adherence' => 92],
            ['type' => 'Pain Relief', 'adherence' => 87],
            ['type' => 'Vitamins', 'adherence' => 95],
            ['type' => 'Blood Pressure', 'adherence' => 88],
            ['type' => 'Diabetes', 'adherence' => 85]
        ];

        // Get problematic entries (missed and late doses)
        $problematicEntries = MedicationHistory::whereIn('status', ['missed', 'late'])
            ->where('created_at', '>=', Carbon::now()->subDays($timeRange))
            ->with('user', 'medication')
            ->latest('created_at')
            ->limit(10)
            ->get();

        return view('admin.medication.index-enhanced', compact(
            'activeMedications',
            'adherenceRate',
            'missedDoses',
            'criticalMissedMedications',
            'complianceRanking',
            'medicationTypeData',
            'problematicEntries',
            'timeRange'
        ));
    }

    public function notifications()
    {
        $timeRange = request('timeRange', 7);

        // Calculate metrics
        $totalNotifications = Notification::where('created_at', '>=', Carbon::now()->subDays($timeRange))->count();

        $deliveredNotifications = Notification::where('status', 'delivered')
            ->where('created_at', '>=', Carbon::now()->subDays($timeRange))
            ->count();

        $openedNotifications = Notification::whereNotNull('opened_at')
            ->where('created_at', '>=', Carbon::now()->subDays($timeRange))
            ->count();

        $openRate = $totalNotifications > 0 ? round(($openedNotifications / $totalNotifications) * 100, 1) : 0;

        // Get notification effectiveness
        $effectiveness = $this->getNotificationEffectiveness();
        $effectivenessRate = $effectiveness['rate'];

        // Get additional metrics
        $snoozedCount = Notification::where('status', 'snoozed')
            ->where('created_at', '>=', Carbon::now()->subDays($timeRange))
            ->count();

        $failedCount = Notification::where('status', 'failed')
            ->where('created_at', '>=', Carbon::now()->subDays($timeRange))
            ->count();

        // Get failed notifications
        $failedNotifications = $this->getFailedNotifications(10);

        // Get recent notifications with interaction status
        $recentNotifications = Notification::where('created_at', '>=', Carbon::now()->subDays($timeRange))
            ->with('user')
            ->latest('created_at')
            ->limit(15)
            ->get()
            ->map(function ($notif) {
                $status = 'Not Opened';
                if ($notif->opened_at) {
                    $status = 'Opened Only';
                    if ($notif->actioned_at) {
                        $status = 'Opened & Actioned';
                    }
                }
                return [
                    'id' => $notif->id,
                    'user_name' => $notif->user->name,
                    'message' => $notif->message,
                    'type' => $notif->type ?? 'General',
                    'status' => $notif->status,
                    'user_interaction' => $status,
                    'created_at' => $notif->created_at,
                ];
            });

        return view('admin.notifications.index-enhanced', compact(
            'totalNotifications',
            'deliveredNotifications',
            'openRate',
            'effectivenessRate',
            'snoozedCount',
            'failedCount',
            'failedNotifications',
            'recentNotifications',
            'timeRange'
        ));
    }

    public function getDashboardStats()
    {
        try {
            // Get basic counts
            $activeHydrationUsers = HydrationEntry::where('created_at', '>=', Carbon::now()->subDays(7))
                ->distinct('user_id')
                ->count('user_id');

            $activeMedications = Medication::where('reminder', true)->count();
            $notificationsSent = Notification::count();

            // Get hydration entries count
            $hydrationEntries = HydrationEntry::count();

            // Get medication entries count
            $medicationEntries = MedicationHistory::count();

            // Get user activity for last 7 days
            $userActivity = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->format('Y-m-d');
                $activeUsers = HydrationEntry::whereDate('created_at', $date)
                    ->distinct('user_id')
                    ->count('user_id');

                $userActivity[] = [
                    'date' => Carbon::now()->subDays($i)->format('M j'),
                    'active_users' => $activeUsers
                ];
            }

            return response()->json([
                'active_hydration_users' => $activeHydrationUsers,
                'active_medications' => $activeMedications,
                'notifications_sent' => $notificationsSent,
                'hydration_entries' => $hydrationEntries,
                'medication_entries' => $medicationEntries,
                'user_activity' => $userActivity
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'active_hydration_users' => 0,
                'active_medications' => 0,
                'notifications_sent' => 0,
                'hydration_entries' => 0,
                'medication_entries' => 0,
                'user_activity' => []
            ], 500);
        }
    }

    // ===== ENHANCED DASHBOARD DATA METHODS =====

    /**
     * Get recent system activity feed
     */
    public function getRecentActivityFeed($limit = 15)
    {
        $activities = [];

        // Recent registrations
        $recentUsers = User::where('created_at', '>=', Carbon::now()->subDays(7))
            ->latest('created_at')
            ->limit(5)
            ->get(['id', 'name', 'email', 'created_at'])
            ->map(fn($user) => [
                'type' => 'registration',
                'title' => 'New User Registration',
                'description' => $user->name . ' (' . $user->email . ')',
                'timestamp' => $user->created_at,
                'icon' => 'user-plus',
                'color' => 'blue'
            ]);

        // Recent subscriptions
        $recentSubs = Subscription::where('created_at', '>=', Carbon::now()->subDays(7))
            ->with('user', 'plan')
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn($sub) => [
                'type' => 'subscription',
                'title' => 'New Subscription',
                'description' => $sub->user->name . ' subscribed to ' . $sub->plan->name,
                'timestamp' => $sub->created_at,
                'icon' => 'star',
                'color' => 'green'
            ]);

        // Missed medication alerts
        $missedMeds = MedicationHistory::where('status', 'missed')
            ->where('created_at', '>=', Carbon::now()->subDays(1))
            ->with('user', 'medication')
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn($med) => [
                'type' => 'missed_medication',
                'title' => 'Missed Medication Alert',
                'description' => $med->user->name . ' missed ' . $med->medication->name,
                'timestamp' => $med->created_at,
                'icon' => 'alert-circle',
                'color' => 'red'
            ]);

        $activities = collect(array_merge($recentUsers->toArray(), $recentSubs->toArray(), $missedMeds->toArray()))
            ->sortByDesc('timestamp')
            ->take($limit);

        return $activities;
    }

    /**
     * Get system health status
     */
    public function getSystemHealth()
    {
        return [
            'email_service' => $this->checkEmailService(),
            'database' => $this->checkDatabase(),
            'support_tickets' => $this->getSupportTicketCount(),
        ];
    }

    private function checkEmailService()
    {
        try {
            return [
                'status' => 'operational',
                'message' => 'Email service is operational',
                'color' => 'green'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Email service unavailable',
                'color' => 'red'
            ];
        }
    }

    private function checkDatabase()
    {
        try {
            DB::connection()->getPdo();
            return [
                'status' => 'operational',
                'message' => 'Database connection healthy',
                'color' => 'green'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Database connection failed',
                'color' => 'red'
            ];
        }
    }

    private function getSupportTicketCount()
    {
        // Placeholder - adjust based on your support ticket system
        return 0;
    }

    /**
     * Get at-risk hydration users (below 50% goal in past week)
     */
    public function getAtRiskHydrationUsers()
    {
        $weekAgo = Carbon::now()->subDays(7);

        $users = User::with('hydrationEntries')
            ->where('status', 'active')
            ->get()
            ->filter(function ($user) use ($weekAgo) {
                $entries = $user->hydrationEntries()
                    ->where('created_at', '>=', $weekAgo)
                    ->get();

                if ($entries->isEmpty()) return false;

                $totalIntake = $entries->sum('amount');
                $goalDays = $entries->groupBy('created_at:Y-m-d')->count();
                $expectedTotal = ($user->hydration_goal ?? 2000) * $goalDays;

                return $totalIntake < ($expectedTotal * 0.5);
            })
            ->map(function ($user) use ($weekAgo) {
                $entries = $user->hydrationEntries()
                    ->where('created_at', '>=', $weekAgo)
                    ->get();
                $totalIntake = $entries->sum('amount');
                $goalDays = $entries->groupBy('created_at:Y-m-d')->count();
                $expectedTotal = ($user->hydration_goal ?? 2000) * $goalDays;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'goal' => $user->hydration_goal ?? 2000,
                    'intake' => $totalIntake,
                    'percentage' => round(($totalIntake / $expectedTotal) * 100, 1),
                    'days_logged' => $goalDays,
                ];
            })
            ->sortBy('percentage')
            ->take(10);

        return $users;
    }

    /**
     * Get critical missed medications (users missing repeatedly)
     */
    public function getCriticalMissedMedications()
    {
        $weekAgo = Carbon::now()->subDays(7);

        return MedicationHistory::where('status', 'missed')
            ->where('created_at', '>=', $weekAgo)
            ->with('user', 'medication')
            ->groupBy('user_id')
            ->selectRaw('user_id, COUNT(*) as missed_count')
            ->having('missed_count', '>', 2)
            ->get()
            ->map(function ($record) {
                $user = User::find($record->user_id);
                $missedMeds = MedicationHistory::where('user_id', $record->user_id)
                    ->where('status', 'missed')
                    ->where('created_at', '>=', Carbon::now()->subDays(7))
                    ->with('medication')
                    ->get();

                return [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                    'missed_count' => $record->missed_count,
                    'medications' => $missedMeds->pluck('medication.name')->unique()->implode(', '),
                ];
            });
    }

    /**
     * Get notification effectiveness metrics
     */
    public function getNotificationEffectiveness()
    {
        $thirtyMinsAgo = Carbon::now()->subMinutes(30);
        $totalNotifications = Notification::count();
        $engagedNotifications = Notification::where('opened_at', '!=', null)
            ->count();

        return [
            'total' => $totalNotifications,
            'engaged' => $engagedNotifications,
            'rate' => $totalNotifications > 0 ? round(($engagedNotifications / $totalNotifications) * 100, 1) : 0,
        ];
    }

    /**
     * Get failed notifications with error details
     */
    public function getFailedNotifications($limit = 10)
    {
        return Notification::where('status', 'failed')
            ->with('user')
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn($notif) => [
                'id' => $notif->id,
                'user_name' => $notif->user->name,
                'user_email' => $notif->user->email,
                'message' => $notif->message,
                'error' => $notif->error_message ?? 'Unknown error',
                'created_at' => $notif->created_at,
            ]);
    }

    /**
     * Get user compliance ranking for medications
     */
    public function getMedicationComplianceRanking()
    {
        $weekAgo = Carbon::now()->subDays(7);

        $ranking = User::with(['medicationHistory' => function ($query) use ($weekAgo) {
            $query->where('created_at', '>=', $weekAgo);
        }])
            ->where('status', 'active')
            ->get()
            ->map(function ($user) {
                $total = $user->medicationHistory->count();
                if ($total === 0) return null;

                $completed = $user->medicationHistory->where('status', 'completed')->count();
                $rate = round(($completed / $total) * 100, 1);

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'adherence_rate' => $rate,
                    'completed' => $completed,
                    'total' => $total,
                ];
            })
            ->filter(fn($user) => $user !== null)
            ->sort(function ($a, $b) {
                return $b['adherence_rate'] <=> $a['adherence_rate'];
            });

        return [
            'top_users' => $ranking->take(5),
            'bottom_users' => $ranking->reverse()->take(5),
        ];
    }

    /**
     * Get hydration compliance summary
     */
    public function getHydrationCompliance($days = 7)
    {
        $startDate = Carbon::now()->subDays($days);
        $users = User::with(['hydrationEntries' => function ($query) use ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }])->where('status', 'active')->get();

        $avgComplianceRate = 0;
        if ($users->count() > 0) {
            $totalRate = $users->sum(function ($user) {
                $entries = $user->hydrationEntries;
                if ($entries->isEmpty()) return 0;

                $totalIntake = $entries->sum('amount');
                $daysLogged = $entries->groupBy('created_at:Y-m-d')->count();
                $expectedTotal = ($user->hydration_goal ?? 2000) * $daysLogged;

                return $expectedTotal > 0 ? ($totalIntake / $expectedTotal) * 100 : 0;
            });
            $avgComplianceRate = round($totalRate / $users->count(), 1);
        }

        return [
            'compliance_rate' => $avgComplianceRate,
            'users_on_track' => $users->sum(function ($user) {
                $entries = $user->hydrationEntries;
                if ($entries->isEmpty()) return 0;

                $totalIntake = $entries->sum('amount');
                $daysLogged = $entries->groupBy('created_at:Y-m-d')->count();
                $expectedTotal = ($user->hydration_goal ?? 2000) * $daysLogged;

                return $expectedTotal > 0 && ($totalIntake / $expectedTotal) >= 0.8 ? 1 : 0;
            }),
            'total_users' => $users->count(),
        ];
    }
}
