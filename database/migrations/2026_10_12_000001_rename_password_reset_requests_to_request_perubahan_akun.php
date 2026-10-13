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
        // Rename the table
        Schema::rename('password_reset_requests', 'request_perubahan_akun');

        // Rename the columns
        Schema::table('request_perubahan_akun', function (Blueprint $table) {
            $table->renameColumn('password_hash', 'password_baru');
            $table->renameColumn('request_type', 'tipe_request');
            $table->renameColumn('new_username', 'username_baru');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse column renames
        Schema::table('request_perubahan_akun', function (Blueprint $table) {
            $table->renameColumn('password_baru', 'password_hash');
            $table->renameColumn('tipe_request', 'request_type');
            $table->renameColumn('username_baru', 'new_username');
        });

        // Reverse table rename
        Schema::rename('request_perubahan_akun', 'password_reset_requests');
    }
};
