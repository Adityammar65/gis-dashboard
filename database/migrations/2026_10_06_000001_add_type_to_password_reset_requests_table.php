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
        Schema::table('password_reset_requests', function (Blueprint $table) {
            $table->string('password_hash')->nullable()->change();
            $table->string('request_type', 20)->default('password_reset')->after('password_hash')->index();
            $table->string('requested_by')->nullable()->after('request_type')->index();
            $table->string('new_username')->nullable()->after('requested_by');
        });

        // Backfill existing rows: requested_by = username (pemohon = pemilik akun)
        try {
            \Illuminate\Support\Facades\DB::table('password_reset_requests')
                ->whereNull('requested_by')
                ->update(['requested_by' => \Illuminate\Support\Facades\DB::raw('username')]);
        } catch (\Throwable $e) {
            // abaikan jika gagal backfill, kolom tetap nullable
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('password_reset_requests', function (Blueprint $table) {
            $table->dropColumn(['request_type', 'requested_by', 'new_username']);
        });
    }
};
