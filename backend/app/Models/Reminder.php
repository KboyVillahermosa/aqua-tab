<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'type', 'title', 'note', 'scheduled_at', 'interval_minutes', 'enabled', 'snooze_until', 'missed_count', 'metadata'
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'enabled' => 'boolean',
        'metadata' => 'array'
    ];

    public function user() {
        return $this->belongsTo(\App\Models\User::class);
    }
}
