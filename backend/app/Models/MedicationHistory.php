<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicationHistory extends Model
{
    use HasFactory;

    protected $table = 'medication_history';

    protected $fillable = [
        'medication_id',
        'status',
        'time',
    ];

    protected $casts = [
        'time' => 'datetime',
    ];

    public function medication()
    {
        return $this->belongsTo(Medication::class);
    }
}
