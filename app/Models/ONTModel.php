<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ONTModel extends Model
{
    protected $table = 'ont';

    protected $fillable = [
        'kode_ont',
        'wilayah',
        'kecamatan',
        'kelurahan',
        'deskripsi_ont',
        'foto_ont_1',
        'foto_ont_2',
        'foto_ont_3',
        'foto_ont_4',
        'foto_ont_5',
        'latitude',
        'longitude',
        'nama_petugas',
        'updated_by',
        'status',
    ];

    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->updated_by) && function_exists('session')) {
                try {
                    $model->updated_by = session('username', $model->updated_by);
                } catch (\Throwable $e) {
                }
            }
        });

        static::updating(function ($model) {
            if (function_exists('session')) {
                try {
                    $username = session('username');
                    if (!empty($username)) {
                        $model->updated_by = $username;
                    }
                } catch (\Throwable $e) {
                }
            }
        });
    }
}
