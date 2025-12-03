<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'api_token',
        'role',
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'emergency_contact',
        'emergency_contact_name',
        'emergency_contact_phone',
        'current_subscription_plan_id',
        'subscription_expires_at',
        'onboarding_completed',
        'nickname',
        'first_medication_time',
        'end_of_day_time',
        'wake_up_time',
        'breakfast_time',
        'lunch_time',
        'dinner_time',
        'climate',
        'exercise_frequency',
        'weight',
        'weight_unit',
        'age',
        'reminder_tone',
        'notification_permissions_accepted',
        'battery_optimization_set',
        'hydration_goal',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'api_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'subscription_expires_at' => 'datetime',
            'onboarding_completed' => 'boolean',
            'weight' => 'decimal:2',
            'notification_permissions_accepted' => 'boolean',
            'battery_optimization_set' => 'boolean',
        ];
    }

    public function currentSubscriptionPlan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'current_subscription_plan_id');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->where('ends_at', '>', now());
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscription_expires_at && $this->subscription_expires_at->isFuture();
    }

    public function getSubscriptionPlanSlug(): string
    {
        return $this->currentSubscriptionPlan?->slug ?? 'free';
    }

    public function canAccessFeature(string $feature): bool
    {
        $plan = $this->currentSubscriptionPlan;
        if (!$plan) {
            return false; // Default to free plan
        }

        return match ($feature) {
            'unlimited_medications' => $plan->max_medications === null,
            'unlimited_hydration' => $plan->max_hydration_entries === null,
            'advanced_scheduling' => $plan->advanced_scheduling,
            'data_export' => $plan->data_export,
            'priority_support' => $plan->priority_support,
            'smart_insights' => $plan->smart_insights,
            'offline_reminders' => $plan->offline_reminders,
            'personalized_notifications' => $plan->personalized_notifications,
            'health_stats' => $plan->health_stats,
            default => false,
        };
    }
}
