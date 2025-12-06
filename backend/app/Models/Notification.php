<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'scheduled_time',
        'status',
        'opened_at',
        'actioned_at',
        'error_message',
        'data',
        'completed_at',
        'missed_at',
    ];

    protected $casts = [
        'scheduled_time' => 'datetime',
        'opened_at' => 'datetime',
        'actioned_at' => 'datetime',
        'completed_at' => 'datetime',
        'missed_at' => 'datetime',
        'data' => 'array',
    ];

    /**
     * Get the user that owns the notification
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for hydration notifications
     */
    public function scopeHydration($query)
    {
        return $query->where('type', 'hydration');
    }

    /**
     * Scope for medication notifications
     */
    public function scopeMedication($query)
    {
        return $query->where('type', 'medication');
    }

    /**
     * Scope for scheduled notifications
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope for completed notifications
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for missed notifications
     */
    public function scopeMissed($query)
    {
        return $query->where('status', 'missed');
    }

    /**
     * Check if notification is overdue
     */
    public function isOverdue()
    {
        return $this->scheduled_time < now() && $this->status === 'scheduled';
    }

    /**
     * Get time until scheduled time
     */
    public function getTimeUntilScheduledAttribute()
    {
        $now = now();
        $scheduled = $this->scheduled_time;

        if ($scheduled < $now) {
            return null; // Already passed
        }

        $diff = $scheduled->diffInMinutes($now);

        if ($diff < 60) {
            return $diff . ' minutes';
        } elseif ($diff < 1440) { // Less than 24 hours
            return floor($diff / 60) . ' hours';
        } else {
            return floor($diff / 1440) . ' days';
        }
    }
}
