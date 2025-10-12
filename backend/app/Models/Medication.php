<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'dosage',
        'times',
        'reminder',
    ];

    protected $casts = [
        'times' => 'array',
        'reminder' => 'boolean',
    ];

    public function history()
    {
        return $this->hasMany(MedicationHistory::class);
    }
}
