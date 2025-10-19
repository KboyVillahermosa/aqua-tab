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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['hydration', 'medication']);
            $table->string('title');
            $table->text('body');
            $table->timestamp('scheduled_time');
            $table->enum('status', ['scheduled', 'delivered', 'missed', 'completed'])->default('scheduled');
            $table->json('data')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('missed_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'status']);
            $table->index(['scheduled_time', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
