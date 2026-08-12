<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Change harvest_units from a constrained ENUM to a free-form VARCHAR.
     * PostgreSQL: drop the auto-generated CHECK constraint, then widen the column.
     */
    public function up(): void
    {
        // Drop the CHECK constraint Laravel auto-creates for enum columns.
        // Convention: {table}_{column}_check
        DB::statement('ALTER TABLE crops DROP CONSTRAINT IF EXISTS crops_harvest_units_check');

        // Widen the column to a plain VARCHAR so any unit string is accepted.
        DB::statement('ALTER TABLE crops ALTER COLUMN harvest_units TYPE VARCHAR(100)');
    }

    /**
     * Reverse the migrations (no-op).
     */
    public function down(): void
    {
        // Restoring the original CHECK constraint is intentionally skipped.
    }
};
