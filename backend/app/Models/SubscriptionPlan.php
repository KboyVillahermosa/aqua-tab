<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'billing_period',
        'features',
        'max_medications',
        'max_hydration_entries',
        'history_days',
        'unlimited_reminders',
        'advanced_scheduling',
        'data_export',
        'priority_support',
        'smart_insights',
        'offline_reminders',
        'personalized_notifications',
        'health_stats',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'features' => 'array',
        'unlimited_reminders' => 'boolean',
        'advanced_scheduling' => 'boolean',
        'data_export' => 'boolean',
        'priority_support' => 'boolean',
        'smart_insights' => 'boolean',
        'offline_reminders' => 'boolean',
        'personalized_notifications' => 'boolean',
        'health_stats' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
