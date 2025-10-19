<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Reminder;

class ReminderSeeder extends Seeder
{
    public function run()
    {
        Reminder::create([
            'user_id' => 1,
            'type' => 'water',
            'title' => 'Hydrate',
            'note' => 'Time to hydrate — 200ml suggested',
            'scheduled_at' => now()->addMinutes(10),
            'interval_minutes' => 120,
            'enabled' => true,
            'metadata' => json_encode(['suggested_ml' => 200]),
        ]);

        Reminder::create([
            'user_id' => 1,
            'type' => 'medication',
            'title' => 'Paracetamol',
            'note' => 'Take 1 Paracetamol',
            'scheduled_at' => now()->setHour(20)->setMinute(0),
            'interval_minutes' => null,
            'enabled' => true,
            'metadata' => json_encode(['dose' => '1 tablet']),
        ]);
    }
}
