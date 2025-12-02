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
            $table->boolean('onboarding_completed')->default(false)->after('subscription_expires_at');
            $table->string('nickname')->nullable()->after('onboarding_completed');
            $table->time('first_medication_time')->nullable()->after('nickname');
            $table->time('end_of_day_time')->nullable()->after('first_medication_time');
            $table->time('wake_up_time')->nullable()->after('end_of_day_time');
            $table->time('breakfast_time')->nullable()->after('wake_up_time');
            $table->time('lunch_time')->nullable()->after('breakfast_time');
            $table->time('dinner_time')->nullable()->after('lunch_time');
            $table->enum('climate', ['hot', 'temperate', 'cold'])->nullable()->after('dinner_time');
            $table->enum('exercise_frequency', ['rarely', 'sometimes', 'regularly', 'often'])->nullable()->after('climate');
            $table->decimal('weight', 5, 2)->nullable()->after('exercise_frequency');
            $table->string('weight_unit', 10)->default('kg')->after('weight');
            $table->integer('age')->nullable()->after('weight_unit');
            $table->string('reminder_tone')->default('default')->after('age');
            $table->boolean('notification_permissions_accepted')->default(false)->after('reminder_tone');
            $table->boolean('battery_optimization_set')->default(false)->after('notification_permissions_accepted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
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
            ]);
        });
    }
};
