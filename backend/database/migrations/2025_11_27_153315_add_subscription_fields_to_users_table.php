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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('current_subscription_plan_id')->nullable()->after('role')->constrained('subscription_plans')->onDelete('set null');
            $table->timestamp('subscription_expires_at')->nullable()->after('current_subscription_plan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_subscription_plan_id']);
            $table->dropColumn(['current_subscription_plan_id', 'subscription_expires_at']);
        });
    }
};
