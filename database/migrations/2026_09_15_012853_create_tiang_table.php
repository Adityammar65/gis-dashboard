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
        Schema::create('tiang', function (Blueprint $table) {
            $table->id();
            $table->string('kode_tiang')->unique();
            $table->string('wilayah');
            $table->string('kecamatan');
            $table->string('kelurahan');
            $table->text('deskripsi_tiang');
            $table->string('foto_tiang_1');
            $table->string('foto_tiang_2');
            $table->string('foto_tiang_3');
            $table->string('latitude');
            $table->string('longitude');
            $table->string('nama_petugas');
            $table->string('updated_by')->nullable();
            $table->enum(
                'status',
                [
                    'aktif',
                    'nonaktif'
                ]
            )->default('aktif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tiang');
    }
};
