<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the animals table — matches the frontend Animal type exactly.
     */
    public function up(): void
    {
        Schema::create('animals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');

            // Basic Information
            $table->string('name');
            $table->string('animal_type');
            $table->string('breed')->nullable();
            $table->enum('sex', ['Male', 'Female'])->default('Female');
            $table->decimal('age', 5, 2)->nullable(); // years

            // Status
            $table->enum('status', [
                'Active',
                'For Sale',
                'Lactating',
                'Lost',
                'Off Farm',
                'Quarantined',
                'Sold',
                'Weaning',
            ])->default('Active');

            // Physical Characteristics
            $table->enum('neutered', ['Neutered', 'Intact'])->default('Intact');
            $table->string('coloring')->nullable();
            $table->text('description')->nullable();

            // Additional Information
            $table->enum('method_acquired', [
                'Raised on Farm',
                'Purchased',
                'Gifted/Donation',
            ])->nullable();
            $table->string('veterinarian')->nullable();
            $table->decimal('mature_weight', 8, 2)->nullable(); // kg
            $table->decimal('estimated_value', 12, 2)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('animals');
    }
};
