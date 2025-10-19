<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\HydrationEntry;
use App\Models\Medication;
use App\Models\MedicationHistory;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

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

    public function dashboard()
    {
        $users = User::take(5)->get();
        return view('admin.dashboard', compact('users'));
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

        return view('admin.users.show', compact(
            'user', 
            'hydrationEntries', 
            'medications', 
            'medicationHistory', 
            'notifications',
            'totalHydrationEntries',
            'totalMedicationEntries',
            'totalNotifications',
            'recentActivity'
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
        return view('admin.users.edit', compact('user'));
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|in:user,admin',
        ]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:6|confirmed']);
            $validated['password'] = Hash::make($request->password);
        }

        $user->update($validated);

        return redirect()->route('admin.dashboard')->with('success', 'User updated successfully');
    }

    public function deleteUser(User $user)
    {
        // Prevent admin from deleting themselves
        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot delete your own account');
        }

        $user->delete();
        return redirect()->route('admin.dashboard')->with('success', 'User deleted successfully');
    }

    // Health module management methods
    public function hydration()
    {
        return view('admin.hydration.index');
    }

    public function medication()
    {
        return view('admin.medication.index');
    }

    public function notifications()
    {
        return view('admin.notifications.index');
    }

    public function getDashboardStats()
    {
        try {
            // Get basic counts
            $activeHydrationUsers = HydrationEntry::where('created_at', '>=', Carbon::now()->subDays(7))
                ->distinct('user_id')
                ->count('user_id');

            $activeMedications = Medication::where('is_active', true)->count();
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
}
