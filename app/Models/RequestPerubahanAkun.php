<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestPerubahanAkun extends Model
{
    protected $table = 'request_perubahan_akun';

    protected $fillable = [
        'password_baru',
        'tipe_request',
        'requested_by',
        'username_baru',
        'status',
        'requested_ip',
        'handled_by',
        'handled_at',
    ];

    protected $casts = [
        'handled_at' => 'datetime',
    ];

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
