<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auctions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('auctionable');
            $table->decimal('starting_price', 10, 2);
            $table->string('status')->default('active'); // active, ended, cancelled
            $table->timestamp('end_time');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auctions');
    }
};
