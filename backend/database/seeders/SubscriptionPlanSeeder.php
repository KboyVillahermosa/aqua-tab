<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'FREE',
                'slug' => 'free',
                'description' => 'Basic health tracking features',
                'price' => 0.00,
                'billing_period' => 'month',
                'features' => [
                    'Basic reminders for hydration & medication',
                    'Track up to 2 medications and daily water intake',
                    'Manual logging only',
                    '7-day activity history',
                ],
                'max_medications' => 2,
                'max_hydration_entries' => null,
                'history_days' => 7,
                'unlimited_reminders' => false,
                'advanced_scheduling' => false,
                'data_export' => false,
                'priority_support' => false,
                'smart_insights' => false,
                'offline_reminders' => false,
                'personalized_notifications' => false,
                'health_stats' => false,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'PLUS+',
                'slug' => 'plus',
                'description' => 'Enhanced features for better health management',
                'price' => 89.00,
                'billing_period' => 'month',
                'features' => [
                    'Everything in Free',
                    'Unlimited reminders',
                    'Track up to 10 medications with dosage schedules',
                    '30-day adherence history',
                    'Basic health stats & charts',
                    'Offline reminders',
                    'Personalized notification',
                ],
                'max_medications' => 10,
                'max_hydration_entries' => null,
                'history_days' => 30,
                'unlimited_reminders' => true,
                'advanced_scheduling' => false,
                'data_export' => false,
                'priority_support' => false,
                'smart_insights' => false,
                'offline_reminders' => true,
                'personalized_notifications' => true,
                'health_stats' => true,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'PREMIUM',
                'slug' => 'premium',
                'description' => 'Complete health management solution',
                'price' => 149.00,
                'billing_period' => 'month',
                'features' => [
                    'Everything in PLUS+',
                    'Unlimited medication & hydration tracking',
                    'Data export',
                    'Priority customer support',
                    'Advanced scheduling',
                    'Extended history',
                    'Smart insights & recommendations',
                ],
                'max_medications' => null, // unlimited
                'max_hydration_entries' => null, // unlimited
                'history_days' => 365,
                'unlimited_reminders' => true,
                'advanced_scheduling' => true,
                'data_export' => true,
                'priority_support' => true,
                'smart_insights' => true,
                'offline_reminders' => true,
                'personalized_notifications' => true,
                'health_stats' => true,
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
