<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tiang', function (Blueprint $table) {
            $table->string('foto_tiang_4')->nullable()->after('foto_tiang_3');
            $table->string('foto_tiang_5')->nullable()->after('foto_tiang_4');
        });
        Schema::table('ont', function (Blueprint $table) {
            $table->string('foto_ont_4')->nullable()->after('foto_ont_3');
            $table->string('foto_ont_5')->nullable()->after('foto_ont_4');
        });
    }

    public function down(): void
    {
        Schema::table('tiang', function (Blueprint $table) {
            $table->dropColumn(['foto_tiang_4', 'foto_tiang_5']);
        });
        Schema::table('ont', function (Blueprint $table) {
            $table->dropColumn(['foto_ont_4', 'foto_ont_5']);
        });
    }
};
