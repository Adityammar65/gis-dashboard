<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotifikasiModel extends Model
{
    protected $table = 'notifikasi';

    protected $fillable = [
        'jenis',
        'kategori',
        'status',
        'pesan',
        'updated_by',
        'reset_request_id',
    ];
}
