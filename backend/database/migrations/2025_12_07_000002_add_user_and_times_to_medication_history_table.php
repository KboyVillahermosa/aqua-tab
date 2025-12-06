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
        Schema::table('medication_history', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('medication_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('scheduled_time')->nullable()->after('status');
            $table->timestamp('taken_time')->nullable()->after('scheduled_time');
            $table->index(['user_id', 'status']);
            $table->index(['created_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medication_history', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex(['created_at', 'status']);
            $table->dropColumn(['user_id', 'scheduled_time', 'taken_time']);
        });
    }
};
