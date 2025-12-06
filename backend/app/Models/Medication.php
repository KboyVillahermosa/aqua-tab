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
        'active',
    ];

    protected $casts = [
        'times' => 'array',
        'reminder' => 'boolean',
        'active' => 'boolean',
    ];

    public function history()
    {
        return $this->hasMany(MedicationHistory::class);
    }
}
