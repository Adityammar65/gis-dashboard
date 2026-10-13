<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class WilayahModel extends Model
{
    protected $table = 'wilayah';

    protected $fillable = [
        'nama_wilayah',
        'kode_wilayah'
    ];

    protected static function booted()
    {
        $clearCache = function ($model) {
            Cache::forget('wilayah:list');
            if ($model->id) {
                Cache::forget('wilayah:' . $model->id);
            }
            if ($model->nama_wilayah) {
                Cache::forget('wilayah:name:' . strtolower($model->nama_wilayah));
            }
            // clear old name on update
            if ($model->isDirty('nama_wilayah') && $model->getOriginal('nama_wilayah')) {
                Cache::forget('wilayah:name:' . strtolower($model->getOriginal('nama_wilayah')));
            }
        };

        static::saved($clearCache);
        static::deleted($clearCache);
    }
}
