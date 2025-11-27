<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    /**
     * Get all available subscription plans
     */
    public function plans()
    {
        $plans = SubscriptionPlan::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json($plans);
    }

    /**
     * Get current user's subscription status
     */
    public function current(Request $request)
    {
        $user = $request->user();
        
        $subscription = $user->activeSubscription;
        $plan = $user->currentSubscriptionPlan;

        return response()->json([
            'plan' => $plan,
            'subscription' => $subscription,
            'expires_at' => $user->subscription_expires_at,
            'is_active' => $user->hasActiveSubscription(),
            'plan_slug' => $user->getSubscriptionPlanSlug(),
        ]);
    }

    /**
     * Subscribe to a plan
     */
    public function subscribe(Request $request)
    {
        $user = $request->user();
        
        $data = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'payment_method' => 'nullable|string',
            'payment_reference' => 'nullable|string',
        ]);

        $plan = SubscriptionPlan::findOrFail($data['plan_id']);

        // Cancel any existing active subscription
        $user->subscriptions()
            ->where('status', 'active')
            ->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

        // Create new subscription
        $startsAt = now();
        $endsAt = $plan->billing_period === 'year' 
            ? $startsAt->copy()->addYear() 
            : $startsAt->copy()->addMonth();

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'payment_method' => $data['payment_method'] ?? 'manual',
            'payment_reference' => $data['payment_reference'] ?? null,
        ]);

        // Update user's current subscription
        $user->update([
            'current_subscription_plan_id' => $plan->id,
            'subscription_expires_at' => $endsAt,
        ]);

        return response()->json([
            'message' => 'Subscription activated successfully',
            'subscription' => $subscription->load('plan'),
            'expires_at' => $endsAt,
        ], 201);
    }

    /**
     * Cancel current subscription
     */
    public function cancel(Request $request)
    {
        $user = $request->user();

        $activeSubscription = $user->activeSubscription;
        
        if (!$activeSubscription) {
            return response()->json([
                'message' => 'No active subscription found'
            ], 404);
        }

        $activeSubscription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        // Note: User keeps access until subscription_expires_at
        // To revoke immediately, set subscription_expires_at to now()

        return response()->json([
            'message' => 'Subscription cancelled successfully',
            'expires_at' => $user->subscription_expires_at,
        ]);
    }

    /**
     * Get subscription history
     */
    public function history(Request $request)
    {
        $user = $request->user();
        
        $subscriptions = $user->subscriptions()
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($subscriptions);
    }

    /**
     * Check if user can access a specific feature
     */
    public function checkFeature(Request $request, string $feature)
    {
        $user = $request->user();
        
        return response()->json([
            'feature' => $feature,
            'has_access' => $user->canAccessFeature($feature),
            'plan' => $user->currentSubscriptionPlan,
        ]);
    }
}
