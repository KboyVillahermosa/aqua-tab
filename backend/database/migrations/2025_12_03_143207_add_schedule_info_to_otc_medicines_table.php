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
        Schema::table('otc_medicines', function (Blueprint $table) {
            $table->string('frequency')->nullable()->comment('once_daily, twice_daily, three_times_daily, four_times_daily, as_needed');
            $table->json('recommended_times')->nullable()->comment('Array of recommended times like ["08:00", "20:00"]');
            $table->text('timing_instructions')->nullable()->comment('e.g., "Take with food", "Before bedtime"');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('otc_medicines', function (Blueprint $table) {
            $table->dropColumn(['frequency', 'recommended_times', 'timing_instructions']);
        });
    }
};
