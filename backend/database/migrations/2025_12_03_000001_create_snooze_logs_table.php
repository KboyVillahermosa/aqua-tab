<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('snooze_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('reminder_type'); // hydration|medication|general
            $table->string('reminder_key')->nullable(); // identifier for specific reminder
            $table->time('scheduled_time')->nullable();
            $table->timestamp('snoozed_at');
            $table->unsignedInteger('snooze_minutes')->default(10);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('snooze_logs');
    }
};
