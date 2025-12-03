<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtcMedicine extends Model
{
    protected $fillable = [
        'name',
        'generic_name',
        'brand',
        'category',
        'age_group',
        'description',
        'dosage',
        'is_popular',
        'frequency',
        'recommended_times',
        'timing_instructions',
    ];

    protected $casts = [
        'is_popular' => 'boolean',
        'recommended_times' => 'array',
    ];

    /**
     * Search medicines by name, brand, or generic name
     */
    public static function search($query, $limit = 20)
    {
        return self::where('name', 'LIKE', "%{$query}%")
            ->orWhere('brand', 'LIKE', "%{$query}%")
            ->orWhere('generic_name', 'LIKE', "%{$query}%")
            ->orderBy('is_popular', 'desc')
            ->orderBy('name', 'asc')
            ->limit($limit)
            ->get();
    }
}
