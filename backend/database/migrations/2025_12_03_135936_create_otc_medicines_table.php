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
        Schema::create('otc_medicines', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('generic_name')->nullable();
            $table->string('brand')->nullable();
            $table->string('category');
            $table->string('age_group')->nullable();
            $table->text('description')->nullable();
            $table->string('dosage')->nullable();
            $table->boolean('is_popular')->default(true);
            $table->timestamps();

            // Indexes for search performance
            $table->index('name');
            $table->index('brand');
            $table->index('generic_name');
            $table->index('category');
            $table->index('age_group');
            $table->index('is_popular');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('otc_medicines');
    }
};
