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
        Schema::create('password_reset_requests', function (Blueprint $table) {
            $table->id();
            $table->string('username')->index();
            // Hash kata sandi baru (dibuat saat permintaan, tidak pernah menyimpan plaintext)
            $table->string('password_hash');
            // pending | approved | rejected
            $table->string('status', 20)->default('pending')->index();
            $table->string('requested_ip', 45)->nullable();
            $table->string('handled_by')->nullable();
            $table->timestamp('handled_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_reset_requests');
    }
};
