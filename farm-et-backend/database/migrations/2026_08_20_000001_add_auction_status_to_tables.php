<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Modify animals table to add 'Auction' to the status enum
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE animals DROP CONSTRAINT IF EXISTS animals_status_check');
            DB::statement("ALTER TABLE animals ADD CONSTRAINT animals_status_check CHECK (status IN ('Active', 'For Sale', 'Lactating', 'Lost', 'Off Farm', 'Quarantined', 'Sold', 'Weaning', 'Auction'))");
        } else {
            DB::statement("ALTER TABLE animals MODIFY COLUMN status ENUM('Active', 'For Sale', 'Lactating', 'Lost', 'Off Farm', 'Quarantined', 'Sold', 'Weaning', 'Auction') DEFAULT 'Active'");
        }

        // 2. Add status column to crops table if it doesn't exist
        Schema::table('crops', function (Blueprint $table) {
            if (! Schema::hasColumn('crops', 'status')) {
                $table->string('status')->default('Active')->after('crop_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // For animals, we'd normally revert the enum, but it's risky if data contains 'Auction'.
        // So we leave it or write a complex rollback.

        Schema::table('crops', function (Blueprint $table) {
            if (Schema::hasColumn('crops', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
