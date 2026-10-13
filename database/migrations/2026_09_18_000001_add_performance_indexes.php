<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tiang', function (Blueprint $table) {
            $table->index('wilayah');
            $table->index('status');
            $table->index(['wilayah', 'status']);
            $table->index('kecamatan');
            $table->index('kelurahan');
        });

        Schema::table('ont', function (Blueprint $table) {
            $table->index('wilayah');
            $table->index('status');
            $table->index(['wilayah', 'status']);
            $table->index('kecamatan');
            $table->index('kelurahan');
        });

        Schema::table('user', function (Blueprint $table) {
            $table->index('username');
        });

        Schema::table('notifikasi', function (Blueprint $table) {
            $table->index('jenis');
            $table->index('kategori');
            $table->index('status');
        });

        Schema::table('wilayah', function (Blueprint $table) {
            $table->index('nama_wilayah');
        });
    }

    public function down(): void
    {
        Schema::table('tiang', function (Blueprint $table) {
            $table->dropIndex(['wilayah']);
            $table->dropIndex(['status']);
            $table->dropIndex(['wilayah', 'status']);
            $table->dropIndex(['kecamatan']);
            $table->dropIndex(['kelurahan']);
        });
        Schema::table('ont', function (Blueprint $table) {
            $table->dropIndex(['wilayah']);
            $table->dropIndex(['status']);
            $table->dropIndex(['wilayah', 'status']);
            $table->dropIndex(['kecamatan']);
            $table->dropIndex(['kelurahan']);
        });
        Schema::table('user', function (Blueprint $table) {
            try {
                $table->dropUnique(['username']);
            } catch (\Throwable $e) {
            }
            $table->dropIndex(['username']);
        });
        Schema::table('notifikasi', function (Blueprint $table) {
            $table->dropIndex(['jenis']);
            $table->dropIndex(['kategori']);
            $table->dropIndex(['status']);
        });
        Schema::table('wilayah', function (Blueprint $table) {
            $table->dropIndex(['nama_wilayah']);
        });
    }
};
