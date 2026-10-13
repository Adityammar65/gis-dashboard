<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('request_perubahan_akun')
            ->whereNull('requested_by')
            ->update(['requested_by' => DB::raw('username')]);

        Schema::table('request_perubahan_akun', function (Blueprint $table) {
            $table->dropColumn('username');
        });
    }

    public function down(): void
    {
        Schema::table('request_perubahan_akun', function (Blueprint $table) {
            $table->string('username')->nullable()->index()->after('id');
        });

        DB::table('request_perubahan_akun')
            ->whereNull('username')
            ->update(['username' => DB::raw('requested_by')]);
    }
};
