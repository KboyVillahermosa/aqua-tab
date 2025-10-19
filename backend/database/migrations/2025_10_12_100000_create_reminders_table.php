<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('type'); // 'water'|'medication'
            $table->string('title');
            $table->text('note')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->integer('interval_minutes')->nullable(); // repeat interval
            $table->boolean('enabled')->default(true);
            $table->integer('snooze_until')->nullable(); // unix timestamp
            $table->integer('missed_count')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('scheduled_at');
        });
    }

    public function down() {
        Schema::dropIfExists('reminders');
    }
};
