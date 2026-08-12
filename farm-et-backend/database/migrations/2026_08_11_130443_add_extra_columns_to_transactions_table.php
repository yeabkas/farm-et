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
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('check_number')->nullable()->after('reporting_year');
            $table->string('associated_to')->nullable()->after('check_number');
            $table->string('keywords')->nullable()->after('associated_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['check_number', 'associated_to', 'keywords']);
        });
    }
};
