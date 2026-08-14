<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the farm_profiles table (one-to-one with users).
     */
    public function up(): void
    {
        Schema::create('farm_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->unique()
                ->constrained()
                ->onDelete('cascade');

            // Owner personal details
            $table->string('first_name');
            $table->string('last_name');

            // Farm identity
            $table->string('farm_name');

            // GIS / Location
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Preferences
            $table->enum('unit_system', [
                'metric',
                'imperial',
                'us_customary',
                'ethiopian_traditional',
                'mixed',
            ])->default('metric');
            $table->string('timezone')->default('UTC');
            $table->string('currency', 3)->default('USD');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('farm_profiles');
    }
};
