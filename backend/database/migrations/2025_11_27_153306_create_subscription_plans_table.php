<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // FREE, PLUS+, PREMIUM
            $table->string('slug')->unique(); // free, plus, premium
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0); // Price in PHP
            $table->string('billing_period')->default('month'); // month, year
            $table->json('features')->nullable(); // Array of features
            $table->integer('max_medications')->nullable(); // null = unlimited
            $table->integer('max_hydration_entries')->nullable(); // null = unlimited
            $table->integer('history_days')->default(7); // Days of history
            $table->boolean('unlimited_reminders')->default(false);
            $table->boolean('advanced_scheduling')->default(false);
            $table->boolean('data_export')->default(false);
            $table->boolean('priority_support')->default(false);
            $table->boolean('smart_insights')->default(false);
            $table->boolean('offline_reminders')->default(false);
            $table->boolean('personalized_notifications')->default(false);
            $table->boolean('health_stats')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
