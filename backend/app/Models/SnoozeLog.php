<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SnoozeLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reminder_type',
        'reminder_key',
        'scheduled_time',
        'snoozed_at',
        'snooze_minutes',
    ];

    protected $casts = [
        'scheduled_time' => 'datetime:H:i',
        'snoozed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
