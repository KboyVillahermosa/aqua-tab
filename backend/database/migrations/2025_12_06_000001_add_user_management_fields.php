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
            // Add status field (active, suspended, banned, unverified)
            $table->string('status')->default('active')->after('role');

            // Add last login tracking
            $table->timestamp('last_login_at')->nullable()->after('status');
            $table->string('last_login_ip')->nullable()->after('last_login_at');

            // Add last sync tracking
            $table->timestamp('last_sync_at')->nullable()->after('last_login_ip');

            // Add app version tracking
            $table->string('last_app_version')->nullable()->after('last_sync_at');

            // Add medical history field
            $table->longText('medical_history')->nullable()->after('age');
        });

        // Create user activity logs table
        Schema::create('user_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('activity_type'); // login, sync, app_update, etc.
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('app_version')->nullable();
            $table->text('details')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('created_at');
        });

        // Create subscription transactions table
        Schema::create('subscription_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('PHP');
            $table->string('payment_method'); // admin_grant, credit_card, etc.
            $table->string('transaction_id')->unique();
            $table->string('status'); // completed, pending, failed
            $table->boolean('auto_renewal')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_transactions');
        Schema::dropIfExists('user_activity_logs');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'last_login_at',
                'last_login_ip',
                'last_sync_at',
                'last_app_version',
                'medical_history'
            ]);
        });
    }
};
