<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medication_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medication_id')->constrained('medications')->onDelete('cascade');
            $table->string('status');
            $table->timestamp('time')->useCurrent();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('medication_history');
    }
};
