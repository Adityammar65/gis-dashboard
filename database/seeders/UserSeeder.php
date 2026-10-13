<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UserModel;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        UserModel::firstOrCreate(
            ['username' => 'admin'],
            [
                'password' => Hash::make('password'),
                'remember_token' => null,
            ]
        );

        UserModel::firstOrCreate(
            ['username' => 'admin2'],
            [
                'password' => Hash::make('password2'),
                'remember_token' => null,
            ]
        );
    }
}
