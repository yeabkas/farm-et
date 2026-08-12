<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the crops table — matches the frontend Crop type and CropForm exactly.
     */
    public function up(): void
    {
        Schema::create('crops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');

            // Type & Variety
            $table->string('crop_type');
            $table->string('variety_strain')->nullable();
            $table->string('botanical_name')->nullable();
            $table->text('description')->nullable();
            $table->string('internal_id')->nullable(); // SKU / short code

            // Growth Details
            $table->integer('days_to_maturity')->nullable();
            $table->boolean('is_perennial')->default(false);

            // Harvest & Economics
            $table->enum('harvest_units', [
                'kg',
                'lbs',
                'bales',
                'bunches',
                'bushels',
                'crates',
            ])->default('kg');
            $table->integer('sale_window')->nullable(); // days
            $table->decimal('estimated_value', 12, 2)->nullable(); // per harvest unit

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crops');
    }
};
