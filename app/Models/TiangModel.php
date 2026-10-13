<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TiangModel extends Model
{
    protected $table = 'tiang';

    protected $fillable = [
        'kode_tiang',
        'wilayah',
        'kecamatan',
        'kelurahan',
        'deskripsi_tiang',
        'foto_tiang_1',
        'foto_tiang_2',
        'foto_tiang_3',
        'foto_tiang_4',
        'foto_tiang_5',
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
