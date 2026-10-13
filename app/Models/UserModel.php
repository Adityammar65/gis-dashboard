<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserModel extends Model
{
    protected $table = 'user';

    protected $fillable = [
        'username',
        'password',
        'remember_token',
    ];

    protected $hidden = [
        'password',
        'remember_token'
    ];

    protected $casts = [
        'password' => 'hashed',
    ];
}
