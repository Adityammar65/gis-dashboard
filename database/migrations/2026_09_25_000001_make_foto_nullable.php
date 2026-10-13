<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }
        foreach (['foto_tiang_1', 'foto_tiang_2', 'foto_tiang_3'] as $col) {
            DB::statement("ALTER TABLE `tiang` MODIFY `{$col}` VARCHAR(255) NULL");
        }
        foreach (['foto_ont_1', 'foto_ont_2', 'foto_ont_3'] as $col) {
            DB::statement("ALTER TABLE `ont` MODIFY `{$col}` VARCHAR(255) NULL");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }
        foreach (['foto_tiang_1', 'foto_tiang_2', 'foto_tiang_3'] as $col) {
            DB::statement("ALTER TABLE `tiang` MODIFY `{$col}` VARCHAR(255) NOT NULL");
        }
        foreach (['foto_ont_1', 'foto_ont_2', 'foto_ont_3'] as $col) {
            DB::statement("ALTER TABLE `ont` MODIFY `{$col}` VARCHAR(255) NOT NULL");
        }
    }
};
